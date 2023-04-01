import { Component, Input } from '@angular/core';
import * as L from 'leaflet';
import { DataLayer } from '../data-layer';

import { JsExecutorService } from '../js-executor.service';
import { LayerManagerService } from '../layer-manager.service';
import { MapService } from '../map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent {

  @Input() mapOptions?: L.MapOptions = {};

  map?: L.Map;

  locationLayer?: DataLayer;

  constructor(
    private jsExecutorService: JsExecutorService,
    private mapService: MapService,
    private layerManagerService: LayerManagerService
  ) { }

  ngAfterViewInit() {
    this.initializeMap();
  }

  redrawMap(): void {
    this.map?.invalidateSize();
  }

  onMapDoubleClick(event: L.LeafletMouseEvent) {
    const location = event.latlng;

    if (this.locationLayer) {
      this.layerManagerService.removeLayer(this.locationLayer);
    }

    this.locationLayer = this.layerManagerService.getScratchPointLayer({
      type: 'Point',
      coordinates: [location.lng, location.lat]
    });
    this.layerManagerService.addLayer(this.locationLayer);
  }

  private initializeMap(): void {

    this.map = L.map('map', {
      doubleClickZoom: false,
      zoom: 2,
      center: [30, 0],
      ...this.mapOptions
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    this.map.on('dblclick', (e) => this.onMapDoubleClick(e));

    this.jsExecutorService.getThis()['map'] = this.map;
    this.mapService.setMap(this.map);
  }

}
