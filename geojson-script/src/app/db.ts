// db.ts
import Dexie, { Table } from 'dexie';

export enum LayerType {
    INPUT = 'INPUT',
    SCRATCH = 'SCRATCH'
}
    
export interface DataLayerRecord {
    name: string;
    path?: string;
    content: any;
    zIndex: number;
    style?: any;
    type: LayerType;
}

export class AppDB extends Dexie {

    private static databaseName = 'geojsonScript';

    dataLayers!: Table<DataLayerRecord, string>;

    constructor() {
        super(AppDB.databaseName);
        this.version(1).stores({
            dataLayers: 'name'
        });
    }
}

export const db = new AppDB();
