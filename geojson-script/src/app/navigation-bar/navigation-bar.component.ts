import { Component } from '@angular/core';

import { Constants } from '../constants';

@Component({
	selector: 'app-navigation-bar',
	templateUrl: './navigation-bar.component.html',
	styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent {
	links = [
		{
			name: 'Map',
			path: Constants.PATH_MAPPING_ENVIRONMENT
		},
		{
			name: 'About',
			path: Constants.PATH_ABOUT
		}
	]
}
