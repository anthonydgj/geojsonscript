import Plotly from 'plotly.js-dist-min'

import { AfterViewInit, Component, OnDestroy } from '@angular/core';

import { AbstractMapComponent } from '../abstract-map-component';
import { DataLayer } from '../data-layer';
import { LayerManagerService } from '../layer-manager.service';
import { MapComponent } from '../map-component';
import { MapService } from '../map.service';

@Component({
	selector: 'app-plotly-map',
	templateUrl: './plotly-map.component.html',
	styleUrls: ['./plotly-map.component.scss']
})
export class PlotlyMapComponent extends AbstractMapComponent implements MapComponent, AfterViewInit, OnDestroy {

	private plot?: Plotly.PlotlyHTMLElement;

	constructor(
		mapService: MapService,
		private layerManagerService: LayerManagerService
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

	addLayer(dataLayer: DataLayer): void {

	}

	removeLayer(dataLayer: DataLayer): void {

	}

	toggleLayer(dataLayer: DataLayer, shouldDisplay?: boolean): void {

	}

	private async initializeMap() {

		const divId = 'plotly-map';
		let observer = new MutationObserver(function (mutations) {
			window.dispatchEvent(new Event('resize'));
		});

		let child = document.getElementById(divId);
		if (child) {
			observer.observe(child, { attributes: true });
		}

		var data: any = [{
			type: 'scattergeo',
			mode: 'markers',
			locations: ['FRA', 'DEU', 'RUS', 'ESP'],
			marker: {
				size: [20, 30, 15, 10],
				color: [10, 20, 40, 50],
				cmin: 0,
				cmax: 50,
				colorscale: 'Greens',
				colorbar: {
					title: 'Some rate',
					ticksuffix: '%',
					showticksuffix: 'last'
				},
				line: {
					color: 'black'
				}
			},
			name: 'europe data'
		}];

		var layout = {
			'geo': {
				'scope': 'world',
				'resolution': 100
			}
		};

		const config = {
			responsive: true
		}

		Plotly.newPlot(divId, data, layout, config);

		this.onInit();
		this.mapService.initMap();
	}
}
