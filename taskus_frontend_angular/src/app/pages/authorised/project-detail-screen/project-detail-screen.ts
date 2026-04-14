import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { toast } from 'ngx-sonner';
import { Project, TaskGroup, Task, User } from '../../../core/models/app.models';
import { AuthService } from '../../../core/services/auth';
import { ProjectService } from '../../../core/services/project';
import { TaskGroupService } from '../../../core/services/task-group';
import { TaskService } from '../../../core/services/task';
import { AuthorizedLayout } from '../../../shared/components/layout/authorized-layout/authorized-layout';
import { TaskGroupCard } from '../../../shared/components/taskgroup/taskgroup-card/taskgroup-card';
import { CreateTaskGroupDialog } from '../../../shared/components/taskgroup/create-taskgroup-dialog/create-taskgroup-dialog';
import { ProjectMembersModal } from '../../../shared/components/project/project-members-modal/project-members-modal';
import { EditProjectDialog } from '../../../shared/components/project/edit-project-dialog/edit-project-dialog';
import { ConfirmDialog } from '../../../shared/components/ui/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-project-detail-screen',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    AuthorizedLayout, 
    TaskGroupCard, 
    CreateTaskGroupDialog, 
    ProjectMembersModal, 
    EditProjectDialog,
    ConfirmDialog
  ],
  templateUrl: './project-detail-screen.html',
  styleUrls: ['./project-detail-screen.scss']
})
export class ProjectDetailScreen implements OnInit {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  projectId: string | null = null;
  currentUser: User | null = null;
  
  project: Project | null = null;
  taskGroups: TaskGroup[] = [];
  tasks: Task[] = [];
  members: User[] = [];
  
  isLoading = true;
  isUploading = false;
  createDialogOpen = false;
  membersModalOpen = false;
  editDialogOpen = false;
  isDeleteDialogOpen = false;

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
    private projectService: ProjectService,
    private taskGroupService: TaskGroupService,
    private taskService: TaskService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.projectId = params.get('projectId');
      if (this.projectId) {
        this.fetchProjectData();
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  fetchProjectData(): void {
    if (!this.projectId || !this.currentUser) return;

    this.isLoading = true;

    const taskRequest$ = this.currentUser.role === 'admin'
      ? this.taskService.getTasksByProject(this.projectId)
      : this.taskService.getTasksByUserAndProject(this.projectId);

    Promise.all([
      this.projectService.getProject(this.projectId).toPromise(),
      this.taskGroupService.getTaskGroupsByProject(this.projectId).toPromise(),
      taskRequest$.toPromise(),
      this.projectService.getProjectMembers(this.projectId).toPromise()
    ]).then(([projectData, taskGroupsData, tasksData, membersData]) => {
      if (projectData) this.project = projectData;
      if (taskGroupsData) this.taskGroups = taskGroupsData;
      if (tasksData) this.tasks = tasksData;
      if (membersData) this.members = membersData;

      this.updateDerivedState();
      this.isLoading = false;
      this.cdr.detectChanges();
    }).catch(error => {
      console.error('Error fetching project data:', error);
      toast.error('Failed to load project');
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  updateDerivedState(): void {
    this.totalTasks = this.tasks.length;
    this.pendingTasks = this.tasks.filter(t => t.status === 'Pending').length;
    this.inProgressTasks = this.tasks.filter(t => t.status === 'InProgress').length;
    this.doneTasks = this.tasks.filter(t => t.status === 'Done').length;

    this.pendingPercentage = this.totalTasks > 0 ? (this.pendingTasks / this.totalTasks) * 100 : 0;
    this.inProgressPercentage = this.totalTasks > 0 ? (this.inProgressTasks / this.totalTasks) * 100 : 0;
    this.donePercentage = this.totalTasks > 0 ? (this.doneTasks / this.totalTasks) * 100 : 0;
  }

  handleTaskGroupClick(taskGroupId: string): void {
    this.router.navigate(['/taskgroups', taskGroupId]);
  }

  handleTaskGroupCreated(): void {
    this.createDialogOpen = false;
    this.fetchProjectData();
    toast.success('Task group created successfully!');
  }

  handleImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.projectId || !this.project) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    this.isUploading = true;
    this.projectService.uploadPic(this.projectId, file).subscribe({
      next: (response: any) => {
        // Technically bad practice to mutate the object directly, 
        // but it mimics React's spread operator behavior here.
        this.project!.pic = response.pic; 
        toast.success('Project picture updated!');
        
        // Reset the file input
        if (this.fileInputRef && this.fileInputRef.nativeElement) {
          this.fileInputRef.nativeElement.value = '';
        }
        
        this.isUploading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error uploading picture:', error);
        toast.error('Failed to upload picture');
        this.isUploading = false;
        this.cdr.detectChanges();
      }
    });
  }

  handleDeleteProject(): void {
    if (!this.projectId || !this.project) return;
    this.isDeleteDialogOpen = true;
  }

  executeDeleteProject(): void {
    if (!this.projectId) return;
    this.isDeleteDialogOpen = false;
    this.projectService.deleteProject(this.projectId).subscribe({
      next: () => {
        toast.success('Project deleted successfully');
        this.router.navigate(['/projects']);
      },
      error: (error) => {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
      }
    });
  }

  handleProjectUpdated(updatedProject: Project): void {
    this.project = updatedProject;
    this.cdr.detectChanges();
  }
}