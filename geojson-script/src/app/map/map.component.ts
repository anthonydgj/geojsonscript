import * as L from 'leaflet';

import { Component, Input } from '@angular/core';

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

	constructor(
		private mapService: MapService,
		private layerManagerService: LayerManagerService
	) { }

	ngAfterViewInit() {
		this.initializeMap();
	}

	redrawMap(): void {
		this.map?.invalidateSize();
	}

	async onMapDoubleClick(event: L.LeafletMouseEvent) {
		const location = event.latlng;
		const pointFeature: GeoJSON.Feature<GeoJSON.Point> = {
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [location.lng, location.lat]
			},
			properties: {}
		};
		const locationLayer = this.layerManagerService.getScratchPointLayer(pointFeature);
		await this.layerManagerService.removeLayerByName(locationLayer.name);
		this.layerManagerService.addLayer(locationLayer);
	}

	private initializeMap(): void {

		this.map = L.map('map', {
			doubleClickZoom: false,
			zoom: 1,
			center: [0, 0],
			wheelPxPerZoomLevel: 150,
			...this.mapOptions
		});

		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(this.map);

		this.map.on('dblclick', (e) => this.onMapDoubleClick(e));

		// this.jsExecutorService.getThis()['map'] = this.map;
		this.mapService.setMap(this.map);
	}

}
