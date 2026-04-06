import { TestBed } from '@angular/core/testing';

import { TaskGroup } from './task-group';

describe('TaskGroup', () => {
  let service: TaskGroup;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskGroup);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
