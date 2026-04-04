import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  // We use inject() to grab our services inside a functional guard
  const authService = inject(AuthService);
  const router = inject(Router);

  // If they have a token, let them through!
  if (authService.isAuthenticated()) {
    return true;
  }

  // Otherwise, kick them back to login
  router.navigate(['/login']);
  return false;
};