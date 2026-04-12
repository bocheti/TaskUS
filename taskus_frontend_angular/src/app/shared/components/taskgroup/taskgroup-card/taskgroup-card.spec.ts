import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskgroupCard } from './taskgroup-card';

describe('TaskgroupCard', () => {
  let component: TaskgroupCard;
  let fixture: ComponentFixture<TaskgroupCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskgroupCard],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskgroupCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
