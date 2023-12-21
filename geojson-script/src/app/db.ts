// db.ts
import Dexie, { Table } from 'dexie';

export enum EditorLanguage {
	JavaScript = 'JavaScript',
	WktLang = 'WktLang',
}

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
	name: string;
	content: string;
	language: EditorLanguage;
}

export class AppDB extends Dexie {

	private static databaseName = 'geojsonScript';

	dataLayers!: Table<DataLayerRecord, string>;
	scripts!: Table<Script, string>;

	constructor() {
		super(AppDB.databaseName);
		this.version(1).stores({
			dataLayers: 'name',
			scripts: 'name'
		});
		this.version(2).stores({
			scripts: 'name',
		}).upgrade(tx => {
			return tx.table("scripts").toCollection().modify(script => {
				script.language = EditorLanguage.JavaScript
			});
		});
	}
}

export const db = new AppDB();
