import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('authToken');

  // clone request to add the authorization header
  let modifiedReq = req;
  if (token) {
    modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // pass it on and listen for the response
  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // only redirect if this is NOT the login endpoint
      if (error.status === 401 && !req.url.includes('/user/login')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        router.navigate(['/login']);
      }
      
      return throwError(() => error);
    })
  );
};