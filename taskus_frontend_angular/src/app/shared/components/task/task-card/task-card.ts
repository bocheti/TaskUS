import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Task } from '../../../../core/models/app.models';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './task-card.html',
  styleUrls: ['./task-card.scss']
})
export class TaskCard {
  @Input({ required: true }) task!: Task;
  @Input() isInteractive: boolean = false; 

  get statusColorClass(): string {
    switch (this.task.status) {
      case 'Pending':
        return 'bg-status-pending';
      case 'InProgress':
        return 'bg-status-progress';
      case 'Done':
        return 'bg-status-done';
      default:
        return 'bg-muted';
    }
  }

  get deadlineInfo(): { text: string; isOverdue: boolean } | null {
    if (!this.task.deadline) return null;
    
    const deadlineDate = new Date(this.task.deadline);
    if (isNaN(deadlineDate.getTime())) {
      return { text: 'Invalid date', isOverdue: false };
    }
    
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const deadlineMidnight = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
    const diffTime = deadlineMidnight.getTime() - todayMidnight.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `Overdue by ${Math.abs(diffDays)} days`, isOverdue: true };
    } else if (diffDays === 0) {
      return { text: 'Due today', isOverdue: false };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', isOverdue: false };
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays} days`, isOverdue: false };
    } else {
      return { text: deadlineDate.toLocaleDateString(), isOverdue: false };
    }
  }
}