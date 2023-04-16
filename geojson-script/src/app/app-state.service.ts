import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class AppStateService {

	getState<T>(key: string, prefix?: string): T | null {
		const computedKey = this.computeKey(key, prefix);
		const state = localStorage.getItem(computedKey);
		if (state !== null) {
			try {
				return JSON.parse(state);
			} catch (err) {
				console.warn(`Unable to load state for: ${computedKey}`, err);
			}
		}
		return null;
	}

	setState<T>(key: string, value: T, prefix?: string): void {
		const computedKey = this.computeKey(key, prefix);
		try {
			localStorage.setItem(computedKey, JSON.stringify(value));
		} catch (err) {
			console.warn(`Unable to save state for ${computedKey}: `, err)
		}
	}

	private computeKey(key: string, prefix?: string) {
		return prefix ? `${prefix}_${key}` : key;
	}
}
