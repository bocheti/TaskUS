import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { Task, User } from '../../../core/models/app.models';
import { TaskService } from '../../../core/services/task';
import { AuthService } from '../../../core/services/auth';
import { AuthorizedLayout } from '../../../shared/components/layout/authorized-layout/authorized-layout';
import { StatsOverviewCard } from '../../../shared/components/dashboard/stats-overview-card/stats-overview-card';
import { RecentCompletedCard } from '../../../shared/components/dashboard/recent-completed-card/recent-completed-card';
import { TaskCalendar } from '../../../shared/components/dashboard/task-calendar/task-calendar';
import { TaskCard } from '../../../shared/components/task/task-card/task-card';
import { TaskModal } from '../../../shared/components/task/task-modal/task-modal';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AuthorizedLayout,
    StatsOverviewCard,
    RecentCompletedCard,
    TaskCalendar,
    TaskCard,
    TaskModal
  ],
  templateUrl: './dashboard-screen.html',
  styleUrls: ['./dashboard-screen.scss']
})
export class DashboardScreen implements OnInit {
  currentUser: User | null = null;
  tasks: Task[] = [];
  isLoading = true;
  
  selectedTask: Task | null = null;
  isModalOpen = false;

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.fetchTasks();
  }

  fetchTasks(): void {
    if (!this.currentUser) return;

    this.isLoading = true;
    const request$ = this.currentUser.role === 'admin' 
      ? this.taskService.getAllTasks() 
      : this.taskService.getTasksByUser(this.currentUser.id);
    request$.subscribe({
      next: (userTasks) => {
        this.tasks = userTasks;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        toast.error('Failed to load tasks');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get tasksToDisplay(): Task[] {
    const tasksToBeDone = this.tasks.filter(task => task.status !== 'Done');
    const tasksWithDeadline = tasksToBeDone.filter(task => task.deadline);
    const tasksWithoutDeadline = tasksToBeDone.filter(task => !task.deadline);
    
    // sort tasks w deadline by deadline
    const sortedByDeadline = tasksWithDeadline.sort(
      (a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()
    );
    
    // sort tasks w/o deadline by created date (oldest first)
    const sortedByCreated = tasksWithoutDeadline.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // combine: tasks with deadlines first, then fill with oldest created
    return [...sortedByDeadline, ...sortedByCreated].slice(0, 3);
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  get currentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  goToAllTasks(): void {
    this.router.navigate(['/tasks']);
  }

  openTaskModal(task: Task): void {
    this.selectedTask = task;
    this.isModalOpen = true;
  }

  closeTaskModal(): void {
    this.isModalOpen = false;
    this.selectedTask = null;
  }

  handleTaskUpdated(updatedTask: Task): void {
    this.tasks = this.tasks.map(t => 
      t.id === updatedTask.id ? updatedTask : t
    );
  }
}