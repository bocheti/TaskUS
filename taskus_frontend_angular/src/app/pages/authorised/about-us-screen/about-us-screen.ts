import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthorizedLayout } from '../../../shared/components/layout/authorized-layout/authorized-layout';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-about-us-screen',
  standalone: true,
  imports: [CommonModule, AuthorizedLayout],
  templateUrl: './about-us-screen.html',
  styleUrl: './about-us-screen.scss'
})
export class AboutUsScreen {
  constructor(public authService: AuthService) {}
}