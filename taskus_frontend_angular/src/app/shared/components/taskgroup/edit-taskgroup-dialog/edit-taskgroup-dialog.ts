import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { toast } from 'ngx-sonner';

import { TaskGroup } from '../../../../core/models/app.models';
import { TaskGroupService } from '../../../../core/services/task-group';

@Component({
  selector: 'app-edit-taskgroup-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './edit-taskgroup-dialog.html',
  styleUrls: ['./edit-taskgroup-dialog.scss']
})
export class EditTaskGroupDialog implements OnChanges {
  @Input() isOpen = false;
  @Input({ required: true }) taskGroup!: TaskGroup;
  
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() taskGroupUpdated = new EventEmitter<TaskGroup>();

  title = '';
  description = '';
  isSubmitting = false;

  constructor(private taskGroupService: TaskGroupService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['taskGroup'] && this.taskGroup) {
      this.title = this.taskGroup.title;
      this.description = this.taskGroup.description || '';
    }
  }

  handleSubmit(): void {
    if (!this.title.trim()) {
      toast.error('Task group title is required');
      return;
    }
    this.isSubmitting = true;
    this.taskGroupService.updateTaskGroup(this.taskGroup.id, {
      newTitle: this.title.trim(),
      newDescription: this.description.trim() || ''
    }).subscribe({
      next: () => {
        toast.success('Task group updated successfully!');
        this.isSubmitting = false;
        const updatedGroup: TaskGroup = {
          ...this.taskGroup,
          title: this.title.trim(),
          description: this.description.trim() || ''
        };

        this.taskGroupUpdated.emit(updatedGroup);
        this.isOpenChange.emit(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error updating task group:', error);
        const errorMessage = error.error?.error || 'Failed to update task group';
        toast.error(errorMessage);
        this.isSubmitting = false;
      }
    });
  }

  handleCancel(): void {
    this.title = this.taskGroup.title;
    this.description = this.taskGroup.description || '';
    this.isOpenChange.emit(false);
  }
}