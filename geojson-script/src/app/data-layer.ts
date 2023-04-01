export enum LayerType {
  INPUT = 'INPUT',
  SCRATCH = 'SCRATCH'
}

export interface DataLayer {
  name: string;
  path?: string;
  content: any;
  zIndex: number;
  style?: any;
  type: LayerType;
  mapLayer?: L.GeoJSON;
}
  