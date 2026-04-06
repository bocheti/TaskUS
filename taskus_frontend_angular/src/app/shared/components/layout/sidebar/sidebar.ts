import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class Sidebar {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();
  
  @ViewChild('profileRef') profileRef!: ElementRef;

  isProfileOpen = false;
  currentUrl = '';

  constructor(
    public authService: AuthService,
    public router: Router
  ) {
    this.currentUrl = this.router.url;
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.urlAfterRedirects;
    });
  }
  isActive(path: string): boolean {
    return this.currentUrl === path;
  }

  handleLinkClick(): void {
    this.closeSidebar.emit();
  }

  handleLogout(): void {
    sessionStorage.setItem('isLoggingOut', 'true');
    this.authService.logout();
    alert('Logged out successfully'); // TODO: Replace with Toast
  }

  toggleProfile(): void {
    this.isProfileOpen = !this.isProfileOpen;
  }

  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: MouseEvent): void {
    if (!this.profileRef) return;

    const clickedInside = this.profileRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.isProfileOpen = false;
    }
  }
}