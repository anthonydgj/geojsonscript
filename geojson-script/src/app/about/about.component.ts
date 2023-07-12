import packageJson from 'package.json';
import { first } from 'rxjs';

import { ViewportScroller } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CodeViewerOptions } from '../code-viewer/code-viewer.component';
import { Constants } from '../constants';
import { DataLayer } from '../data-layer';
import { LayerType } from '../db';
import { ExampleData } from '../example-data';
import { PreloadService } from '../preload.service';

interface CodeSnippet {
	path: string;
	description: string;
	codeViewerOptions: CodeViewerOptions;
	dataLayers: DataLayer[];
	mapOptions?: any;
	rowspan: number;
	colspan: number;
}

const fullRowColspan = 3;

const defaultMonacoEditorOptions = {
	language: 'javascript',
	automaticLayout: true,
	readOnly: true,
	minimap: {
		enabled: false
	},
	scrollbar: {
		vertical: 'auto',
		alwaysConsumeMouseWheel: false
	},
	scrollBeyondLastLine: false
};

const defaultDataLayer: DataLayer = {
	name: 'layer1',
	content: ExampleData.EONET_DATA,
	zIndex: 1,
	type: LayerType.INPUT,
	style: {
		fillColor: '#776cc0',
		color: 'black',
		fillOpacity: 0.6
	}
};

@Component({
	selector: 'app-about',
	templateUrl: './about.component.html',
	styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit, AfterViewInit {

	rowAdjustment = 1;
	isCondensedScreen = false;
	version = packageJson.version;

	private readonly condensedScreenWidthPixels = 600;

	constructor(
		private preloadService: PreloadService,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private scroller: ViewportScroller
	) { }

	ngOnInit() {
		this.refreshLayout(window.innerWidth);
	}

	ngAfterViewInit() {
		this.activatedRoute.fragment.pipe(first()).subscribe(fragment => {
			if (fragment) {
				this.scroller.scrollToAnchor(fragment);
			}
		});
	}

	onResize(event: any) {
		this.refreshLayout(event.target.innerWidth);
	}

	private refreshLayout(innerWidth: number) {
		if (innerWidth <= this.condensedScreenWidthPixels) {
			this.rowAdjustment = 4;
			this.isCondensedScreen = true;
		} else {
			this.rowAdjustment = 1;
			this.isCondensedScreen = false;
		}
	}

	snippets: CodeSnippet[] = [
		{
			path: 'selectByAttribute',
			description: $localize`Select features by attribute value`,
			codeViewerOptions: {
				initialValue:
					`// Select features with a magnitude greater than 100
return layer1.features.filter(feature =>
  feature.properties.magnitudeValue > 100);`,
				monacoEditorOptions: defaultMonacoEditorOptions
			},
			dataLayers: [defaultDataLayer],
			rowspan: 2,
			colspan: fullRowColspan
		},
		{
			path: 'selectByLocation',
			description: $localize`Select features by location`,
			codeViewerOptions: {
				initialValue:
					`// Select features within 10,000 kilometres of a point

console.log('Loading turf library...');
const turf = await ${Constants.HELPER_NAME_IMPORT}('turf');
const range = 10_000;
const point = turf.point([0,0]);

console.log(\`Filtering events within \${range}km of \${point.geometry.coordinates}...\`);
return layer1.features.filter(feature =>
  turf.distance(point, feature) < range);`,
				monacoEditorOptions: defaultMonacoEditorOptions
			},
			dataLayers: [defaultDataLayer],
			rowspan: 5,
			colspan: fullRowColspan
		},
		{
			path: 'computeAttribute',
			description: $localize`Compute a new attribute field`,
			codeViewerOptions: {
				initialValue:
					`// Compute event duration

return layer1.features.map(feature => {
  feature.properties.duration = (
    new Date(feature.properties.closed).getTime() -
    new Date(feature.properties.date).getTime()
  );
  return feature;
});`,
				monacoEditorOptions: defaultMonacoEditorOptions
			},
			dataLayers: [defaultDataLayer],
			rowspan: 4,
			colspan: fullRowColspan
		},
		{
			path: 'summarizeAttributes',
			description: $localize`Summarize attribute data`,
			codeViewerOptions: {
				initialValue:
					`// Calculate min, max, and mean magnitude

const magnitudes = layer1.features
  .filter(feature => typeof feature.properties.magnitudeValue === 'number')
  .map(feature => feature.properties.magnitudeValue);
const min = Math.min(...magnitudes);
const max = Math.max(...magnitudes);
const sum = magnitudes.reduce((acc, cur) => acc + cur, 0);
const mean = sum / magnitudes.length;

// Print results
console.info(\`Maximum magnitude: \${max}\`);
console.info(\`Minimum magnitude: \${min}\`);
console.info(\`Mean magnitude: \${mean.toFixed(2)}\`);`,
				monacoEditorOptions: defaultMonacoEditorOptions
			},
			dataLayers: [defaultDataLayer],
			rowspan: 6,
			colspan: fullRowColspan
		},
		{
			path: 'fetchRemote',
			description: $localize`Fetch data from a remote source and compute a new layer`,
			codeViewerOptions: {
				initialValue:
					`// Fetch and display earthquake clusters

console.log('Importing libraries...');
const moment = await importPackage('moment');
const clustersDbscan = await importPackage('@turf/clusters-dbscan');
const randomColor = await importPackage('randomcolor');

console.log('Loading earthquake data from USGS...');
const numDays = 7;
const startDate = moment().subtract(numDays, 'days').format('YYYY-MM-DD');
const endDate = moment().format('YYYY-MM-DD');
const url = \`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=\${startDate}&endtime=\${endDate}\`;
const response = await fetch(url);
const earthquakes = await response.json();
console.info(\`\${earthquakes.metadata.count} earthquakes in the last \${numDays} days.\`);

console.log('Computing clusters...');
const maxDistanceKm = 300;
const clusteredEarthquakes = clustersDbscan(earthquakes, maxDistanceKm, {
  minPoints: 5
});

console.log('Building cluster colour map...')
const clusterSet = new Set();
clusteredEarthquakes.features.forEach(feature => {
  clusterSet.add(feature.properties.cluster)
});
const colourMap = new Map();
clusterSet.forEach(cluster => {
  const colour = randomColor({
      luminosity: 'bright',
    });
  colourMap.set(cluster, colour);
});

console.log('Colour-coding cluster members...')
clusteredEarthquakes.features.forEach(feature => {
  const dbscan = feature.properties.dbscan;
  const clusterColour = colourMap.get(feature.properties.cluster);
  feature.properties.style = {
    fillColor: dbscan === 'noise' ? 'white' : clusterColour,
    color: 'black',
    fillOpacity: 0.8
  };
});

console.log('Done.\\n');
return clusteredEarthquakes;`,
				monacoEditorOptions: defaultMonacoEditorOptions
			},
			dataLayers: [],
			rowspan: 19,
			colspan: fullRowColspan
		}
	];

	async runSnippet(snippet: CodeSnippet) {
		// Preserve scroll position in router history
		await this.router.navigate([], {
			fragment: snippet.path
		});
		this.preloadService.options = {
			script: snippet.codeViewerOptions.initialValue,
			layers: snippet.dataLayers,
			mapOptions: snippet.mapOptions
		}
		this.router.navigate([Constants.PATH_MAPPING_ENVIRONMENT]);
	}
}
