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

export interface Script {
    id: number;
    content: string;
}

export class AppDB extends Dexie {

    private static databaseName = 'geojsonScript';

    dataLayers!: Table<DataLayerRecord, string>;
    scripts!: Table<Script, number>;

    constructor() {
        super(AppDB.databaseName);
        this.version(1).stores({
            dataLayers: 'name',
            scripts: '++id'
        });
    }
}

export const db = new AppDB();
