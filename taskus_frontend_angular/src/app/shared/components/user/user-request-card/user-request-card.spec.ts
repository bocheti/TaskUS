import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRequestCard } from './user-request-card';

describe('UserRequestCard', () => {
  let component: UserRequestCard;
  let fixture: ComponentFixture<UserRequestCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRequestCard],
    }).compileComponents();

    fixture = TestBed.createComponent(UserRequestCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
