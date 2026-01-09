import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../service/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized (token expired or invalid)
      if (error.status === 401 && !req.url.includes('/login')) {
        authService.logout();
        router.navigate(['/login'], { 
          queryParams: { expired: 'true' } 
        });
      }

      // Handle 403 Forbidden
      if (error.status === 403) {
        console.error('Access forbidden');
      }

      // Pass error to component
      return throwError(() => error);
    })
  );
};