import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  DragDropModule
} from '@angular/cdk/drag-drop';
import { Task, TaskStatus } from '../../../../core/models/app.models';
import { TaskCard } from '../task-card/task-card';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskCard],
  templateUrl: './kanban-board.html',
  styleUrls: ['./kanban-board.scss']
})
export class KanbanBoard implements OnChanges {
  @Input({ required: true }) tasks: Task[] = [];
  @Output() taskClick = new EventEmitter<Task>();
  @Output() statusChange = new EventEmitter<{ taskId: string; newStatus: TaskStatus }>();
  activeListId: string | null = null;
  pendingTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tasks'] && this.tasks) {
      this.pendingTasks = this.tasks.filter(t => t.status === 'Pending');
      this.inProgressTasks = this.tasks.filter(t => t.status === 'InProgress');
      this.doneTasks = this.tasks.filter(t => t.status === 'Done');
    }
  }

  drop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      // The user dropped the task in the SAME column (just reordering)
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // The user dropped the task in a DIFFERENT column
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      const movedTask = event.container.data[event.currentIndex];
      const newStatus = event.container.id as TaskStatus; 
      this.statusChange.emit({ taskId: movedTask.id, newStatus });
    }
  }
}