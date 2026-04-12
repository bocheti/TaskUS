import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOrganisationDialog } from './edit-organisation-dialog';

describe('EditOrganisationDialog', () => {
  let component: EditOrganisationDialog;
  let fixture: ComponentFixture<EditOrganisationDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditOrganisationDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(EditOrganisationDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
