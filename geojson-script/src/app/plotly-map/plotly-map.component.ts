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

	constructor(
		mapService: MapService,
		private layerManagerService: LayerManagerService
	) {
		super(mapService);
	}

	ngAfterViewInit() {
		this.onInit();
	}

	ngOnDestroy(): void {
		this.onDestroy();
	}

	redrawMap(): void {

	}

	addLayer(dataLayer: DataLayer): void {

	}

	removeLayer(dataLayer: DataLayer): void {

	}

	toggleLayer(dataLayer: DataLayer, shouldDisplay?: boolean): void {

	}

}
