import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordRequestScreen } from './reset-password-request-screen';

describe('ResetPasswordRequestScreen', () => {
  let component: ResetPasswordRequestScreen;
  let fixture: ComponentFixture<ResetPasswordRequestScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordRequestScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordRequestScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
