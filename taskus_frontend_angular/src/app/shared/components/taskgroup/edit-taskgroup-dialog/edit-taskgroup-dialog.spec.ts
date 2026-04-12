import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTaskgroupDialog } from './edit-taskgroup-dialog';

describe('EditTaskgroupDialog', () => {
  let component: EditTaskgroupDialog;
  let fixture: ComponentFixture<EditTaskgroupDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTaskgroupDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(EditTaskgroupDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
