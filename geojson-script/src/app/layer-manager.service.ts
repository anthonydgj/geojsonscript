import randomColor from 'randomcolor';
import { BehaviorSubject } from 'rxjs';
import tinycolor from 'tinycolor2';

import { Injectable } from '@angular/core';

import { DataLayer } from './data-layer';
import { DataLayerRecord, LayerType, db } from './db';
import { JsExecutorService } from './js-executor.service';
import { MapService } from './map.service';

@Injectable({
	providedIn: 'root'
})
export class LayerManagerService {

	static readonly DEFAULT_SCRATCH_POINT_NAME = 'newPoint';
	static readonly DEFAULT_SCRATCH_LAYER_NAME = 'newLayer';

	private readonly DEFAULT_STROKE_COLOR_DARKEN = 30;
	private readonly DEFAULT_FILL_OPACITY = 0.4;
	private readonly DEFAULT_SCRATCH_STYLE = {
		fillColor: `#f7f750`,
		color: '#6d6d00',
		fillOpacity: '0.95',
	};
	private readonly DEFAULT_SCRATCH_POINT_STYLE = {
		fillColor: `#a174f5`,
		color: '#4d0ec2',
		fillOpacity: '0.95',
	};

	inputLayerCount = 0;
	layers: DataLayer[] = [];
	selectedLayers: DataLayer[] = [];

	private _layers$ = new BehaviorSubject<DataLayer[]>([]);
	layers$ = this._layers$.asObservable();

	constructor(
		private jsExecutorService: JsExecutorService,
		private mapService: MapService
	) { }

	async getSuggestedLayerName() {
		const layersList = await db.dataLayers.toArray();
		const namesSet = new Set(layersList.map(layer => layer.name));
		let suggestedName: string | undefined = undefined;
		let suggestedNumber = namesSet.size + 1;
		const maxAttempts = 100;
		for (let numAttempts = 1; numAttempts <= maxAttempts; numAttempts++) {
			suggestedName = `layer${suggestedNumber}`;
			if (!namesSet.has(suggestedName)) {
				return suggestedName
			}
			suggestedNumber = suggestedNumber + 1;
		}
		return '';
	}

	getStrokeColor(fillColor: string): string {
		return tinycolor(fillColor)
			.darken(this.DEFAULT_STROKE_COLOR_DARKEN)
			.toString();
	}

	async addLayer(dataLayer: DataLayer, permanent = true) {
		if (dataLayer.type !== LayerType.SCRATCH) {
			this.inputLayerCount++;
		}

		const fillColor = randomColor({
			luminosity: 'bright',
		});
		const strokeColor = this.getStrokeColor(fillColor);
		dataLayer.style = {
			fillColor: fillColor,
			color: strokeColor,
			fillOpacity: this.DEFAULT_FILL_OPACITY,
			...dataLayer.style
		}

		this.jsExecutorService.getThis()[dataLayer.name] = dataLayer.content;

		this.mapService.addLayer(dataLayer);

		this.layers.push(dataLayer);

		if (permanent) {
			const dataLayerRecord: DataLayerRecord = {
				name: dataLayer.name,
				path: dataLayer.path,
				content: dataLayer.content,
				zIndex: dataLayer.zIndex,
				style: dataLayer.style,
				type: dataLayer.type
			};
			await db.dataLayers.put(dataLayerRecord, dataLayer.name);
		}

		this.broadcastUpdate();
	}

	async removeLayer(dataLayer: DataLayer, permanent = true) {
		delete this.jsExecutorService.getThis()[dataLayer.name];

		const removeIndex = this.layers
			.findIndex(layer => layer.name === dataLayer.name);

		let foundDataLayer: DataLayer | undefined;
		if (removeIndex >= 0) {
			foundDataLayer = this.layers[removeIndex];
			this.layers.splice(removeIndex, 1);

			this.mapService.removeLayer(foundDataLayer);

			if (permanent) {
				await db.dataLayers.delete(foundDataLayer.name);
			}
		}
		this.broadcastUpdate();
		return this.layers;
	}

	async removeLayerByName(name: string) {
		const record = await db.dataLayers.where({ name: name }).first();
		if (record) {
			return this.removeLayer(record);
		}
		return Promise.resolve();
	}

	refreshLayer(dataLayer: DataLayer): void {
		this.removeLayer(dataLayer);
		this.addLayer(dataLayer);
	}

	toggleLayer(dataLayer: DataLayer, shouldDisplay: boolean): void {
		this.mapService.toggleLayer(dataLayer, shouldDisplay);
	}

	getScratchLayerName(): string {
		return LayerManagerService.DEFAULT_SCRATCH_LAYER_NAME;
	}

	getScratchLayer(geoJsonData: L.GeoJSON): DataLayer {
		const scratchLayer: DataLayer = {
			name: this.getScratchLayerName(),
			content: geoJsonData,
			zIndex: 2,
			style: this.DEFAULT_SCRATCH_STYLE,
			type: LayerType.SCRATCH
		};
		return scratchLayer;
	}

	getScratchPointLayer(point: GeoJSON.Point): DataLayer {
		const scratchLayer: DataLayer = {
			name: LayerManagerService.DEFAULT_SCRATCH_POINT_NAME,
			content: point,
			zIndex: 3,
			style: this.DEFAULT_SCRATCH_POINT_STYLE,
			type: LayerType.SCRATCH
		};
		return scratchLayer;
	}

	async removeAll(permanent = true) {
		let layers = this.layers;
		while (layers.length > 0) {
			const layer = layers[0];
			layers = await this.removeLayer(layer, permanent);
		}
	}

	private broadcastUpdate() {
		this._layers$.next(this.layers);
	}
}
