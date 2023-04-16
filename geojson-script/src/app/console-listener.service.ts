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

	postConsoleEvent(event: ConsoleEvent) {
		this.consoleEvents$.next(event);
	}

	getConsoleEvents(): Observable<ConsoleEvent> {
		return this.consoleEvents$.asObservable();
	}

}
