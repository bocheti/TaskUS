import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentCompletedCard } from './recent-completed-card';

describe('RecentCompletedCard', () => {
  let component: RecentCompletedCard;
  let fixture: ComponentFixture<RecentCompletedCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentCompletedCard],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentCompletedCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
