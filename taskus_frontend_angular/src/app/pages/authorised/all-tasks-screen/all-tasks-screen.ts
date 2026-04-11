import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { toast } from 'ngx-sonner';

// Models & Services
import { Task, TaskStatus, User } from '../../../core/models/app.models';
import { TaskService } from '../../../core/services/task';
import { AuthService } from '../../../core/services/auth';

// Layout & Child Components
import { AuthorizedLayout } from '../../../shared/components/layout/authorized-layout/authorized-layout';
import { TaskCard } from '../../../shared/components/task/task-card/task-card';
import { TaskModal } from '../../../shared/components/task/task-modal/task-modal';
import { KanbanBoard } from '../../../shared/components/task/kanban-board/kanban-board';

type FilterStatus = 'All' | TaskStatus;

@Component({
  selector: 'app-all-tasks',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    AuthorizedLayout,
    TaskCard,
    TaskModal,
    KanbanBoard
  ],
  templateUrl: './all-tasks-screen.html',
  styleUrls: ['./all-tasks-screen.scss']
})
export class AllTasksScreen implements OnInit {
  currentUser: User | null = null;
  
  tasks: Task[] = [];
  isLoading = true;
  viewMode: 'list' | 'kanban' = 'kanban';
  filterStatus: FilterStatus = 'All';
  filteredTasks: Task[] = [];
  readonly filterOptions: FilterStatus[] = ['All', 'Pending', 'InProgress', 'Done'];
  statusCounts: Record<FilterStatus, number> = { All: 0, Pending: 0, InProgress: 0, Done: 0 };

  selectedTask: Task | null = null;
  isModalOpen = false;

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.fetchTasks();
  }

  goBack(): void {
    this.location.back();
  }

  fetchTasks(): void {
    if (!this.currentUser) return;

    this.isLoading = true;
    const request$ = this.currentUser.role === 'admin' 
      ? this.taskService.getAllTasks() 
      : this.taskService.getTasksByUser(this.currentUser.id);

    request$.subscribe({
      next: (userTasks) => {
        // Sort: Deadlines first, No deadlines last
        this.tasks = userTasks.sort((a, b) => {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        });
        
        this.updateDerivedState();
        this.isLoading = false;
        this.cdr.detectChanges(); // Fire the flare gun!
      },
      error: () => {
        toast.error('Failed to load tasks');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateDerivedState(): void {
    this.statusCounts = {
      All: this.tasks.length,
      Pending: this.tasks.filter(t => t.status === 'Pending').length,
      InProgress: this.tasks.filter(t => t.status === 'InProgress').length,
      Done: this.tasks.filter(t => t.status === 'Done').length,
    };

    this.filteredTasks = this.filterStatus === 'All' 
      ? this.tasks 
      : this.tasks.filter(task => task.status === this.filterStatus);
  }

  // --- UI Interactions ---

  setFilter(status: FilterStatus): void {
    this.filterStatus = status;
    this.updateDerivedState();
  }

  setViewMode(mode: 'list' | 'kanban'): void {
    this.viewMode = mode;
  }

  getStatusColorClass(status: FilterStatus): string {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'InProgress': return 'status-progress';
      case 'Done': return 'status-done';
      default: return 'status-muted';
    }
  }

  handleStatusChange(event: { taskId: string; newStatus: TaskStatus }): void {
    this.taskService.updateTaskStatus(event.taskId, { newStatus: event.newStatus }).subscribe({
      next: (updatedTask) => {
        this.tasks = this.tasks.map(t => t.id === event.taskId ? updatedTask : t);
        this.updateDerivedState();
        toast.success(`Task moved to ${event.newStatus === 'InProgress' ? 'In Progress' : event.newStatus}`);
        this.cdr.detectChanges();
      },
      error: () => {
        toast.error('Failed to update task status');
        // Fetch tasks again to revert the dragging visual if API fails
        this.fetchTasks(); 
      }
    });
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
    this.tasks = this.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    this.updateDerivedState();
    this.cdr.detectChanges();
  }
}