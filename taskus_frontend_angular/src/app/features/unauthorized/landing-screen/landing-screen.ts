import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LandingBanner } from '../../../shared/components/layout/landing-banner/landing-banner';

@Component({
  selector: 'app-landing-screen',
  standalone: true,
  imports: [RouterModule, LandingBanner],
  templateUrl: './landing-screen.html',
  styleUrls: ['./landing-screen.scss']
})
export class LandingScreen {}