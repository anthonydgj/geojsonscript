import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxFileDropEntry } from 'ngx-file-drop';

import { DataLayer } from '../data-layer';
import { LayerType } from '../db';
import { LayerManagerService } from '../layer-manager.service';

export enum DataLayerSource {
  FILE = 'FILE'
}

export enum DataLayerFormat {
  GEOJSON = 'GEOJSON'
}

enum FileSelectionError {
  SELECT_ONE = 'SELECT_ONE',
  DIRECTORY = 'DIRECTORY',
  PARSE = 'PARSE',
}

interface DataLayerDialogData {
  original?: DataLayer
}

@Component({
  selector: 'app-data-layer-dialog',
  templateUrl: './data-layer-dialog.component.html',
  styleUrls: ['./data-layer-dialog.component.scss']
})
export class DataLayerDialogComponent {

  DataLayerSource = DataLayerSource;
  DataLayerFormat = DataLayerFormat;

  dataLayerSources = Object.keys(DataLayerSource).map(value => (DataLayerSource as any)[value])
  selectedDataLayerSource: DataLayerSource = this.dataLayerSources[0];

  dataLayerFormats = Object.keys(DataLayerFormat).map(value => (DataLayerFormat as any)[value])
  selectedDataLayerFormat: DataLayerFormat = this.dataLayerFormats[0];

  files: NgxFileDropEntry[] = [];

  selectedDataLayer?: DataLayer;
  isLoading = false;
  error?: FileSelectionError;
  layerName = '';
  original?: DataLayer;

  constructor(
    private layerManagerService: LayerManagerService,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: DataLayerDialogData
  ) {
    this.original = this.data.original;
    this.layerManagerService.getSuggestedLayerName().then(suggestedLayerName => {
      this.layerName = suggestedLayerName;
      if (this.original) {
        this.selectedDataLayer = {
          name: this.layerName,
          content: this.original.content,
          zIndex: this.original.zIndex,
          type: LayerType.INPUT
        };
      }
    });
}

  dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    this.isLoading = true;
    this.error = undefined;
    this.changeDetectorRef.detectChanges();

    if (files.length >= 1) {
      // Use first file
      const droppedFile = files[0];
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {

          const filepath = droppedFile.relativePath;

          file.text().then(text => {
            const json = JSON.parse(text);

            const dataLayer: DataLayer = {
              name: this.layerName,
              path: filepath,
              content: json,
              zIndex: 1,
              type: LayerType.INPUT
            };

            this.selectedDataLayer = dataLayer;

          }).catch(err => {
            console.error(err);
            this.selectedDataLayer = undefined;
            this.error = FileSelectionError.PARSE;
          }).finally(() => {
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
          });
        });
      } else {
        this.error = FileSelectionError.DIRECTORY;
        this.isLoading = false;
      }
    } else {
      this.error = FileSelectionError.SELECT_ONE;
      this.isLoading = false;
    }
    this.changeDetectorRef.detectChanges();
  }

  onRemove() {
    this.selectedDataLayer = undefined;
    this.changeDetectorRef.detectChanges();
  }

  onLayerNameChange(layerName: string) {
    if (this.selectedDataLayer) {
      this.selectedDataLayer.name = layerName;
    }
  }
}
