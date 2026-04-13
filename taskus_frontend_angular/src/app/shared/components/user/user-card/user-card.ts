import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { User } from '../../../../core/models/app.models';
import { UserService } from '../../../../core/services/user';
import { ConfirmDialog } from '../../../../shared/components/ui/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, ConfirmDialog],
  templateUrl: './user-card.html',
  styleUrls: ['./user-card.scss']
})
export class UserCard {
  @Input({ required: true }) user!: User;
  @Output() deleted = new EventEmitter<void>();

  isDeleteDialogOpen = false;

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  navigateToProfile(): void {
    this.router.navigate(['/profile', this.user.id]);
  }

  handleDeleteUser(event: Event): void {
    event.stopPropagation();
    this.isDeleteDialogOpen = true;
  }
  
  executeDeleteUser(): void {
    this.isDeleteDialogOpen = false; 

    this.userService.deleteUser(this.user.id).subscribe({
      next: () => {
        toast.success('User deleted successfully');
        this.deleted.emit();
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    });
  }
}