import { Subscription } from "rxjs";

import { DataLayer } from "./data-layer";
import { MapCommandTyoe, MapService } from "./map.service";

export abstract class AbstractMapComponent {

	abstract addLayer(dataLayer: DataLayer): void | Promise<void>;
	abstract removeLayer(dataLayer: DataLayer): void | Promise<void>;
	abstract toggleLayer(dataLayer: DataLayer, shouldDisplay?: boolean): void | Promise<void>;

	private mapCommandSubscription?: Subscription;

	constructor(protected mapService: MapService) { }

	onInit() {
		this.mapCommandSubscription = this.mapService.command$.subscribe(async command => {
			switch (command.command) {
				case MapCommandTyoe.ADD_LAYER:
					await this.addLayer(command.dataLayer);
					break;
				case MapCommandTyoe.REMOVE_LAYER:
					await this.removeLayer(command.dataLayer);
					break;
				case MapCommandTyoe.TOGGLE_LAYER:
					await this.toggleLayer(command.dataLayer, command.shouldDisplay);
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