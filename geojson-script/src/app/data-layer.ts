import { DataLayerRecord } from "./db";

export interface DataLayer extends DataLayerRecord {
  mapLayer?: WeakRef<L.GeoJSON>;
  hide?: boolean
}
  