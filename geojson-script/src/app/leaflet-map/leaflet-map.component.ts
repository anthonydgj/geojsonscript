import * as L from 'leaflet';

import { AfterViewInit, Component, ComponentFactoryResolver, Injector, Input, OnDestroy } from '@angular/core';

import { AbstractMapComponent } from '../abstract-map-component';
import { DataLayer } from '../data-layer';
import { LayerManagerService } from '../layer-manager.service';
import { MapComponent } from '../map-component';
import { MapService } from '../map.service';
import { PopupContentComponent } from '../popup-content/popup-content.component';

@Component({
	selector: 'app-leaflet-map',
	templateUrl: './leaflet-map.component.html',
	styleUrls: ['./leaflet-map.component.scss']
})
export class LeafletMapComponent extends AbstractMapComponent implements MapComponent, AfterViewInit, OnDestroy {

	private readonly DEFAULT_RADIUS = 6;
	private readonly DEFAULT_WEIGHT = 1;
	private readonly DEFAULT_STYLE = {
		color: `#222222`,
		weight: this.DEFAULT_WEIGHT
	};

	@Input() mapOptions?: L.MapOptions = {};

	map?: L.Map;

	constructor(
		mapService: MapService,
		private layerManagerService: LayerManagerService,
		private resolver: ComponentFactoryResolver,
		private injector: Injector
	) {
		super(mapService);
	}

	ngAfterViewInit() {
		this.initializeMap();
	}

	ngOnDestroy(): void {
		this.onDestroy();
	}

	redrawMap(): void {
		this.map?.invalidateSize();
	}

	addLayer(dataLayer: DataLayer) {
		const map = this.map;
		if (map && !dataLayer.hide) {
			this.loadGeoJSON(map, dataLayer);
		}
	}

	removeLayer(dataLayer: DataLayer) {
		const map = this.map;
		if (map) {
			dataLayer.mapLayer?.deref()?.removeFrom(map);
			dataLayer.mapLayer = undefined;
		}
	}


	toggleLayer(dataLayer: DataLayer, shouldDisplay: boolean): void {
		const map = this.map;
		if (map) {
			if (shouldDisplay) {
				this.loadGeoJSON(map, dataLayer);
			} else {
				const mapLayer = dataLayer.mapLayer;
				dataLayer.mapLayer = undefined;
				if (mapLayer) {
					mapLayer.deref()?.remove();
				}
			}
		}
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


	async onMapDoubleClick(event: L.LeafletMouseEvent) {
		const location = event.latlng;

		const locationLayer = this.layerManagerService.getScratchPointLayer({
			type: 'Point',
			coordinates: [location.lng, location.lat]
		});
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

		this.onInit();
		this.mapService.initMap();
	}

}
