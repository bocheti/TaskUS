import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './not-found-screen.html',
  styleUrls: ['./not-found-screen.scss']
})
export class NotFoundScreen {}