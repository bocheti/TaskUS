import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthorizedLayout } from '../../../shared/components/layout/authorized-layout/authorized-layout';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-project-detail-screen',
  standalone: true,
  imports: [CommonModule, AuthorizedLayout],
  templateUrl: './project-detail-screen.html',
  styleUrl: './project-detail-screen.scss'
})
export class ProjectDetailScreen {
  constructor(public authService: AuthService) {}
}