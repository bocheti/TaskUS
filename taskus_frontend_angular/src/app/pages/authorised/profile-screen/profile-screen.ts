import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthorizedLayout } from '../../../shared/components/layout/authorized-layout/authorized-layout';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-profile-screen',
  standalone: true,
  imports: [CommonModule, AuthorizedLayout],
  templateUrl: './profile-screen.html',
  styleUrl: './profile-screen.scss'
})
export class ProfileScreen {
  constructor(public authService: AuthService) {}
}