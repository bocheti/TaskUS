import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthorizedLayout } from '../../../shared/components/layout/authorized-layout/authorized-layout';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-dashboard-screen',
  standalone: true,
  imports: [CommonModule, AuthorizedLayout],
  templateUrl: './dashboard-screen.html',
  styleUrl: './dashboard-screen.scss'
})
export class DashboardScreen {
  constructor(public authService: AuthService) {}
}