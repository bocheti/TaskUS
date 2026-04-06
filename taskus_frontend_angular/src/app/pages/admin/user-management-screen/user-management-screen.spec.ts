import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserManagementScreen } from './user-management-screen';

describe('UserManagementScreen', () => {
  let component: UserManagementScreen;
  let fixture: ComponentFixture<UserManagementScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserManagementScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagementScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
