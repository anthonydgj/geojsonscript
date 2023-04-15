import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { ActivatedRoute, Router } from '@angular/router';

import packageJson from 'package.json';
import { DataLayer } from '../data-layer';
import { CodeViewerOptions } from '../code-viewer/code-viewer.component';
import { Constants } from '../constants';
import { PreloadService } from '../preload.service';
import { ExampleData } from '../example-data';
import { LayerType } from '../db';
import { ViewportScroller } from '@angular/common';
import { first } from 'rxjs';

interface CodeSnippet {
  path: string;
  description: string;
  codeViewerOptions: CodeViewerOptions;
  dataLayers: DataLayer[];
  mapOptions?: L.MapOptions;
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
    
  onResize(event:any ) {
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
      description: $localize `Select features by attribute value`,
      codeViewerOptions: {
        initialValue:
`// Select features with a magnitude greater than 100
return layer1.features.filter(feature =>
  feature.properties.magnitudeValue > 100);`,
        monacoEditorOptions: defaultMonacoEditorOptions
      },
      dataLayers: [defaultDataLayer],
      rowspan: 3,
      colspan: fullRowColspan
    },
    {
      path: 'selectByLocation',
      description: $localize `Select features by location`,
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
      rowspan: 4,
      colspan: fullRowColspan
    },
    {
      path: 'computeAttribute',
      description: $localize `Compute a new attribute field`,
      codeViewerOptions: {
        initialValue:
`return layer1.features.map(feature => {
  feature.properties.timeToCloseMillis = (
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
      description: $localize `Summarize attribute data`,
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
console.info(\`Maximum: \${max}\`);
console.info(\`Minimum: \${min}\`);
console.info(\`Mean: \${mean.toFixed(2)}\`);`,
        monacoEditorOptions: defaultMonacoEditorOptions
      },
      dataLayers: [defaultDataLayer],
      rowspan: 6,
      colspan: fullRowColspan
    },
    {
      path: 'computeNewFeatures',
      description: $localize `Compute a new feature layer`,
      codeViewerOptions: {
        initialValue:
`// Visualize event path

console.log('Importing libraries...');
const turf = await ${Constants.HELPER_NAME_IMPORT}('turf');
const moment = await ${Constants.HELPER_NAME_IMPORT}('moment');

console.log('Calculating event path...');

// Select points from a specific event
const eventFeatures = layer1.features
  .filter(feature => feature.properties.id === 'EONET_5143');

// Sort event points by date
eventFeatures.sort((a, b) => (
  moment.utc(a.properties.date).isBefore(
    moment.utc(b.properties.date)
  )
));

// Colour-code the start/end events
const start = eventFeatures[0];
start.properties.style = {
  fillColor: '#53d453' // Green
}; 
const end = eventFeatures[eventFeatures.length - 1];
end.properties.style = {
  fillColor: '#ea6868'  // Red
};

// Calculate event duration
const duration = moment.duration(
  moment(start.properties.date).diff(moment(end.properties.closed))
);
console.info(\`\${eventFeatures[0].properties.title} lasted \${duration.humanize()}\`);

// Build the event path line string
const lineString = turf
  .lineString(eventFeatures.map(f => f.geometry.coordinates));

return turf.featureCollection([lineString].concat(eventFeatures));`,
        monacoEditorOptions: defaultMonacoEditorOptions
      },
      dataLayers: [defaultDataLayer],
      mapOptions: {
        center: L.latLng(23, -84),
        zoom: 5
      },
      rowspan: 16,
      colspan: fullRowColspan
    },
    {
      path: 'fetchRemote',
      description: $localize `Fetch data from a remote source`,
      codeViewerOptions: {
        initialValue:
`// Fetch and display earthquakes from the last week

console.log('Importing libraries...');
const moment = await importPackage('moment');
const turf = await importPackage('turf');

console.log('Loading earthquake data from USGS...');
const startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
const endDate = moment().format('YYYY-MM-DD');
const url = \`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=\${startDate}\&endtime=\${endDate}\`;
const response = await fetch(url);
const data = await response.json();

console.info(\`\${data.metadata.count} earthquakes in the last week.\`);
return data;`,
        monacoEditorOptions: defaultMonacoEditorOptions
      },
      dataLayers: [],
      rowspan: 7,
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
