import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { toast } from 'ngx-sonner';

import { User, UserRequest } from '../../../core/models/app.models';
import { UserService } from '../../../core/services/user';

import { AuthorizedLayout } from '../../../shared/components/layout/authorized-layout/authorized-layout';
import { UserCard } from '../../../shared/components/user/user-card/user-card';
import { UserRequestCard } from '../../../shared/components/user/user-request-card/user-request-card';

type Tab = 'users' | 'requests';

@Component({
  selector: 'app-user-management-screen',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    AuthorizedLayout, 
    UserCard, 
    UserRequestCard
  ],
  templateUrl: './user-management-screen.html',
  styleUrls: ['./user-management-screen.scss']
})
export class UserManagementScreen implements OnInit {
  activeTab: Tab = 'users';
  users: User[] = [];
  requests: UserRequest[] = [];
  isLoading = true;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.isLoading = true;

    Promise.all([
      this.userService.getAllUsers().toPromise(),
      this.userService.getAllUserRequests().toPromise()
    ]).then(([usersData, requestsData]) => {
      if (usersData) this.users = usersData;
      if (requestsData) this.requests = requestsData;
      this.isLoading = false;
      this.cdr.detectChanges();
    }).catch(error => {
      console.error('Error fetching data:', error);
      toast.error('Failed to load user data');
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  setActiveTab(tab: Tab): void {
    this.activeTab = tab;
  }

  handleAcceptRequest(requestId: string): void {
    this.userService.acceptUserRequest(requestId).subscribe({
      next: () => {
        toast.success('User request accepted');
        this.fetchData();
      },
      error: (error) => {
        console.error('Error accepting request:', error);
        toast.error('Failed to accept request');
      }
    });
  }

  handleRejectRequest(requestId: string): void {
    const confirmed = window.confirm('Are you sure you want to reject this request?');
    if (!confirmed) return;

    this.userService.rejectUserRequest(requestId).subscribe({
      next: () => {
        toast.success('User request rejected');
        this.fetchData();
      },
      error: (error) => {
        console.error('Error rejecting request:', error);
        toast.error('Failed to reject request');
      }
    });
  }
}