import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { User } from '../../../../core/models/app.models';
import { UserService } from '../../../../core/services/user';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-card.html',
  styleUrls: ['./user-card.scss']
})
export class UserCard {
  @Input({ required: true }) user!: User;
  @Output() deleted = new EventEmitter<void>();

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  navigateToProfile(): void {
    this.router.navigate(['/profile', this.user.id]);
  }

  handleDeleteUser(event: Event): void {
    event.stopPropagation();
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${this.user.firstName} ${this.user.lastName}? This action cannot be undone.`
    );
    
    if (!confirmed) return;

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