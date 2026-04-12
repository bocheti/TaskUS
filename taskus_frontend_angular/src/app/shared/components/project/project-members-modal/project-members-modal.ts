import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { toast } from 'ngx-sonner';
import { User } from '../../../../core/models/app.models';
import { AuthService } from '../../../../core/services/auth';
import { UserService } from '../../../../core/services/user';
import { ProjectService } from '../../../../core/services/project';

@Component({
  selector: 'app-project-members-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './project-members-modal.html',
  styleUrls: ['./project-members-modal.scss']
})
export class ProjectMembersModal implements OnChanges {
  @Input() isOpen = false;
  @Input({ required: true }) projectId!: string;
  @Input() members: User[] = [];
  
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() membersUpdated = new EventEmitter<void>();

  currentUser: User | null = null;
  allUsers: User[] = [];
  showAddUser = false;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private projectService: ProjectService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && this.currentUser?.role === 'admin') {
      this.fetchAllUsers();
      this.showAddUser = false; 
    }
  }

  get availableUsers(): User[] {
    return this.allUsers.filter(u => !this.members.some(m => m.id === u.id));
  }

  fetchAllUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      }
    });
  }

  handleRemoveMember(userId: string, event: Event): void {
    event.stopPropagation(); // Prevents navigating to the profile!

    const memberToRemove = this.members.find(m => m.id === userId);
    if (!memberToRemove) return;

    const confirmed = window.confirm(
      `Remove ${memberToRemove.firstName} ${memberToRemove.lastName} from this project?`
    );

    if (!confirmed) return;

    this.isLoading = true;
    this.projectService.removeUserFromProject(this.projectId, userId).subscribe({
      next: () => {
        toast.success('Member removed from project');
        this.membersUpdated.emit();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error removing member:', error);
        toast.error('Failed to remove member');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  handleAddMember(userId: string): void {
    this.isLoading = true;
    this.projectService.addUserToProject(this.projectId, userId).subscribe({
      next: () => {
        toast.success('Member added to project');
        this.showAddUser = false;
        this.membersUpdated.emit();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error adding member:', error);
        toast.error('Failed to add member');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  navigateToProfile(userId: string): void {
    if (this.currentUser?.role === 'admin') {
      this.router.navigate(['/profile', userId]);
    }
  }

  closeModal(): void {
    this.isOpenChange.emit(false);
  }
}