import Plotly from 'plotly.js-dist-min'

import { AfterViewInit, Component, OnDestroy } from '@angular/core';

import { AbstractMapComponent } from '../abstract-map-component';
import { DataLayer } from '../data-layer';
import { MapComponent } from '../map-component';
import { MapService } from '../map.service';

interface Points {
	lon: number[];
	lat: number[];
	z: any[];
	hoverinfo: string;
	name: string;
}

interface PlotlyDataCollections {
	points: any[];
	lines: any[];
	polygons: any[];
}

@Component({
	selector: 'app-plotly-map',
	templateUrl: './plotly-map.component.html',
	styleUrls: ['./plotly-map.component.scss']
})
export class PlotlyMapComponent extends AbstractMapComponent implements MapComponent, AfterViewInit, OnDestroy {

	private readonly DIV_ID = 'plotly-map';

	private plot?: Plotly.PlotlyHTMLElement;
	private layers: DataLayer[] = [];

	constructor(
		mapService: MapService,
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
		window.dispatchEvent(new Event('resize'));
	}

	private getDataFromGeoJSON(geojson: any, dataLayerName: string): PlotlyDataCollections {

		const allData: PlotlyDataCollections = {
			points: [],
			lines: [],
			polygons: []
		}

		if (geojson) {
			const type = geojson.type;
			if (type === 'Feature') {
				const geometryType = geojson.geometry.type;
				if (geometryType === 'Point') {
					allData.points.push(geojson);
				} else if (geometryType === 'LineString') {
					allData.lines.push(geojson);
				} else if (geometryType === 'Polygon') {
					allData.polygons.push(geojson);
				} else {
					console.warn(`Unrecognized geometry type: ${geometryType}`);
				}
			} else if (type === 'FeatureCollection') {
				geojson.features.forEach((feature: any) => {
					const { points, lines, polygons } = this.getDataFromGeoJSON(feature, dataLayerName);
					allData.points.push(...points);
					allData.lines.push(...lines);
					allData.polygons.push(...polygons);
				});
			} else if (Array.isArray(geojson)) {
				geojson.forEach((feature: any) => {
					const { points, lines, polygons } = this.getDataFromGeoJSON(feature, dataLayerName);
					allData.points.push(...points);
					allData.lines.push(...lines);
					allData.polygons.push(...polygons);
				});
			} else {
				console.warn(`Unrecognized type: ${type}`);
			}
		}

		return allData;
	}

	private async loadGeoJSON(
		map: any,
		dataLayer: DataLayer
	) {
		const dataCollections = this.getDataFromGeoJSON(dataLayer.content, dataLayer.name);


		var data: Plotly.Data[] = [];

		if (dataCollections.points?.length) {
			var lon = dataCollections.points.map((f: any) => f.geometry.coordinates[0]);
			var lat = dataCollections.points.map((f: any) => f.geometry.coordinates[1]);
			var z = dataCollections.points.map((f: any) => f.properties.mag);
			data.push({
				type: "scattermapbox",
				lon: lon,
				lat: lat,
				z: z,
				hoverinfo: "y",
				name: dataLayer.name
			});
		}

		let polygonData;
		const polygonGeoJson: any = {
			type: "FeatureCollection",
			features: dataCollections.polygons
		};
		if (dataCollections.polygons?.length) {
			polygonData = {
				type: 'choroplethmapbox',
				locations: dataCollections.polygons.map(polygon => 1),
				z: dataCollections.polygons.map(polygon => 1),
				geojson: polygonGeoJson,
				name: dataLayer.name
			} as any;
			data.push(polygonData);
		}

		// console.log(JSON.stringify(dataCollections.polygons, null, 2));
		console.log(data);

		if (!this.plot) {
			const layout: any = {
				dragmode: "zoom",
				mapbox: { style: "open-street-map", center: { lat: 0, lon: 0 }, zoom: 1 },
				margin: { r: 0, t: 0, b: 0, l: 0 }
			};

			const config = {
				responsive: true
			}

			this.plot = await Plotly.newPlot(this.DIV_ID, data, layout, config);
		} else {
			await Plotly.addTraces(this.plot, data as any);
			Plotly.relayout(this.plot, {
				mapbox: {
					style: "open-street-map",
					center: { lat: 0, lon: 0 },
					zoom: 1,
					layers: [
						{
							source: polygonGeoJson,
							type: 'fill',
						}
					]
				}
			})
		}
		this.layers.push(dataLayer);
	}

	async addLayer(dataLayer: DataLayer) {
		if (this.plot && !dataLayer.hide) {
			this.loadGeoJSON(undefined, dataLayer);
		}
	}

	async removeLayer(dataLayer: DataLayer) {
		if (this.plot) {
			const layerIndex = this.layers.findIndex(layer => layer.name === dataLayer.name);
			if (layerIndex >= 0) {
				await Plotly.deleteTraces(this.DIV_ID, layerIndex);
			}
			this.layers.splice(layerIndex, 1);
		}
	}

	async toggleLayer(dataLayer: DataLayer, shouldDisplay?: boolean) {
		if (shouldDisplay) {
			this.loadGeoJSON(undefined, dataLayer);
		} else {
			this.removeLayer(dataLayer);
		}
	}

	private async initializeMap() {

		let observer = new MutationObserver(function (mutations) {
			window.dispatchEvent(new Event('resize'));
		});

		let child = document.getElementById(this.DIV_ID);
		if (child) {
			observer.observe(child, { attributes: true });
		}

		const config = {
			responsive: true
		}

		const layout: any = {
			dragmode: "zoom",
			mapbox: { style: "open-street-map", center: { lat: 0, lon: 0 }, zoom: 1 },
			margin: { r: 0, t: 0, b: 0, l: 0 }
		};

		this.plot = await Plotly.newPlot(this.DIV_ID, [], layout, config);

		this.onInit();
		this.mapService.initMap();
	}
}
