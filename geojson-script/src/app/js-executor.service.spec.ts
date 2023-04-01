import { TestBed } from '@angular/core/testing';

import { JsExecutorService } from './js-executor.service';

describe('JsExecutorService', () => {
  let service: JsExecutorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JsExecutorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
