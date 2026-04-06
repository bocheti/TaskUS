import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { toast } from 'ngx-sonner';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLoggingOut = sessionStorage.getItem('isLoggingOut') === 'true';
  const user = authService.currentUserValue;

  if (!user && !isLoggingOut) {
    toast.error('Please log in to access this page');
    return router.createUrlTree(['/login']);
  }

  const requireAdmin = route.data['requireAdmin'] === true;
  if (requireAdmin && user?.role !== 'admin') {
    toast.error('You need admin privileges to access this page');
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};