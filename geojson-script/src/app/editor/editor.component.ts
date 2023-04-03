import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, debounceTime, Subscription } from 'rxjs';

import { CodeViewerComponent, CodeViewerOptions } from '../code-viewer/code-viewer.component';
import { DataLayer } from '../data-layer';
import { DataUtils } from '../data-utils';
import { ThisObjectDialogComponent } from '../this-object-dialog/this-object-dialog.component';
import { JsExecutorService } from '../js-executor.service';
import { LayerManagerService } from '../layer-manager.service';
import { UserEvent, UserEventService } from '../user-event.service';
import { AppStateService } from '../app-state.service';

const appStatePrefix = 'editor';
const appStateScript = 'script';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, AfterViewInit, OnDestroy {
  public _editor: any;

  private eventSubscription = new Subscription();
  private editorSaveSubscription = new Subscription();
  private editorChange$ = new BehaviorSubject<void>(undefined);

  private initialValue = `// Use ctrl+enter or (command-enter on Mac) to run the script code\n`;
  private exampleValue =  `/*
 *   Tips:
 *   =====
 *   Use ctrl+enter or (command-enter on Mac) to run the script.
 *   Double-click on the map to quickly add a temporary point layer.
 *   Return a GeoJSON object to add a temporary feature layer.
 *   Reference map layers by name within the script.
 *   Click on a map feature to view GeoJSON data.
 *   Hold shift then click-and-drag to zoom into a specific region.
 */

// Print log messages
console.log('Loading Turf spatial analysis library...');

// Load library modules
const turf = await import('https://unpkg.com/@turf/helpers?module')
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

  scratchDataLayer?: DataLayer;
  isRunning = false;
  
  private static DEFAULT_SCRIPT_FILE_NAME = 'geojsonScript';

  private scriptSaveDebounceMillis = 500;

  constructor(
    private userEventService: UserEventService,
    private jsExecutorService: JsExecutorService,
    private layerManagerService: LayerManagerService,
    private appStateService: AppStateService,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (this.preloadValue) {
      this.editorOptions.initialValue = this.preloadValue;
    } else {
      const savedScript = this.appStateService.getState<string>(appStateScript, appStatePrefix);
      if (!this.preloadValue && !!savedScript && savedScript !== this.exampleValue) {
        this.editorOptions.initialValue = savedScript;
      }
    }
  }

  ngAfterViewInit(): void {
    this.eventSubscription = this.userEventService.getEvents().subscribe(event => {
      if (event === UserEvent.RUN_SCRIPT) {
        this.run();
      }
    });

    this.editorSaveSubscription = this.editorChange$.asObservable().pipe(
      debounceTime(this.scriptSaveDebounceMillis)
    ).subscribe(() => {
      const script = this.getScript();
      if (script !== this.preloadValue) {
        let savedScript;
        if (
          !script?.trim() ||
          script.trim() === this.initialValue.trim() ||
          script.trim() === this.exampleValue.trim()
        ) {
          savedScript = '';
        } else {
          savedScript = script;
        }
        this.appStateService.setState(appStateScript, savedScript, appStatePrefix);
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

  onEditorReady(editor: any) {
    editor.getModel()
      .onDidChangeContent((_: any) => {
        this.editorChange$.next();
      });
  }

  private async run() {
    if (!this.isRunning) {
      this.setRunState(true);

      // Remove old scratch layer
      if (this.scratchDataLayer) {
        this.layerManagerService.removeLayer(this.scratchDataLayer);
      }

      // Create scratch layer
      const value = this.getScript();
      const promise = this.jsExecutorService.run(value).then((data: any) => {
        if (data) {
          const scratchDataLayer = this.layerManagerService.getScratchLayer(data);

          // Add new scratch layer
          if (scratchDataLayer) {
            this.layerManagerService.addLayer(scratchDataLayer);
            this.scratchDataLayer = scratchDataLayer;
          }
        }
      }).finally(() => {
        this.setRunState(false);
      });

      await promise;
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
