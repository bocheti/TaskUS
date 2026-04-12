import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Project, Task, User } from '../../../../core/models/app.models';
import { AuthService } from '../../../../core/services/auth';
import { TaskService } from '../../../../core/services/task';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './project-card.html',
  styleUrls: ['./project-card.scss']
})
export class ProjectCard implements OnInit {
  @Input({ required: true }) project!: Project;

  currentUser: User | null = null;
  tasks: Task[] = [];
  isLoading = true;

  totalTasks = 0;
  completedTasks = 0;
  completionPercentage = 0;

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.fetchTasks();
  }

  fetchTasks(): void {
    if (!this.currentUser) return;

    const request$ = this.currentUser.role === 'admin'
      ? this.taskService.getTasksByProject(this.project.id)
      : this.taskService.getTasksByUserAndProject(this.project.id); 

    request$.subscribe({
      next: (tasksData) => {
        this.tasks = tasksData;
        this.updateDerivedState();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching tasks for project:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateDerivedState(): void {
    this.totalTasks = this.tasks.length;
    this.completedTasks = this.tasks.filter(t => t.status === 'Done').length;
    this.completionPercentage = this.totalTasks > 0
      ? Math.round((this.completedTasks / this.totalTasks) * 100)
      : 0;
  }
}