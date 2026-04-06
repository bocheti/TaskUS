import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskGroupDetailScreen } from './task-group-detail-screen';

describe('TaskGroupDetailScreen', () => {
  let component: TaskGroupDetailScreen;
  let fixture: ComponentFixture<TaskGroupDetailScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskGroupDetailScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskGroupDetailScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
