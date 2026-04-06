import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordScreen } from './reset-password-screen';

describe('ResetPasswordScreen', () => {
  let component: ResetPasswordScreen;
  let fixture: ComponentFixture<ResetPasswordScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
