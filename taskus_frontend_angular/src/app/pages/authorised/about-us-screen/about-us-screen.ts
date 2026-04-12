import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthorizedLayout } from '../../../shared/components/layout/authorized-layout/authorized-layout';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, MatIconModule, AuthorizedLayout],
  templateUrl: './about-us-screen.html',
  styleUrls: ['./about-us-screen.scss']
})
export class AboutUsScreen {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}