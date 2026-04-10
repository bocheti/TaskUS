import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthorizedLayout } from '../../../shared/components/layout/authorized-layout/authorized-layout';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-organisation-settings-screen',
  standalone: true,
  imports: [CommonModule, AuthorizedLayout],
  templateUrl: './organisation-settings-screen.html',
  styleUrl: './organisation-settings-screen.scss',
})
export class OrganisationSettingsScreen {
  constructor(public authService: AuthService) {}
}
