import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-banner',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './landing-banner.html',
  styleUrls: ['./landing-banner.scss']
})
export class LandingBannerComponent {
  openGithub() {
    window.open('https://github.com/bocheti', '_blank');
  }

  openLinkedin() {
    window.open('https://linkedin.com/in/salvadorespinosamerino', '_blank');
  }
}