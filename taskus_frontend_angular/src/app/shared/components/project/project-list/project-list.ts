import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { toast } from 'ngx-sonner';
import { User, Project } from '../../../../core/models/app.models';
import { AuthService } from '../../../../core/services/auth';
import { ProjectService } from '../../../../core/services/project';
import { ProjectCard } from '../project-card/project-card';
import { CreateProjectDialog } from '../create-project-dialog/create-project-dialog';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, ProjectCard, CreateProjectDialog],
  templateUrl: './project-list.html',
  styleUrls: ['./project-list.scss']
})
export class ProjectList implements OnInit {
  @Input() showCreateButton = true;

  currentUser: User | null = null;
  projects: Project[] = [];
  isLoading = true;
  isCreateDialogOpen = false;

  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.fetchProjects();
  }

  fetchProjects(): void {
    if (!this.currentUser) return;
    this.isLoading = true;

    const request$ = this.currentUser.role === 'admin' 
      ? this.projectService.getAllProjects()
      : this.projectService.getProjectsByUser();

    request$.subscribe({
      next: (projects) => {
        // Sort alphabetically by title
        this.projects = projects.sort((a, b) => a.title.localeCompare(b.title));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  handleProjectClick(projectId: string): void {
    this.router.navigate(['/projects', projectId]);
  }

  handleProjectCreated(): void {
    this.isCreateDialogOpen = false;
    this.fetchProjects();
    toast.success('Project created successfully!');
  }
}