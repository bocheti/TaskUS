import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectListScreen } from './project-list-screen';

describe('ProjectListScreen', () => {
  let component: ProjectListScreen;
  let fixture: ComponentFixture<ProjectListScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectListScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectListScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
