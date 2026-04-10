import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskCalendar } from './task-calendar';

describe('TaskCalendar', () => {
  let component: TaskCalendar;
  let fixture: ComponentFixture<TaskCalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCalendar],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCalendar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
