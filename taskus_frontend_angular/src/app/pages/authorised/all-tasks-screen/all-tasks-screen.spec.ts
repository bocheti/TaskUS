import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllTasksScreen } from './all-tasks-screen';

describe('AllTasksScreen', () => {
  let component: AllTasksScreen;
  let fixture: ComponentFixture<AllTasksScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllTasksScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(AllTasksScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
