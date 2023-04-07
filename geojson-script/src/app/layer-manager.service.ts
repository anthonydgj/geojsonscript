import { Injectable } from '@angular/core';
import randomColor from 'randomcolor';
import tinycolor from 'tinycolor2';
import deepcopy from 'deepcopy';

import { DataLayerRecord, db, LayerType } from './db';
import { DataLayer } from './data-layer';
import { JsExecutorService } from './js-executor.service';
import { MapService } from './map.service';
import { BehaviorSubject } from 'rxjs';

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

  getSuggestedLayerName() {
    return `layer${this.inputLayerCount + 1}`;
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

    this.jsExecutorService.getThis()[dataLayer.name] = deepcopy(dataLayer.content);

    const map = this.mapService.getMap();
    if (map && !dataLayer.hide) {
      this.mapService.loadGeoJSON(map, dataLayer);
    }

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
    this.jsExecutorService.getThis()[dataLayer.name] = undefined;

    const removeIndex = this.layers
      .findIndex(layer => layer.name === dataLayer.name);
    let foundDataLayer: DataLayer | undefined;
    if (removeIndex >= 0) {
      foundDataLayer = this.layers[removeIndex];
      this.layers.splice(removeIndex, 1);

      const map = this.mapService.getMap();
      if (map) {
        foundDataLayer.mapLayer?.removeFrom(map);
        foundDataLayer.mapLayer = undefined;
      }

      if (permanent) {
        await db.dataLayers.delete(foundDataLayer.name);
      }
    }
    this.broadcastUpdate();
  }

  async removeLayerByName(name: string) {
    const record = await db.dataLayers.where({name: name}).first();
    if (record) {
      return this.removeLayer(record);
    }
  }

  refreshLayer(dataLayer: DataLayer): void {
    if (!!dataLayer.mapLayer) {
      this.removeLayer(dataLayer);
      this.addLayer(dataLayer);
    }
  }

  toggleLayer(dataLayer: DataLayer, shouldDisplay: boolean): void {
    const map = this.mapService.getMap();
    if (map) {
      if (shouldDisplay) {
        this.mapService.loadGeoJSON(map, dataLayer);
      } else {
        dataLayer.mapLayer?.removeFrom(map);
        dataLayer.mapLayer = undefined;
      }
    }
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
    this.layers.forEach(async layer => {
      await this.removeLayer(layer, permanent);
    });
    this.layers.length = 0;
  }

  private broadcastUpdate() {
    this._layers$.next(this.layers);
  }
}
