import { first } from 'rxjs';

import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { MonacoEditorService } from '../monaco-editor.service';
import { UserEvent, UserEventService } from '../user-event.service';

declare var monaco: any;

export interface CodeViewerOptions {
	initialValue?: string;
	collapsed?: boolean;
	monacoEditorOptions?: any;
	captureUserEvents?: boolean;
}

@Component({
	selector: 'app-code-viewer',
	templateUrl: './code-viewer.component.html',
	styleUrls: ['./code-viewer.component.scss']
})
export class CodeViewerComponent {

	@Input() options: CodeViewerOptions = {};

	@Output() ready = new EventEmitter<any>();

	@ViewChild('editorContainer', { static: false }) _editorContainer?: ElementRef;

	private _editor: any;
	isReady = false;

	constructor(
		private monacoEditorService: MonacoEditorService,
		private userEventService: UserEventService,
		private changeDetectorRef: ChangeDetectorRef
	) { }

	private initMonaco(): void {
		if (!this.monacoEditorService.loaded) {
			this.monacoEditorService.load();
			this.monacoEditorService.loadingFinished.pipe(first()).subscribe(() => {
				this.initMonaco();
			});
			return;
		}

		this._editor = monaco.editor.create(
			this._editorContainer?.nativeElement,
			{
				tabSize: 2,
				...this.options.monacoEditorOptions
			}
		);

		this._editor.setValue(this.options.initialValue);

		if (this.options.collapsed) {
			this._editor.getAction('editor.foldLevel2').run();
		}

		if (this.options.captureUserEvents) {
			this._editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
				this.userEventService.sendCommand(UserEvent.RUN_SCRIPT);
			});
			this._editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL, () => {
				this.userEventService.sendCommand(UserEvent.CLEAR_CONSOLE_OUTPUT);
			});
		}

		this.isReady = true;
		this.ready.emit(this.getMonacoEditor());
		this.changeDetectorRef.detectChanges();
	}

	/**
	 * Set the editor value, preserving history
	 * @param value 
	 */
	setValue(value: string): void {
		this.getMonacoEditor().executeEdits('', [{
			range: {
				startColumn: 1,
				startLineNumber: 1,
				endColumn: Number.MAX_VALUE,
				endLineNumber: Number.MAX_VALUE
			},
			text: value,
			forceMoveMarkers: true
		}]);
	}

	getMonacoEditorApi() {
		return monaco.editor;
	}

	getMonacoEditor() {
		return this._editor;
	}

	ngAfterViewInit(): void {
		this.initMonaco();
	}

	ngOnDestroy(): void {
		if (this._editor) {
			this._editor.dispose();
			this._editor = undefined;
		}
	}

}
