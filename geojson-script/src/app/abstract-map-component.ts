import { Subscription } from "rxjs";

import { DataLayer } from "./data-layer";
import { MapCommandTyoe, MapService } from "./map.service";

export abstract class AbstractMapComponent {

	abstract addLayer(dataLayer: DataLayer): void;
	abstract removeLayer(dataLayer: DataLayer): void;
	abstract toggleLayer(dataLayer: DataLayer, shouldDisplay?: boolean): void;

	private mapCommandSubscription?: Subscription;

	constructor(protected mapService: MapService) { }

	onInit() {
		this.mapCommandSubscription = this.mapService.command$.subscribe(command => {
			switch (command.command) {
				case MapCommandTyoe.ADD_LAYER:
					this.addLayer(command.dataLayer);
					break;
				case MapCommandTyoe.REMOVE_LAYER:
					this.removeLayer(command.dataLayer);
					break;
				case MapCommandTyoe.TOGGLE_LAYER:
					this.toggleLayer(command.dataLayer, command.shouldDisplay);
					break;
				default:
					break;
			}
		});
	}

	onDestroy() {
		if (this.mapCommandSubscription) {
			this.mapCommandSubscription.unsubscribe();
		}
	}
}