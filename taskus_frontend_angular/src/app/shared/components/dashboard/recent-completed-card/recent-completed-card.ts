import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../../core/models/app.models';

@Component({
  selector: 'app-recent-completed-card',
  standalone: true,
  imports: [CommonModule], // Required for the DatePipe we use in the HTML!
  templateUrl: './recent-completed-card.html',
  styleUrls: ['./recent-completed-card.scss']
})
export class RecentCompletedCard {
  @Input({ required: true }) tasks: Task[] = [];
  @Input() isLoading: boolean = false;

  get recentlyCompleted(): Task[] {
    return this.tasks
      .filter(task => task.status === 'Done' && task.completedAt)
      .sort((a, b) => {
        return new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime();
      })
      .slice(0, 3);
  }
}