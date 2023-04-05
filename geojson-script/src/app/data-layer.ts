import { DataLayerRecord } from "./db";

export interface DataLayer extends DataLayerRecord {
  mapLayer?: L.GeoJSON;
}
  