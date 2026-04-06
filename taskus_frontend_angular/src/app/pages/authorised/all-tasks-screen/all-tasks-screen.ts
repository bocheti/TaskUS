import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthorizedLayout } from '../../../shared/components/layout/authorized-layout/authorized-layout';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-all-tasks-screen',
  standalone: true,
  imports: [CommonModule, AuthorizedLayout],
  templateUrl: './all-tasks-screen.html',
  styleUrl: './all-tasks-screen.scss'
})
export class AllTasksScreen {
  constructor(public authService: AuthService) {}
}