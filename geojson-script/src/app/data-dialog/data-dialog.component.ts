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
	summary?: string;

	private readonly DEFAULT_PRECISION_DIGITS = 6;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: DataDialogData,
		private layerManagerService: LayerManagerService
	) {
		const content = data.dataLayer.content;
		if (content) {
			if (
				content.type === 'Point' &&
				Array.isArray(content.coordinates) &&
				content.coordinates.length >= 2
			) {
				const lat = content.coordinates[1].toFixed(this.DEFAULT_PRECISION_DIGITS)
				const long = content.coordinates[0].toFixed(this.DEFAULT_PRECISION_DIGITS)
				this.summary = $localize`lat,lng: ${lat},${long}`
			}
		}

		const formattedData = DataUtils.getSimpleObjectString(content);
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
		this.codeViewer?.getMonacoEditor()?.layout({});
		this.codeViewer?.refresh();
	}

	onColorChange(dataLayer: DataLayer): void {
		const fillColor = dataLayer.style?.fillColor;
		if (fillColor) {
			const strokeColor = this.layerManagerService.getStrokeColor(fillColor);
			dataLayer.style.color = strokeColor;
		}
		dataLayer.hide = !dataLayer.mapLayer;
		this.layerManagerService.refreshLayer(dataLayer);
	}
}
