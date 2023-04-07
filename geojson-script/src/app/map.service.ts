import { ComponentFactoryResolver, Injectable, Injector } from '@angular/core';

import * as L from 'leaflet';
import { BehaviorSubject, share, shareReplay } from 'rxjs';
import { DataLayer } from './data-layer';
import { PopupContentComponent } from './popup-content/popup-content.component';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private readonly DEFAULT_RADIUS = 6;
  private readonly DEFAULT_WEIGHT = 1;
  private readonly DEFAULT_STYLE = {
    color: `#222222`,
    weight: this.DEFAULT_WEIGHT
  };
  private _mapInit$ = new BehaviorSubject<void>(undefined);

  map?: L.Map;
  mapInit$ = this._mapInit$.asObservable().pipe(
    shareReplay(1)
  );

  constructor(
    private resolver: ComponentFactoryResolver,
    private injector: Injector
  ) { }

  getMap(): L.Map | undefined {
    return this.map;
  }

  setMap(map: L.Map): void {
    this.map = map;
    this._mapInit$.next();
  }
  
  loadGeoJSON(
    map: L.Map,
    layer: DataLayer
  ): L.GeoJSON {

    const mapLayer: L.GeoJSON = L.geoJSON(layer.content, {

      // Define the mapping from GeoJSON point to map feature
      pointToLayer: (geoJsonPoint, latlng) => {
        return L.circleMarker(latlng, {
          radius: this.DEFAULT_RADIUS,
          weight: this.DEFAULT_WEIGHT,
          ...this.getGeoJsonStyle(geoJsonPoint)
        });
      },

      // Define the style for the GeoJSON data
      style: (geoJsonData) => {

        const layerStyle = layer.style || {};
        const style = {
          zIndex: layer.zIndex,
          ...this.DEFAULT_STYLE,                  // Default style
          ...layerStyle,                          // Layer style
          ...this.getGeoJsonStyle(geoJsonData)    // GeoJSON attribute style
        };
        return style;
      }
    });

    // Bind tooltip to display layer
    const layerPath = layer.path ? ` (${layer.path})` : '';
    mapLayer.bindTooltip(`${layer.name}${layerPath}`);

    // Bind a popup with basic information
    mapLayer.bindPopup((leafletLayer: L.Layer) => {
      const component = this.resolver.resolveComponentFactory(PopupContentComponent).create(this.injector);
      component.instance.layerName = layer.name;
      component.instance.data = (leafletLayer as any).feature;
      component.changeDetectorRef.detectChanges();
      return component.location.nativeElement;
    });

    // Add layer to the map
    mapLayer.addTo(map);

    // Add back-reference to data layer
    layer.mapLayer = new WeakRef(mapLayer);

    // Return a reference to the GeoJSON layer data
    return mapLayer;
  }

  /**
   * Returns style properties in GeoJSON attributes, if present
   * @param geoJsonData 
   * @returns 
   */
     private getGeoJsonStyle(geoJsonData: any): any {
      if (geoJsonData.properties) {
        return { ...geoJsonData.properties.style };
      }
      return {};
    }
      
}
