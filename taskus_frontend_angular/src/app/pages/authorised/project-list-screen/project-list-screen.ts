import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthorizedLayout } from '../../../shared/components/layout/authorized-layout/authorized-layout';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-project-list-screen',
  standalone: true,
  imports: [CommonModule, AuthorizedLayout],
  templateUrl: './project-list-screen.html',
  styleUrl: './project-list-screen.scss'
})
export class ProjectListScreen {
  constructor(public authService: AuthService) {}
}