import { TestBed } from '@angular/core/testing';

import { DoodleDrawServiceService } from './doodle-draw-service.service';

describe('DoodleDrawServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DoodleDrawServiceService = TestBed.get(DoodleDrawServiceService);
    expect(service).toBeTruthy();
  });
});
