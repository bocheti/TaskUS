import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../sidebar/sidebar'; // Adjust path if needed

@Component({
  selector: 'app-authorized-layout',
  standalone: true,
  imports: [CommonModule, Sidebar],
  templateUrl: './authorized-layout.html',
  styleUrls: ['./authorized-layout.scss']
})
export class AuthorizedLayout {
  @Input() title: string = '';
  
  isSidebarOpen = false;

  handleGithubClick(): void {
    window.open('https://github.com/bocheti', '_blank');
  }

  handleLinkedinClick(): void {
    window.open('https://linkedin.com/in/salvadorespinosamerino', '_blank');
  }
}