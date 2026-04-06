import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationSettingsScreen } from './organisation-settings-screen';

describe('OrganisationSettingsScreen', () => {
  let component: OrganisationSettingsScreen;
  let fixture: ComponentFixture<OrganisationSettingsScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganisationSettingsScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganisationSettingsScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
