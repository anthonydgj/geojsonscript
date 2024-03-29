import { NgxFileDropEntry } from 'ngx-file-drop';
import { Subscription, first } from 'rxjs';

import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectionList } from '@angular/material/list';

import { DataDialogComponent } from '../data-dialog/data-dialog.component';
import { DataLayer } from '../data-layer';
import { DataLayerDialogComponent } from '../data-layer-dialog/data-layer-dialog.component';
import { DataUtils } from '../data-utils';
import { LayerType, db } from '../db';
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
	layers: DataLayer[] = [];

	private layersSubscription?: Subscription;

	constructor(
		private dialog: MatDialog,
		private changeDetectorRef: ChangeDetectorRef,
		private mapService: MapService,
		public layerManagerService: LayerManagerService
	) { }

	async ngOnInit() {
		this.mapService.mapInit$
			.pipe(first())
			.subscribe(async () => {
				if (this.preloadLayers) {
					await this.layerManagerService.removeAll(false);
					this.preloadLayers.forEach(async layer => {
						await this.addLayer(layer, false);
					});
				} else {
					db.dataLayers.each(async (dataLayer: DataLayer) => {
						dataLayer.hide = true;
						await this.addLayer(dataLayer, false);
					})
				}
			});

		this.layersSubscription = this.layerManagerService.layers$
			.subscribe(layers => {
				this.layers = layers;
				this.changeDetectorRef.detectChanges();
			});
	}

	ngOnDestroy(): void {
		if (this.layersSubscription) {
			this.layersSubscription.unsubscribe();
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
		this.changeDetectorRef.detectChanges();
	}

	onDownloadLayer(dataLayer: DataLayer) {
		const value = DataUtils.getSimpleObjectString(dataLayer.content);
		DataUtils.saveFile(`${dataLayer.name}.geojson`, value);
	}

	async onRemoveLayer(dataLayer: DataLayer) {
		await this.layerManagerService.removeLayer(dataLayer);
	}

	async onRemoveAll() {
		await this.layerManagerService.removeAll(true);
	}

	onLayerClick(layer: DataLayer) {
		const isSelected = this.layersSelection?.selectedOptions
			.selected.map(option => option.value).includes(layer);
		this.layerManagerService.toggleLayer(layer, !!isSelected);
		this.changeDetectorRef.detectChanges();
	}

	onCopyLayer(layer: DataLayer) {
		const dialogRef = this.dialog.open(DataLayerDialogComponent, {
			data: {
				original: layer
			}
		});
		dialogRef.afterClosed().subscribe((dataLayer: DataLayer) => {
			if (dataLayer) {
				this.addLayer(dataLayer);
			}
		});
	}

	dropped(files: NgxFileDropEntry[]) {
		if (files.length >= 1) {
			// Use first file
			const droppedFile = files[0];
			if (droppedFile.fileEntry.isFile) {
				const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
				fileEntry.file((file: File) => {

					const filepath = droppedFile.relativePath;

					file.text().then(async text => {
						const json = JSON.parse(text);

						const dataLayer: DataLayer = {
							name: await this.layerManagerService.getSuggestedLayerName(),
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
				console.error($localize`Must select one file.`)
			}
		} else {
			console.error($localize`Must select a file.`)
		}
	}

	private addLayer(dataLayer: DataLayer, permanent = true) {
		this.layerManagerService.addLayer(dataLayer, permanent);
		this.changeDetectorRef.detectChanges();
	}

}
