import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestScreen } from './request-screen';

describe('RequestScreen', () => {
  let component: RequestScreen;
  let fixture: ComponentFixture<RequestScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
