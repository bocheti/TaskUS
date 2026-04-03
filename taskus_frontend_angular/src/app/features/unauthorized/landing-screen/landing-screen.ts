import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LandingBannerComponent } from '../../../shared/components/layout/landing-banner/landing-banner';

@Component({
  selector: 'app-landing-screen',
  standalone: true,
  imports: [RouterModule, LandingBannerComponent],
  templateUrl: './landing-screen.html',
  styleUrls: ['./landing-screen.scss']
})
export class LandingScreenComponent {}