import { TestBed } from '@angular/core/testing';

import { ConsoleListenerService } from './console-listener.service';

describe('ConsoleListenerService', () => {
	let service: ConsoleListenerService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(ConsoleListenerService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
