import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-landing-banner',
  standalone: true,
  imports: [RouterModule, MatIconModule],
  templateUrl: './landing-banner.html',
  styleUrls: ['./landing-banner.scss']
})
export class LandingBanner {
  openGithub() {
    window.open('https://github.com/bocheti', '_blank');
  }

  openLinkedin() {
    window.open('https://linkedin.com/in/salvadorespinosamerino', '_blank');
  }
}