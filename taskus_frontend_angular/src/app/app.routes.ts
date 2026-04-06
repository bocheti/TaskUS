import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';
import { authGuard } from './core/guards/auth-guard';
import { AuthService } from './core/services/auth';
import { LandingScreen } from './pages/unauthorised/landing-screen/landing-screen';

export const routes: Routes = [
  // unauthorised
  { 
    path: '', 
    component: LandingScreen,
    canActivate: [() => {
      const authService = inject(AuthService);
      const router = inject(Router);
      if (authService.isAuthenticated()) {
        return router.createUrlTree(['/dashboard']);
      }
      return true;
    }]
  },
  { path: 'login', loadComponent: () => import('./pages/unauthorised/login-screen/login-screen').then(m => m.LoginScreen) },
  { path: 'request', loadComponent: () => import('./pages/unauthorised/request-screen/request-screen').then(m => m.RequestScreen) },
  { path: 'create-org', loadComponent: () => import('./pages/unauthorised/create-org-screen/create-org-screen').then(m => m.CreateOrgScreen) },
  { path: 'reset-password-request', loadComponent: () => import('./pages/unauthorised/reset-password-request-screen/reset-password-request-screen').then(m => m.ResetPasswordRequestScreen) },
  { path: 'reset-password', loadComponent: () => import('./pages/unauthorised/reset-password-screen/reset-password-screen').then(m => m.ResetPasswordScreen) },

  // authorised
  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./pages/authorised/dashboard-screen/dashboard-screen').then(m => m.DashboardScreen) },
  { path: 'tasks', canActivate: [authGuard], loadComponent: () => import('./pages/authorised/all-tasks-screen/all-tasks-screen').then(m => m.AllTasksScreen) },
  { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./pages/authorised/profile-screen/profile-screen').then(m => m.ProfileScreen) },
  { path: 'profile/:userId', canActivate: [authGuard], loadComponent: () => import('./pages/authorised/profile-screen/profile-screen').then(m => m.ProfileScreen) },
  { path: 'projects', canActivate: [authGuard], loadComponent: () => import('./pages/authorised/project-list-screen/project-list-screen').then(m => m.ProjectListScreen) },
  { path: 'projects/:projectId', canActivate: [authGuard], loadComponent: () => import('./pages/authorised/project-detail-screen/project-detail-screen').then(m => m.ProjectDetailScreen) },
  { path: 'taskgroups/:taskGroupId', canActivate: [authGuard], loadComponent: () => import('./pages/authorised/task-group-detail-screen/task-group-detail-screen').then(m => m.TaskGroupDetailScreen) },
  { path: 'about-us', canActivate: [authGuard], loadComponent: () => import('./pages/authorised/about-us-screen/about-us-screen').then(m => m.AboutUsScreen) },

  // admin
  { 
    path: 'admin/users', 
    canActivate: [authGuard], 
    data: { requireAdmin: true },
    loadComponent: () => import('./pages/admin/user-management-screen/user-management-screen').then(m => m.UserManagementScreen) 
  },
  { 
    path: 'admin/organisation', 
    canActivate: [authGuard], 
    data: { requireAdmin: true },
    loadComponent: () => import('./pages/admin/organisation-settings-screen/organisation-settings-screen').then(m => m.OrganisationSettingsScreen) 
  },

  { path: '**', loadComponent: () => import('./pages/not-found-screen/not-found-screen').then(m => m.NotFoundScreen) }
];