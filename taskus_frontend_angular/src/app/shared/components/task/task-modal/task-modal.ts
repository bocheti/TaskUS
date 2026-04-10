import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Task, User } from '../../../../core/models/app.models';

// Updated import paths!
import { TaskService } from '../../../../core/services/task'; 
import { UserService } from '../../../../core/services/user';
import { AuthService } from '../../../../core/services/auth';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './task-modal.html',
  styleUrls: ['./task-modal.scss']
})
export class TaskModal implements OnChanges {
  @Input({ required: true }) task!: Task;
  @Input() isOpen: boolean = false;
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() taskUpdated = new EventEmitter<Task>();

  currentTask!: Task;
  responsibleUser: { firstName: string; lastName: string } | null = null;
  isTogglingStatus = false;
  currentUser: User | null = null;

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.currentUserValue; 
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task) {
      this.currentTask = { ...this.task };
      this.fetchResponsibleUser();
    }
  }

  fetchResponsibleUser(): void {
    this.responsibleUser = null; 
    this.userService.getUserInfo(this.currentTask.responsibleId).subscribe({
      next: (user) => {
        this.responsibleUser = { firstName: user.firstName, lastName: user.lastName };
      },
      error: (err) => console.error('Error fetching responsible user:', err)
    });
  }

  handleClose(): void {
    this.closeModal.emit();
  }

  handleToggleStatus(): void {
    this.isTogglingStatus = true;

    let newStatus: 'Pending' | 'InProgress' | 'Done';
    if (this.currentTask.status === 'Pending') {
      newStatus = 'InProgress';
    } else if (this.currentTask.status === 'InProgress') {
      newStatus = 'Done';
    } else {
      newStatus = 'Pending';
    }

    this.taskService.updateTaskStatus(this.currentTask.id, { newStatus }).subscribe({
      next: (updatedTask) => {
        this.currentTask = updatedTask;
        toast.success(`Task status updated to ${newStatus}`);
        this.taskUpdated.emit(updatedTask);
        this.isTogglingStatus = false;
      },
      error: () => {
        toast.error('Failed to update task status');
        this.isTogglingStatus = false;
      }
    });
  }

  handleDeleteTask(): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${this.currentTask.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    this.taskService.deleteTask(this.currentTask.id).subscribe({
      next: () => {
        toast.success('Task deleted successfully');
        this.handleClose();
        window.location.reload(); 
      },
      error: () => {
        toast.error('Failed to delete task');
      }
    });
  }

  // --- Getters for UI logic ---
  get statusColorClass(): string {
    switch (this.currentTask.status) {
      case 'Pending': return 'bg-status-pending';
      case 'InProgress': return 'bg-status-progress';
      case 'Done': return 'bg-status-done';
      default: return 'bg-muted';
    }
  }

  get nextStatusText(): string {
    if (this.currentTask.status === 'Pending') return 'Start Working';
    if (this.currentTask.status === 'InProgress') return 'Mark as Done';
    return 'Restart Task';
  }

  get isDeadlineOverdue(): boolean {
    if (!this.currentTask.deadline) return false;
    return new Date(this.currentTask.deadline) < new Date();
  }

  get formattedDeadline(): string {
    if (!this.currentTask.deadline) return 'No deadline';
    
    const deadlineDate = new Date(this.currentTask.deadline);
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const deadlineMidnight = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
    
    const diffTime = deadlineMidnight.getTime() - todayMidnight.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return `Due on ${deadlineDate.toLocaleDateString()}`;
    }
  }
}