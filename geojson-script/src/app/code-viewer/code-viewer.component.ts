import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { first } from 'rxjs';

import { MonacoEditorService } from '../monaco-editor.service';

declare var monaco: any;

export interface CodeViewerOptions {
  initialValue?: string;
  collapsed?: boolean;
  monacoEditorOptions?: any;
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
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  private initMonaco(): void {
    if(!this.monacoEditorService.loaded) {
      this.monacoEditorService.load();
      this.monacoEditorService.loadingFinished.pipe(first()).subscribe(() => {
        this.initMonaco();
      });
      return;
    }

    this._editor = monaco.editor.create(
      this._editorContainer?.nativeElement,
      this.options.monacoEditorOptions
    );

    this._editor.setValue(this.options.initialValue);

    if (this.options.collapsed) {
      this._editor.getAction('editor.foldLevel2').run();
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
