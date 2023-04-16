import { Observable, Subject } from 'rxjs';

import { Injectable } from '@angular/core';

export enum UserEvent {
	RUN_SCRIPT = 'RUN_SCRIPT',
	CLEAR_CONSOLE_OUTPUT = 'CLEAR_CONSOLE_OUTPUT'
}

@Injectable({
	providedIn: 'root'
})
export class UserEventService {

	private event$ = new Subject<UserEvent>();

	constructor() { }

	sendCommand(event: UserEvent) {
		this.event$.next(event);
	}

	getEvents(): Observable<UserEvent> {
		return this.event$.asObservable();
	}

}
