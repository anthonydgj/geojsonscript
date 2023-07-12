import { BehaviorSubject, Subject, shareReplay } from 'rxjs';

import { Injectable } from '@angular/core';

import { DataLayer } from './data-layer';

export enum MapCommandTyoe {
	ADD_LAYER = 'add_layer',
	REMOVE_LAYER = 'remove_layer',
	TOGGLE_LAYER = 'toggle_layer'
}

export interface MapCommand {
	command: MapCommandTyoe;
	dataLayer: DataLayer;
	shouldDisplay?: boolean;
}

@Injectable({
	providedIn: 'root'
})
export class MapService {

	private _mapInit$ = new BehaviorSubject<void>(undefined);
	mapInit$ = this._mapInit$.asObservable().pipe(shareReplay(1));

	command$ = new Subject<MapCommand>();

	initMap(): void {
		this._mapInit$.next();
	}

	addLayer(dataLayer: DataLayer) {
		this.command$.next({
			command: MapCommandTyoe.ADD_LAYER,
			dataLayer
		});
	}

	removeLayer(dataLayer: DataLayer) {
		this.command$.next({
			command: MapCommandTyoe.REMOVE_LAYER,
			dataLayer
		});
	}

	toggleLayer(dataLayer: DataLayer, shouldDisplay: boolean) {
		this.command$.next({
			command: MapCommandTyoe.TOGGLE_LAYER,
			dataLayer,
			shouldDisplay
		});
	}


}
