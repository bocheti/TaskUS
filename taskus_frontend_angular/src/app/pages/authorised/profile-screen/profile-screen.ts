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

@Component({
  selector: 'app-profile-screen',
  standalone: true,
  imports: [CommonModule, MatIconModule, AuthorizedLayout, ConfirmDialog],
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
  timeFilter: 7 | 30 | 90 = 30;

  isOwnProfile = false;
  isAdmin = false;

  completedTasks: Task[] = [];
  activeTasks: Task[] = [];
  totalTasks = 0;
  completionRate = 0;
  avgCompletionTime = 0;
  recentCompletedTasks: Task[] = [];

  pendingCount = 0;
  inProgressCount = 0;
  doneCount = 0;
  pieMetrics = {
    pendingArray: '0 439.82', pendingOffset: 0,
    progressArray: '0 439.82', progressOffset: 0,
    doneArray: '0 439.82', doneOffset: 0,
  };
  isConfirmDialogOpen = false;
  isRoleDialogOpen = false;

  linePoints: { x: number; y: number; nextX: number | null; nextY: number | null }[] = [];
  barPoints: { x: number; y: number; height: number; value: number; label: string }[] = [];

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
      
      this.updateDerivedState();
      this.isLoading = false;
      this.cdr.detectChanges();
    }).catch(error => {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  updateDerivedState(): void {
    this.completedTasks = this.tasks.filter(t => t.status === 'Done');
    this.activeTasks = this.tasks.filter(t => t.status !== 'Done');
    this.totalTasks = this.tasks.length;
    
    this.completionRate = this.totalTasks > 0 
      ? Math.round((this.completedTasks.length / this.totalTasks) * 100) 
      : 0;

    const completionTimes = this.completedTasks
      .filter(t => t.completedAt)
      .map(t => {
        const created = new Date(t.createdAt).getTime();
        const completed = new Date(t.completedAt!).getTime();
        return (completed - created) / (1000 * 60 * 60 * 24);
      });
      
    this.avgCompletionTime = completionTimes.length > 0
      ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
      : 0;

    this.pendingCount = this.tasks.filter(t => t.status === 'Pending').length;
    this.inProgressCount = this.tasks.filter(t => t.status === 'InProgress').length;
    this.doneCount = this.completedTasks.length;

    this.calculatePieChart();
    this.calculateTimeFilteredData();
  }

  onTimeFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.timeFilter = Number(target.value) as 7 | 30 | 90;
    this.calculateTimeFilteredData();
    this.cdr.detectChanges();
  }

  calculateTimeFilteredData(): void {
    const now = new Date();
    const filterDate = new Date(now.getTime() - this.timeFilter * 24 * 60 * 60 * 1000);
    
    this.recentCompletedTasks = this.completedTasks.filter(t => 
      t.completedAt && new Date(t.completedAt) >= filterDate
    );

    // Line Chart: Group by day
    const tasksByDay = Array.from({ length: this.timeFilter }, (_, i) => {
      const date = new Date(now.getTime() - (this.timeFilter - 1 - i) * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const count = this.recentCompletedTasks.filter(t => {
        const completedDate = new Date(t.completedAt!).toISOString().split('T')[0];
        return completedDate === dateStr;
      }).length;
      return { date: dateStr, count };
    });

    const maxLineCount = Math.max(...tasksByDay.map(d => d.count), 1);
    this.linePoints = tasksByDay.map((day, i) => {
      const x = (i / (tasksByDay.length - 1)) * 380 + 10;
      const y = 140 - (day.count / maxLineCount) * 120;
      const nextDay = tasksByDay[i + 1];
      const nextX = nextDay ? ((i + 1) / (tasksByDay.length - 1)) * 380 + 10 : null;
      const nextY = nextDay ? 140 - (nextDay.count / maxLineCount) * 120 : null;
      return { x, y, nextX, nextY };
    });

    // Bar Chart: Group by month
    const tasksByMonth = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const count = this.completedTasks.filter(t => {
        if (!t.completedAt) return false;
        const completedDate = new Date(t.completedAt);
        return completedDate.getFullYear() === date.getFullYear() && 
               completedDate.getMonth() === date.getMonth();
      }).length;
      return { month: monthStr, count };
    });

    const maxBarCount = Math.max(...tasksByMonth.map(m => m.count), 1);
    this.barPoints = tasksByMonth.map((month, i) => {
      const height = (month.count / maxBarCount) * 160;
      return {
        x: i * 100 + 20,
        y: 180 - height,
        height,
        value: month.count,
        label: month.month.split(' ')[0]
      };
    });
  }

  calculatePieChart(): void {
    if (this.totalTasks === 0) return;
    const circumference = 439.82;
    
    this.pieMetrics = {
      pendingArray: `${(this.pendingCount / this.totalTasks) * circumference} ${circumference}`,
      pendingOffset: 0,
      
      progressArray: `${(this.inProgressCount / this.totalTasks) * circumference} ${circumference}`,
      progressOffset: -((this.pendingCount / this.totalTasks) * circumference),
      
      doneArray: `${(this.doneCount / this.totalTasks) * circumference} ${circumference}`,
      doneOffset: -(((this.pendingCount + this.inProgressCount) / this.totalTasks) * circumference)
    };
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