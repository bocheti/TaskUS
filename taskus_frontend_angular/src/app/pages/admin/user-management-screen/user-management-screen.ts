import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthorizedLayout } from '../../../shared/components/layout/authorized-layout/authorized-layout';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-user-management-screen',
  standalone: true,
  imports: [CommonModule, AuthorizedLayout],
  templateUrl: './user-management-screen.html',
  styleUrl: './user-management-screen.scss',
})
export class UserManagementScreen {
  constructor(public authService: AuthService) {}
}
