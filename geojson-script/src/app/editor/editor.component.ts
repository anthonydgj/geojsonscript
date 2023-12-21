import { BehaviorSubject, Subscription, debounceTime } from 'rxjs';
import { OutputFormat, evaluate } from 'wkt-lang';

import { ChangeDetectorRef, Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { CodeViewerComponent, CodeViewerOptions } from '../code-viewer/code-viewer.component';
import { ConsoleListenerService } from '../console-listener.service';
import { Constants } from '../constants';
import { DataUtils } from '../data-utils';
import { db } from '../db';
import { JsExecutorService } from '../js-executor.service';
import { LayerManagerService } from '../layer-manager.service';
import { ThisObjectDialogComponent } from '../this-object-dialog/this-object-dialog.component';
import { UserEvent, UserEventService } from '../user-event.service';

enum Language {
	JavaScript = 'JavaScript',
	WktLang = 'WktLang',
}

@Component({
	selector: 'app-editor',
	templateUrl: './editor.component.html',
	styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnDestroy {
	public _editor: any;

	private DEFAULT_SCRIPT_NAME = 'script';
	private LANGUAGE_JAVASCRIPT = 'javascript';
	private LANGUAGE_WKTLANG = 'none';

	private eventSubscription = new Subscription();
	private editorSaveSubscription = new Subscription();
	private editorChange$ = new BehaviorSubject<void>(undefined);

	private initialValue = `// Use ctrl+enter (or command-enter on Mac) to run the script\n`;
	private exampleValue = `/*
 *   Tips:
 *   =====
 *   Use ctrl+enter (or command-enter on Mac) to run the script
 *   Double-click on the map to quickly add a temporary point layer
 *   Return a GeoJSON object to add a temporary feature layer
 *   Reference map layers by name within the script
 *   Click on a map feature to view GeoJSON data
 *   Hold shift then click-and-drag to zoom into a specific region
 */

// Print log messages
console.log('Loading Turf spatial analysis library...');

// Load libraries (uses Skypack: https://www.skypack.dev/)
const turf = await ${Constants.HELPER_NAME_IMPORT}('turf');

// Load libraries using the import statement
const { default: distance } = await import('https://unpkg.com/@turf/distance?module');

// Define helper functions
const getRandomNumberInRange = (min, max) => Math.random() * (max - min) + min;
const getRandomPoint = (props = {}) => turf.point([
  +getRandomNumberInRange(-180, 180).toFixed(6),
  +getRandomNumberInRange(-85, 85).toFixed(6)
], props);

// Reference data layers by name
let pointOfInterest;
if (this.${LayerManagerService.DEFAULT_SCRATCH_POINT_NAME}) {
  pointOfInterest = ${LayerManagerService.DEFAULT_SCRATCH_POINT_NAME};
} else {
  pointOfInterest = getRandomPoint({
    name: 'Point of Interest'
  });
}

// Generate point feature collection
const numPoints = 100;
const rangeKm = 7000;
let numPointsWithinRange = 0;
const points = Array(numPoints)
  .fill(0)
  .map(() => {
    const point = getRandomPoint();
    const d = distance(pointOfInterest, point);
    const color = (d / rangeKm * 255).toFixed(0);
    numPointsWithinRange += (d <= rangeKm ? 1 : 0);

    // Set feature style in the "style" property, which is
    // passed through as Leaflet path options: 
    // https://leafletjs.com/reference.html#path-option
    point.properties = {
      style: {
        fillColor: \`rgb(255, \${color}, \${color})\`,
        color: 'black'
      },
      distance: d
    }
    return point;
  });

console.info(\`Points within \${rangeKm}km: \${numPointsWithinRange}/\${numPoints} \`);

// Return GeoJSON to be displayed as a temporary layer on the map
return {
  type: "FeatureCollection",
  features: points.concat([pointOfInterest])
};`;

	@ViewChild('codeViewer', { static: true }) codeViewer?: CodeViewerComponent;

	@Input() preloadValue?: string;

	editorOptions: CodeViewerOptions = {
		initialValue: this.initialValue,
		monacoEditorOptions: {
			language: 'javascript',
			automaticLayout: true
		},
		captureUserEvents: true
	};

	isRunning = false;
	selectedLanguage: Language = Language.JavaScript
	availableLanguages: Language[] = Object.keys(Language).map(l => l as Language);

	private static DEFAULT_SCRIPT_FILE_NAME = 'geojsonScript';

	private scriptSaveDebounceMillis = 500;

	constructor(
		private userEventService: UserEventService,
		private jsExecutorService: JsExecutorService,
		private layerManagerService: LayerManagerService,
		private dialog: MatDialog,
		private changeDetectorRef: ChangeDetectorRef,
		private consoleListenerService: ConsoleListenerService
	) { }

	async initializeEditor() {

		// Load existing script
		if (this.preloadValue) {
			this.codeViewer?.setValue(this.preloadValue);
		} else {
			const savedScript = await db.scripts.toCollection().last();
			if (!this.preloadValue && !!savedScript && savedScript.content !== this.exampleValue) {
				this.codeViewer?.setValue(savedScript.content);
			}
		}

		// Listen for run events
		this.eventSubscription = this.userEventService.getEvents().subscribe(event => {
			if (event === UserEvent.RUN_SCRIPT) {
				this.run();
			}
		});

		// Save script changes
		this.editorSaveSubscription = this.editorChange$.asObservable().pipe(
			debounceTime(this.scriptSaveDebounceMillis)
		).subscribe(async () => {
			const script = this.getScript();
			if (script !== this.preloadValue) {
				let savedScript: string | undefined;
				if (
					!script?.trim() ||
					script.trim() === this.initialValue.trim() ||
					script.trim() === this.exampleValue.trim()
				) {
					savedScript = undefined;
				} else {
					savedScript = script;
				}

				// Save custom scripts
				if (savedScript !== undefined) {
					await db.scripts.put({
						name: this.DEFAULT_SCRIPT_NAME,
						content: savedScript
					});
				}
			}
		})
	}

	ngOnDestroy(): void {
		if (this.eventSubscription) {
			this.eventSubscription.unsubscribe();
		}
		if (this.editorSaveSubscription) {
			this.editorSaveSubscription.unsubscribe();
		}
	}

	onRun(): void {
		this.run();
	}

	onClear(): void {
		this.codeViewer?.setValue('');
	}

	onShowThisObject(): void {
		this.dialog.open(ThisObjectDialogComponent);
	}

	onDownload(): void {
		const thisObject = this.jsExecutorService.getThis();
		const args = Object.keys(thisObject);
		const argString = args.join(', ');
		const value = this.getScript();
		const lines = value.split('\n');
		const linesString = lines.map(line => `  ${line}`).join('\n')
		const scriptFile = `
async function geojsonScript(${argString}) {
${linesString}
}
`;
		const filename = EditorComponent.DEFAULT_SCRIPT_FILE_NAME;
		DataUtils.saveFile(`${filename}.js`, scriptFile);
	}

	onLoadExampleScript() {
		this.codeViewer?.setValue(this.exampleValue);
	}

	onLanguageChange() {
		const monacoEditor = this.codeViewer?.getMonacoEditorApi();
		const editor = this.codeViewer?.getMonacoEditor();
		if (monacoEditor && editor) {
			const selectedLanguage = this.selectedLanguage;
			let language = this.LANGUAGE_JAVASCRIPT;
			if (selectedLanguage === Language.WktLang) {
				language = this.LANGUAGE_WKTLANG;
			}
			monacoEditor.setModelLanguage(editor.getModel(), language);
		}
	}

	async onEditorReady(editor: any) {

		await this.initializeEditor();

		editor.getModel()
			.onDidChangeContent((_: any) => {
				this.editorChange$.next();
			});
	}

	private runJavaScript(value: string): Promise<void> {
		return this.jsExecutorService.run(value);
	}

	private runWktLang(value: string): Promise<void> {
		return evaluate(value, {
			outputFormat: OutputFormat.GeoJSON
		});
	}

	private async run() {
		if (!this.isRunning) {
			this.setRunState(true);

			try {
				const value = this.getScript();
				let data: any;
				switch (this.selectedLanguage) {
					case Language.JavaScript:
						data = await this.runJavaScript(value);
						break;
					case Language.WktLang:
						data = this.runWktLang(value);
						break;
				}

				if (data) {
					// Add new scratch layer
					const scratchDataLayer = this.layerManagerService.getScratchLayer(data);
					await this.layerManagerService.removeLayerByName(scratchDataLayer.name);
					await this.layerManagerService.addLayer(scratchDataLayer);
				}
			} catch (err) {
				this.consoleListenerService.postConsoleEvent({
					date: new Date(),
					type: 'error',
					value: err
				})
			} finally {
				this.setRunState(false);
			}

		}
	}

	private getScript(): string {
		return this.codeViewer?.getMonacoEditor()?.getValue();
	}

	private setRunState(isRunning: boolean): void {
		this.isRunning = isRunning;
		this.changeDetectorRef.detectChanges();
	}
}
