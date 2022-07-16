import { TestBed } from '@angular/core/testing';

import { SessionResolverService } from './session-resolver.service';

describe('SessionResolverService', () => {
  let service: SessionResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
