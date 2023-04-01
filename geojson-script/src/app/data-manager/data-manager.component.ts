import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectionList } from '@angular/material/list';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { Subscription } from 'rxjs';

import { DataDialogComponent } from '../data-dialog/data-dialog.component';
import { DataLayer, LayerType } from '../data-layer';
import { DataLayerDialogComponent } from '../data-layer-dialog/data-layer-dialog.component';
import { DataUtils } from '../data-utils';
import { LayerManagerService } from '../layer-manager.service';
import { MapService } from '../map.service';

@Component({
  selector: 'app-data-manager',
  templateUrl: './data-manager.component.html',
  styleUrls: ['./data-manager.component.scss']
})
export class DataManagerComponent implements OnInit, OnDestroy {

  @ViewChild('layersSelection') layersSelection?: MatSelectionList;

  @Input() preloadLayers?: DataLayer[];

  LayerType = LayerType;

  private mapInitSubscription?: Subscription;

  constructor(
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    private mapService: MapService,
    public layerManagerService: LayerManagerService
  ) { }

  ngOnInit(): void {
    this.mapInitSubscription = this.mapService.mapInit$.pipe().subscribe(() => {
      if (this.preloadLayers) {
        this.layerManagerService.removeAll();
        this.preloadLayers.forEach(layer => {
          this.addLayer(layer);
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.mapInitSubscription) {
      this.mapInitSubscription.unsubscribe();
    }
  }

  onOpenDialog(): void {
    const dialogRef = this.dialog.open(DataLayerDialogComponent, {
      data: {
        numLayers: this.layerManagerService.layers.length
      }
    });
    dialogRef.afterClosed().subscribe((dataLayer: DataLayer) => {
      if (dataLayer) {
        this.addLayer(dataLayer);
      }
    });
  }

  onViewLayer(event: MouseEvent, dataLayer: DataLayer) {
    event.preventDefault();
    event.stopPropagation();
    this.dialog.open(DataDialogComponent, {
      data: {
        dataLayer: dataLayer
      }
    });
  }

  onDownloadLayer(event: MouseEvent, dataLayer: DataLayer) {
    event.preventDefault();
    event.stopPropagation();
    const value = DataUtils.getSimpleObjectString(dataLayer.content);
    DataUtils.saveFile(`${dataLayer.name}.geojson`, value);
  }

  onRemoveLayer(event: MouseEvent, dataLayer: DataLayer) {
    event.preventDefault();
    event.stopPropagation();
    this.layerManagerService.removeLayer(dataLayer);
  }

  onLayerClick(layer: DataLayer) {
    const isSelected = this.layersSelection?.selectedOptions
      .selected.map(option => option.value).includes(layer);
    this.layerManagerService.toggleLayer(layer, !!isSelected);
  }

  dropped(files: NgxFileDropEntry[]) {
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
              name: this.layerManagerService.getSuggestedLayerName(),
              path: filepath,
              content: json,
              zIndex: 1,
              type: LayerType.INPUT
            };

            this.addLayer(dataLayer);

          }).catch(err => {
            console.error(err);
          });
        });
      } else {
        console.error($localize `Must select one file.`)
      }
    } else {
      console.error($localize `Must select a file.`)
    }
  }

  private addLayer(dataLayer: DataLayer) {
    this.layerManagerService.addLayer(dataLayer);
    this.changeDetectorRef.detectChanges();
  }

}
