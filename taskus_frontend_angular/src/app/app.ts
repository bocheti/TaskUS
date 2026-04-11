import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxSonnerToaster],
  template: `
    <ngx-sonner-toaster position="top-right" [richColors]="true" />
    <router-outlet></router-outlet>
  `
})
export class App {
  title = 'taskus_frontend_angular';

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.registerCustomIcon('select-chevron', '/icons/select-chevron.svg');
    this.registerCustomIcon('github', '/icons/github.svg');
    this.registerCustomIcon('linkedin', '/icons/linkedin.svg');
    this.registerCustomIcon('mobile-menu-btn', '/icons/mobile-menu-btn.svg');
    this.registerCustomIcon('mobile-close-btn', '/icons/mobile-close-btn.svg');
    this.registerCustomIcon('dashboard', '/icons/dashboard.svg');
    this.registerCustomIcon('projects', '/icons/projects.svg');
    this.registerCustomIcon('users', '/icons/users.svg');
    this.registerCustomIcon('organisation', '/icons/organisation.svg');
    this.registerCustomIcon('profile', '/icons/profile.svg');
    this.registerCustomIcon('calendar', '/icons/calendar.svg');
    this.registerCustomIcon('clock', '/icons/clock.svg');
    this.registerCustomIcon('trash', '/icons/trash.svg');
    this.registerCustomIcon('user', '/icons/user.svg');
    this.registerCustomIcon('x', '/icons/x.svg');
    this.registerCustomIcon('arrow-left', '/icons/arrow-left.svg'); 
  }

  private registerCustomIcon(name: string, path: string): void {
    this.matIconRegistry.addSvgIcon(
      name,
      this.domSanitizer.bypassSecurityTrustResourceUrl(path)
    );
  }
}