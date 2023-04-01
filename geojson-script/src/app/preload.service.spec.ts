import { TestBed } from '@angular/core/testing';

import { EditorPresetService } from './preload.service';

describe('EditorPresetService', () => {
  let service: EditorPresetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditorPresetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
