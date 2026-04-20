import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { toast } from 'ngx-sonner';

import { User } from '../../../../core/models/app.models';
import { TaskService } from '../../../../core/services/task';
import { UserService } from '../../../../core/services/user';
import { ProjectService } from '../../../../core/services/project';

@Component({
  selector: 'app-create-task-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './create-task-dialog.html',
  styleUrls: ['./create-task-dialog.scss']
})
export class CreateTaskDialog implements OnChanges {
  @Input() isOpen = false;
  @Input({ required: true }) taskGroupId!: string;
  @Input({ required: true }) projectId!: string;

  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() taskCreated = new EventEmitter<void>();

  title = '';
  description = '';
  deadline = '';
  responsibleId = '';
  users: User[] = [];
  isSubmitting = false;

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.fetchUsers();
    }
  }

  fetchUsers(): void {
    this.projectService.getProjectMembers(this.projectId).subscribe({
      next: (allUsers) => {
        this.users = allUsers;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      }
    });
  }

  handleSubmit(): void {
    if (!this.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    if (!this.responsibleId) {
      toast.error('Please assign the task to a user');
      return;
    }

    this.isSubmitting = true;

    this.taskService.createTask({
      title: this.title.trim(),
      description: this.description.trim() || '',
      responsibleId: this.responsibleId,
      taskGroupId: this.taskGroupId,
      deadline: this.deadline || null
    }).subscribe({
      next: () => {
        this.resetForm();
        this.isSubmitting = false;
        this.taskCreated.emit();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error creating task:', error);
        const errorMessage = error.error?.error || 'Failed to create task';
        toast.error(errorMessage);
        this.isSubmitting = false;
      }
    });
  }

  handleCancel(): void {
    this.resetForm();
    this.isOpenChange.emit(false);
  }

  private resetForm(): void {
    this.title = '';
    this.description = '';
    this.deadline = '';
    this.responsibleId = '';
  }
}