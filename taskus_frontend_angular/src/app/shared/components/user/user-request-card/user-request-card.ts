import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { UserRequest } from '../../../../core/models/app.models';

@Component({
  selector: 'app-user-request-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './user-request-card.html',
  styleUrls: ['./user-request-card.scss']
})
export class UserRequestCard {
  @Input({ required: true }) request!: UserRequest;
  
  @Output() accept = new EventEmitter<string>();
  @Output() reject = new EventEmitter<string>();

  handleAccept(): void {
    this.accept.emit(this.request.id);
  }

  handleReject(): void {
    this.reject.emit(this.request.id);
  }
}