import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TaskGroup } from '../../../../core/models/app.models';

@Component({
  selector: 'app-taskgroup-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './taskgroup-card.html',
  styleUrls: ['./taskgroup-card.scss']
})
export class TaskGroupCard {
  @Input({ required: true }) taskGroup!: TaskGroup;
}