import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutUsScreen } from './about-us-screen';

describe('AboutUsScreen', () => {
  let component: AboutUsScreen;
  let fixture: ComponentFixture<AboutUsScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutUsScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutUsScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
