import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthorizedLayout } from '../../../shared/components/layout/authorized-layout/authorized-layout';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-task-group-detail-screen',
  standalone: true,
  imports: [CommonModule, AuthorizedLayout],
  templateUrl: './task-group-detail-screen.html',
  styleUrl: './task-group-detail-screen.scss'
})
export class TaskGroupDetailScreen {
  constructor(public authService: AuthService) {}
}