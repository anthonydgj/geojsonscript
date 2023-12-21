import { Observable, Subject } from 'rxjs';

import { Injectable } from '@angular/core';

export interface ConsoleEvent {
	type: string;
	value: any;
	date: Date;
}

@Injectable({
	providedIn: 'root'
})
export class ConsoleListenerService {

	private consoleEvents$ = new Subject<ConsoleEvent>();

	constructor() {
		this.installProxy();
	}

	postConsoleEvent(event: ConsoleEvent) {
		this.consoleEvents$.next(event);
	}

	getConsoleEvents(): Observable<ConsoleEvent> {
		return this.consoleEvents$.asObservable();
	}

	installProxy() {
		const originalErr = console.error;
		console.error = (...data: any[]) => {
			this.postConsoleEvent({
				date: new Date(),
				type: 'error',
				value: Array.isArray(data) ? data.join(' ') : data
			});
			originalErr(...data);
		};
	}
}
