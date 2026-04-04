import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrgScreen } from './create-org-screen';

describe('CreateOrgScreen', () => {
  let component: CreateOrgScreen;
  let fixture: ComponentFixture<CreateOrgScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOrgScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateOrgScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
