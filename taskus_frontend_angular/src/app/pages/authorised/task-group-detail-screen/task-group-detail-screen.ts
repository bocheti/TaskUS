import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { toast } from 'ngx-sonner';
import { TaskGroup, Task, User } from '../../../core/models/app.models';
import { AuthService } from '../../../core/services/auth';
import { TaskGroupService } from '../../../core/services/task-group';
import { TaskService } from '../../../core/services/task';
import { AuthorizedLayout } from '../../../shared/components/layout/authorized-layout/authorized-layout';
import { TaskCard } from '../../../shared/components/task/task-card/task-card';
import { TaskModal } from '../../../shared/components/task/task-modal/task-modal';
import { CreateTaskDialog } from '../../../shared/components/task/create-task-dialog/create-task-dialog';
import { EditTaskGroupDialog } from '../../../shared/components/taskgroup/edit-taskgroup-dialog/edit-taskgroup-dialog';
import { ConfirmDialog } from '../../../shared/components/ui/confirm-dialog/confirm-dialog';
import { LoadingSpinner } from '../../../shared/components/ui/loading-spinner/loading-spinner';

@Component({
  selector: 'app-taskgroup-detail-screen',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    AuthorizedLayout, 
    TaskCard, 
    TaskModal, 
    CreateTaskDialog, 
    EditTaskGroupDialog,
    ConfirmDialog,
    LoadingSpinner
  ],
  templateUrl: './task-group-detail-screen.html',
  styleUrls: ['./task-group-detail-screen.scss']
})
export class TaskGroupDetailScreen implements OnInit {
  taskGroupId: string | null = null;
  currentUser: User | null = null;

  taskGroup: TaskGroup | null = null;
  tasks: Task[] = [];
  
  isLoading = true;
  selectedTask: Task | null = null;
  
  isModalOpen = false;
  createDialogOpen = false;
  editDialogOpen = false;
  isDeleteDialogOpen = false;

  myTasks: Task[] = [];
  totalTasks = 0;
  pendingTasks = 0;
  inProgressTasks = 0;
  doneTasks = 0;
  pendingPercentage = 0;
  inProgressPercentage = 0;
  donePercentage = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private authService: AuthService,
    private taskGroupService: TaskGroupService,
    private taskService: TaskService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.taskGroupId = params.get('taskGroupId');
      if (this.taskGroupId) {
        this.fetchTaskGroupData();
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  fetchTaskGroupData(): void {
    if (!this.taskGroupId) return;

    this.isLoading = true;

    Promise.all([
      this.taskGroupService.getTaskGroup(this.taskGroupId).toPromise(),
      this.taskService.getTasksByTaskGroup(this.taskGroupId).toPromise()
    ]).then(([taskGroupData, tasksData]) => {
      if (taskGroupData) this.taskGroup = taskGroupData;
      if (tasksData) this.tasks = tasksData;

      this.updateDerivedState();
      this.isLoading = false;
      this.cdr.detectChanges();
    }).catch(error => {
      console.error('Error fetching task group data:', error);
      toast.error('Failed to load task group');
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  updateDerivedState(): void {
    this.myTasks = this.currentUser?.role === 'admin' 
      ? this.tasks 
      : this.tasks.filter(t => t.responsibleId === this.currentUser?.id);

    this.totalTasks = this.myTasks.length;
    this.pendingTasks = this.myTasks.filter(t => t.status === 'Pending').length;
    this.inProgressTasks = this.myTasks.filter(t => t.status === 'InProgress').length;
    this.doneTasks = this.myTasks.filter(t => t.status === 'Done').length;

    this.pendingPercentage = this.totalTasks > 0 ? (this.pendingTasks / this.totalTasks) * 100 : 0;
    this.inProgressPercentage = this.totalTasks > 0 ? (this.inProgressTasks / this.totalTasks) * 100 : 0;
    this.donePercentage = this.totalTasks > 0 ? (this.doneTasks / this.totalTasks) * 100 : 0;
  }

  isMyTask(task: Task): boolean {
    return this.currentUser?.role === 'admin' || task.responsibleId === this.currentUser?.id;
  }

  handleTaskClick(task: Task): void {
    this.selectedTask = task;
    this.isModalOpen = true;
  }

  handleTaskCreated(): void {
    this.createDialogOpen = false;
    this.fetchTaskGroupData();
    toast.success('Task created successfully!');
  }

  handleTaskGroupUpdated(updatedTaskGroup: TaskGroup): void {
    this.taskGroup = updatedTaskGroup;
    this.cdr.detectChanges();
  }

  handleDeleteTaskGroup(): void {
    if (!this.taskGroupId || !this.taskGroup) return;
    this.isDeleteDialogOpen = true;
  }

  executeDeleteTaskGroup(): void {
    if (!this.taskGroupId || !this.taskGroup) return;
    this.isDeleteDialogOpen = false;
    this.taskGroupService.deleteTaskGroup(this.taskGroupId).subscribe({
      next: () => {
        toast.success('Task group deleted successfully');
        this.router.navigate(['/projects', this.taskGroup!.projectId]);
      },
      error: (error) => {
        console.error('Error deleting task group:', error);
        toast.error('Failed to delete task group');
      }
    });
  }

  handleTaskUpdated(updatedTask: Task): void {
    this.tasks = this.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    this.updateDerivedState();
    this.cdr.detectChanges();
  }

  closeTaskModal(): void {
    this.isModalOpen = false;
    this.selectedTask = null;
  }
}