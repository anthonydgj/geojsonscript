import { Injectable } from '@angular/core';
import randomColor from 'randomcolor';
import tinycolor from 'tinycolor2';
import deepcopy from 'deepcopy';

import { DataLayerRecord, db, LayerType } from './db';
import { DataLayer } from './data-layer';
import { JsExecutorService } from './js-executor.service';
import { MapService } from './map.service';

@Injectable({
  providedIn: 'root'
})
export class LayerManagerService {

  static readonly DEFAULT_SCRATCH_POINT_NAME = 'tempPoint';
  static readonly DEFAULT_SCRATCH_LAYER_NAME = 'tempLayer';

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
    if (map) {
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
  }

  async removeLayer(dataLayer: DataLayer, permanent = true) {
    this.jsExecutorService.getThis()[dataLayer.name] = undefined;

    const map = this.mapService.getMap();
    if (map) {
      dataLayer.mapLayer?.removeFrom(map);
      dataLayer.mapLayer = undefined;
    }

    const removeIndex = this.layers.findIndex(layer => layer === dataLayer);
    if (removeIndex >= 0) {
      this.layers.splice(removeIndex, 1);
    }

    if (permanent) {
      await db.dataLayers.delete(dataLayer.name);
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

  removeAll(permanent = true): void {
    this.layers.forEach(layer => {
      this.removeLayer(layer, permanent);
    });
    this.layers.length = 0;
  }
}
