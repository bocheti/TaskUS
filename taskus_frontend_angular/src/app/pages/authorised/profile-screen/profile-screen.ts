import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { toast } from 'ngx-sonner';
import { User, Task } from '../../../core/models/app.models';
import { AuthService } from '../../../core/services/auth';
import { UserService } from '../../../core/services/user';
import { TaskService } from '../../../core/services/task';
import { AuthorizedLayout } from '../../../shared/components/layout/authorized-layout/authorized-layout';
import { ConfirmDialog } from '../../../shared/components/ui/confirm-dialog/confirm-dialog';

/* THE MAGIC IMPORT */
import { TaskStats } from '../../../shared/components/ui/task-stats/task-stats';

@Component({
  selector: 'app-profile-screen',
  standalone: true,
  imports: [CommonModule, MatIconModule, AuthorizedLayout, ConfirmDialog, TaskStats],
  templateUrl: './profile-screen.html',
  styleUrls: ['./profile-screen.scss']
})
export class ProfileScreen implements OnInit {
  currentUser: User | null = null;
  profileUser: User | null = null;
  
  userIdParam: string | null = null;
  tasks: Task[] = [];
  isLoading = true;
  isUploading = false;

  isOwnProfile = false;
  isAdmin = false;

  isConfirmDialogOpen = false;
  isRoleDialogOpen = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private authService: AuthService,
    private userService: UserService,
    private taskService: TaskService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser = this.authService.currentUserValue;
    this.isAdmin = this.currentUser?.role === 'admin';
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.userIdParam = params.get('userId');
      this.isOwnProfile = !this.userIdParam || this.userIdParam === this.currentUser?.id;
      this.fetchProfileData();
    });
  }

  goBack(): void {
    this.location.back();
  }

  get dynamicPageTitle(): string {
    if (!this.profileUser) return 'Profile';
    return this.isOwnProfile ? 'My Profile' : `${this.profileUser.firstName}'s Profile`;
  }

  fetchProfileData(): void {
    const targetUserId = this.userIdParam || this.currentUser?.id;
    if (!targetUserId) return;

    this.isLoading = true;
    
    Promise.all([
      this.userService.getUserInfo(targetUserId).toPromise(),
      this.taskService.getTasksByUser(targetUserId).toPromise()
    ]).then(([userData, userTasks]) => {
      if (userData) this.profileUser = userData;
      if (userTasks) this.tasks = userTasks;
      
      this.isLoading = false;
      this.cdr.detectChanges();
    }).catch(error => {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  handleImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    this.isUploading = true;
    this.userService.uploadPic(file).subscribe({
      next: () => {
        toast.success('Profile picture updated!');
        this.fetchProfileData();
      },
      error: (error) => {
        console.error('Error uploading picture:', error);
        toast.error('Failed to upload picture');
        this.isUploading = false;
        this.cdr.detectChanges();
      }
    });
  }

  handleToggleRole(): void {
    if (!this.profileUser) return;
    this.isRoleDialogOpen = true;
  }
  executeToggleRole(): void {
    if (!this.profileUser) return;
    this.isRoleDialogOpen = false; 
    const newRole = this.profileUser.role === 'admin' ? 'member' : 'admin';
    this.userService.updateUserRole(this.profileUser.id).subscribe({
      next: () => {
        toast.success(`User ${newRole === 'admin' ? 'promoted' : 'demoted'} successfully`);
        this.fetchProfileData();
      },
      error: (error) => {
        console.error('Error updating role:', error);
        toast.error('Failed to update user role');
      }
    });
  }


  handleDeleteUser(): void {
    if (!this.profileUser) return;
    this.isConfirmDialogOpen = true;
  }
  executeDeleteUser(): void {
    this.isConfirmDialogOpen = false;

    this.userService.deleteUser(this.profileUser!.id).subscribe({
      next: () => {
        toast.success('User deleted successfully');
        this.router.navigate(['/admin/users']);
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    });
  }
}