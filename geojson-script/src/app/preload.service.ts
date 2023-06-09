import * as L from 'leaflet';

import { Injectable } from '@angular/core';

import { DataLayer } from './data-layer';

export interface PreloadOptions {
	script?: string;
	layers: DataLayer[];
	mapOptions?: L.MapOptions;
}

@Injectable({
	providedIn: 'root'
})
export class PreloadService {

	constructor() { }

	options?: PreloadOptions;

	consume(): PreloadOptions | undefined {
		const options = this.options;
		this.options = undefined;
		return options;
	}
}
