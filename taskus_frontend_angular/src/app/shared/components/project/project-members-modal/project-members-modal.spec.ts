import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectMembersModal } from './project-members-modal';

describe('ProjectMembersModal', () => {
  let component: ProjectMembersModal;
  let fixture: ComponentFixture<ProjectMembersModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectMembersModal],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectMembersModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
