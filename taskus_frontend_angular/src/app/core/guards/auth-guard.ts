import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLoggingOut = sessionStorage.getItem('isLoggingOut') === 'true';
  const user = authService.currentUserValue;

  if (!user && !isLoggingOut) {
    alert('Please log in to access this page'); // TODO: Replace with Toast
    return router.createUrlTree(['/login']);
  }

  const requireAdmin = route.data['requireAdmin'] === true;
  if (requireAdmin && user?.role !== 'admin') {
    alert('You need admin privileges to access this page'); // TODO: Replace with Toast
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};