import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { CodeViewerComponent, CodeViewerOptions } from '../code-viewer/code-viewer.component';
import { DataLayer } from '../data-layer';
import { DataUtils } from '../data-utils';
import { LayerManagerService } from '../layer-manager.service';

export interface DataDialogData {
  dataLayer: DataLayer;
}

@Component({
  selector: 'app-data-dialog',
  templateUrl: './data-dialog.component.html',
  styleUrls: ['./data-dialog.component.scss']
})
export class DataDialogComponent {

  @ViewChild('codeViewer', { static: true }) codeViewer?: CodeViewerComponent;

  options: CodeViewerOptions;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DataDialogData,
    private layerManagerService: LayerManagerService
  ) {
    const formattedData = DataUtils.getSimpleObjectString(data.dataLayer.content);
    this.options = {
      initialValue: formattedData,
      monacoEditorOptions: {
        language: 'json',
        automaticLayout: true,
        readOnly: true
      }
    }
  }

  ngAfterViewInit() {
    this.codeViewer?.getMonacoEditor()?.layout({})
  }

  onColorChange(dataLayer: DataLayer): void {
    const fillColor = dataLayer.style?.fillColor;
    if (fillColor) {
      const strokeColor = this.layerManagerService.getStrokeColor(fillColor);
      dataLayer.style.color = strokeColor;
    }
    this.layerManagerService.refreshLayer(dataLayer);
  }
}
