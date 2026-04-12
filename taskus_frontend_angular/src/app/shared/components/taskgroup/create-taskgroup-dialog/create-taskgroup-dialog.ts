import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { toast } from 'ngx-sonner';

import { TaskGroupService } from '../../../../core/services/task-group';

@Component({
  selector: 'app-create-taskgroup-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './create-taskgroup-dialog.html',
  styleUrls: ['./create-taskgroup-dialog.scss']
})
export class CreateTaskGroupDialog {
  @Input() isOpen = false;
  @Input({ required: true }) projectId!: string;
  
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() taskGroupCreated = new EventEmitter<void>();

  title = '';
  description = '';
  isSubmitting = false;

  constructor(private taskGroupService: TaskGroupService) {}

  handleSubmit(): void {
    if (!this.title.trim()) {
      toast.error('Task group title is required');
      return;
    }

    this.isSubmitting = true;

    this.taskGroupService.createTaskGroup({
      title: this.title.trim(),
      description: this.description.trim() || '',
      projectId: this.projectId
    }).subscribe({
      next: () => {
        this.title = '';
        this.description = '';
        this.isSubmitting = false;
        this.taskGroupCreated.emit();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error creating task group:', error);
        const errorMessage = error.error?.error || 'Failed to create task group';
        toast.error(errorMessage);
        this.isSubmitting = false;
      }
    });
  }

  handleCancel(): void {
    this.title = '';
    this.description = '';
    this.isOpenChange.emit(false);
  }
}