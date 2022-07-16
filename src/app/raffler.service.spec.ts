import { TestBed } from '@angular/core/testing';

import { RafflerService } from './raffler.service';

describe('RafflerService', () => {
  let service: RafflerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RafflerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
