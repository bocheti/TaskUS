import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailScreen } from './project-detail-screen';

describe('ProjectDetailScreen', () => {
  let component: ProjectDetailScreen;
  let fixture: ComponentFixture<ProjectDetailScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDetailScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDetailScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
