import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizedLayout } from './authorized-layout';

describe('AuthorizedLayout', () => {
  let component: AuthorizedLayout;
  let fixture: ComponentFixture<AuthorizedLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorizedLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorizedLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
