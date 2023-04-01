import { Component } from '@angular/core';
import * as L from 'leaflet';

import { DataLayer, LayerType } from '../data-layer';
import { CodeViewerOptions } from '../code-viewer/code-viewer.component';
import { Router } from '@angular/router';
import { Constants } from '../constants';
import { PreloadService } from '../preload.service';
import { ExampleData } from '../example-data';
import { LayerManagerService } from '../layer-manager.service';

interface CodeSnippet {
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
export class AboutComponent {

  constructor(
    private preloadService: PreloadService,
    private layerManagerService: LayerManagerService,
    private router: Router
  ) { }

  snippets: CodeSnippet[] = [
    {
      description: $localize `Select features by attribute value`,
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
      description: $localize `Select features by location`,
      codeViewerOptions: {
        initialValue:
`// Select features within 10,000 kilometres of a point
const { default: distance } = await import('https://unpkg.com/@turf/distance?module');
const point = { type: "Point", coordinates: [0, 0] };
return layer1.features.filter(feature =>
  distance(point, feature) < 10_000);`,
        monacoEditorOptions: defaultMonacoEditorOptions
      },
      dataLayers: [defaultDataLayer],
      rowspan: 3,
      colspan: fullRowColspan
    },
    {
      description: $localize `Compute a new attribute field`,
      codeViewerOptions: {
        initialValue:
`// Compute "time-to-close" attribute
return layer1.features.map(feature => {

  // Calculate new field
  feature.properties.timeToCloseMillis = (
    new Date(feature.properties.closed).getTime() -
    new Date(feature.properties.date).getTime()
  );

  return feature;
});`,
        monacoEditorOptions: defaultMonacoEditorOptions
      },
      dataLayers: [defaultDataLayer],
      rowspan: 5,
      colspan: fullRowColspan
    },
    {
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
      description: $localize `Compute a new feature layer`,
      codeViewerOptions: {
        initialValue:
`/*
 * Show the path of a tropical storm.
 */

// Select points from a specific event
const eventFeatures = layer1.features
  .filter(feature => feature.properties.id === 'EONET_5143');

// Sort event points by date
eventFeatures.sort((a, b) => (
  new Date(a.properties.date).getTime() -
  new Date(b.properties.date).getTime()
));

// Color code the start and end events
eventFeatures[0].properties.style = {
  fillColor: '#53d453' // Green
}; 
eventFeatures[eventFeatures.length - 1].properties.style = {
  fillColor: '#ea6868'  // Red
};

// Build the event path line string
const lineString = {
	type: "LineString",
	coordinates: eventFeatures.map(f => f.geometry.coordinates)
};

return {
	type: 'FeatureCollection',
	features: [lineString].concat(eventFeatures)
};`,
        monacoEditorOptions: defaultMonacoEditorOptions
      },
      dataLayers: [defaultDataLayer],
      mapOptions: {
        center: L.latLng(23, -84),
        zoom: 5
      },
      rowspan: 13,
      colspan: fullRowColspan
    }
  ];

  runSnippet(snippet: CodeSnippet): void {
    this.preloadService.options = {
      script: snippet.codeViewerOptions.initialValue,
      layers: snippet.dataLayers,
      mapOptions: snippet.mapOptions
    }
    this.router.navigate([Constants.PATH_MAPPING_ENVIRONMENT]);
  }
}
