import { Observable, Subject } from 'rxjs';

import { Injectable } from '@angular/core';

export enum ConsoleEventType {
	log = 'log',
	trace = 'trace',
	debug = 'debug',
	info = 'info',
	warn = 'warn',
	error = 'error',
}
export interface ConsoleEvent {
	type: ConsoleEventType;
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
				type: ConsoleEventType.error,
				value: Array.isArray(data) ? data.join(' ') : data
			});
			originalErr(...data);
		};
	}
}
