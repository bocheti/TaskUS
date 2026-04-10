import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../../core/models/app.models';

@Component({
  selector: 'app-stats-overview-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-overview-card.html',
  styleUrls: ['./stats-overview-card.scss']
})
export class StatsOverviewCard {
  @Input({ required: true }) tasks: Task[] = [];
  @Input() isLoading: boolean = false;

  get totalTasks(): number {
    return this.tasks.length;
  }

  get pendingTasksCount(): number {
    return this.tasks.filter(task => task.status === 'Pending').length;
  }

  get inProgressTasksCount(): number {
    return this.tasks.filter(task => task.status === 'InProgress').length;
  }

  get doneTasksCount(): number {
    return this.tasks.filter(task => task.status === 'Done').length;
  }

  get completionRate(): number {
    return this.totalTasks > 0 
      ? Math.round((this.doneTasksCount / this.totalTasks) * 100) 
      : 0;
  }

  // Helper method for the progress bars
  getPercentage(count: number): number {
    return this.totalTasks > 0 ? (count / this.totalTasks) * 100 : 0;
  }
}