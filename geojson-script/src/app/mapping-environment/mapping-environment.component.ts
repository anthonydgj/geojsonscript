import { IOutputData } from 'angular-split';

import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { AppStateService } from '../app-state.service';
import { LayerManagerService } from '../layer-manager.service';
import { MapComponent } from '../map-component';
import { PreloadOptions, PreloadService } from '../preload.service';
import { UserEvent, UserEventService } from '../user-event.service';

enum SplitPanel {
	MAP = 'MAP',
	DATA_MANAGER = 'DATA_MANAGER',
	EDITOR = 'EDITOR',
	CONSOLE = 'CONSOLE'
}

enum MapEngine {
	LEAFLET = 'LEAFLET',
	PLOTLY = 'PLOTLY',
}

const appStatePrefix = 'splitPanel';
const mapEngine = 'mapEngine';

@Component({
	selector: 'app-mapping-environment',
	templateUrl: './mapping-environment.component.html',
	styleUrls: ['./mapping-environment.component.scss']
})
export class MappingEnvironmentComponent implements OnInit, OnDestroy {

	@HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
		if (event.metaKey && event.key === 'Enter') {
			this.handleEvent(UserEvent.RUN_SCRIPT, event);
		} else if (event.metaKey && event.key === 'l') {
			this.handleEvent(UserEvent.CLEAR_CONSOLE_OUTPUT, event);
		}
	}

	@ViewChild('map', { static: false }) map?: MapComponent;

	SplitPanel = SplitPanel;
	MapEngine = MapEngine;

	private DEFAULT_MAP_SIZE = 50;
	private DEFAULT_DATA_MANAGER_SIZE = 20;
	private DEFAULT_EDITOR_SIZE = 65;

	mapSize: number;
	dataManagerSize: number;
	editorSize: number;
	preloadOptions?: PreloadOptions;
	selectedMapEngine: MapEngine;
	availableMapEngines: MapEngine[];

	constructor(
		private userEventService: UserEventService,
		private layerManagerService: LayerManagerService,
		private appStateService: AppStateService,
		private preloadService: PreloadService
	) {
		this.mapSize = this.appStateService.getState(SplitPanel.MAP, appStatePrefix) ||
			this.DEFAULT_MAP_SIZE;
		this.dataManagerSize = this.appStateService.getState(SplitPanel.DATA_MANAGER, appStatePrefix) ||
			this.DEFAULT_DATA_MANAGER_SIZE;
		this.editorSize = this.appStateService.getState(SplitPanel.EDITOR, appStatePrefix) ||
			this.DEFAULT_EDITOR_SIZE;
		this.availableMapEngines = [
			MapEngine.LEAFLET,
			MapEngine.PLOTLY
		];
		this.selectedMapEngine = this.appStateService.getState(mapEngine, appStatePrefix) || this.availableMapEngines[0];
	}

	ngOnInit(): void {
		this.preloadOptions = this.preloadService.consume();
	}

	onDragEnd(event: IOutputData, firstPanelInSection?: SplitPanel): void {
		if (firstPanelInSection === SplitPanel.MAP) {
			this.map?.redrawMap();
		}
		switch (firstPanelInSection) {
			case SplitPanel.MAP:
				const [mapSize, _] = event.sizes;
				if (typeof mapSize === 'number') {
					this.appStateService.setState(SplitPanel.MAP, Math.round(mapSize), appStatePrefix);
				}
				break;
			case SplitPanel.DATA_MANAGER:
				const [dataManagerSize, editorSize] = event.sizes;
				this.appStateService.setState(SplitPanel.DATA_MANAGER, dataManagerSize, appStatePrefix);
				this.appStateService.setState(SplitPanel.EDITOR, editorSize, appStatePrefix);
				break;
		}
	}

	ngOnDestroy(): void {
		this.layerManagerService.removeAll(false);
	}

	private handleEvent(userEvent: UserEvent, event: KeyboardEvent) {
		event.preventDefault();
		event.stopPropagation();
		this.userEventService.sendCommand(userEvent);
	}
}
