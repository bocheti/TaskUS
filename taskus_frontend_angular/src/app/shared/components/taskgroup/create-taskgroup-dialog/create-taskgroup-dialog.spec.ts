import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTaskgroupDialog } from './create-taskgroup-dialog';

describe('CreateTaskgroupDialog', () => {
  let component: CreateTaskgroupDialog;
  let fixture: ComponentFixture<CreateTaskgroupDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTaskgroupDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTaskgroupDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
