import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { LandingScreen } from './features/unauthorized/landing-screen/landing-screen';

export const routes: Routes = [
  // UNAUTHORIZED SCREENS
  { path: '', component: LandingScreen },
  { path: 'login', loadComponent: () => import('./features/unauthorized/login-screen/login-screen').then(m => m.LoginScreen) },
  { path: 'create-org', loadComponent: () => import('./features/unauthorized/create-org-screen/create-org-screen').then(m => m.CreateOrgScreen) },
  { path: 'request', loadComponent: () => import('./features/unauthorized/request-screen/request-screen').then(m => m.RequestScreen) },
  { path: 'reset-password-request', loadComponent: () => import('./features/unauthorized/reset-password-request-screen/reset-password-request-screen').then(m => m.ResetPasswordRequestScreen) },
  { path: 'reset-password', loadComponent: () => import('./features/unauthorized/reset-password-screen/reset-password-screen').then(m => m.ResetPasswordScreen) },

  // AUTHORIZED SCREENS
  /*{ path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./features/dashboard/dashboard-screen/dashboard-screen').then(m => m.DashboardScreen) },
  { path: 'tasks', canActivate: [authGuard], loadComponent: () => import('./features/tasks/all-tasks-screen/all-tasks-screen').then(m => m.AllTasksScreen) },
  { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./features/auth/profile-screen/profile-screen').then(m => m.ProfileScreen) },
  { path: 'profile/:userId', canActivate: [authGuard], loadComponent: () => import('./features/auth/profile-screen/profile-screen').then(m => m.ProfileScreen) },
  { path: 'projects', canActivate: [authGuard], loadComponent: () => import('./features/projects/project-list-screen/project-list-screen').then(m => m.ProjectListScreen) },
  { path: 'projects/:projectId', canActivate: [authGuard], loadComponent: () => import('./features/projects/project-detail-screen/project-detail-screen').then(m => m.ProjectDetailScreen) },
  { path: 'taskgroups/:taskGroupId', canActivate: [authGuard], loadComponent: () => import('./features/tasks/task-group-detail-screen/task-group-detail-screen').then(m => m.TaskGroupDetailScreen) },
  { path: 'about-us', canActivate: [authGuard], loadComponent: () => import('./features/dashboard/about-us-screen/about-us-screen').then(m => m.AboutUsScreen) },

  // ADMIN SCREENS
  { path: 'admin/users', canActivate: [authGuard], loadComponent: () => import('./features/admin/user-management-screen/user-management-screen').then(m => m.UserManagementScreen) },
  { path: 'admin/organisation', canActivate: [authGuard], loadComponent: () => import('./features/admin/organisation-settings-screen/organisation-settings-screen').then(m => m.OrganisationSettingsScreen) },
  */
  { path: '**', redirectTo: '' }
];