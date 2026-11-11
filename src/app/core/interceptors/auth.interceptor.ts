import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const document = inject(DOCUMENT);
  let isApiRequest: boolean;
  try {
    const api = new URL(environment.apiUrl || '/', document.baseURI);
    const target = new URL(req.url, document.baseURI);
    isApiRequest = target.origin === api.origin && target.pathname.startsWith('/api/');
  } catch {
    return next(req);
  }
  const token = isApiRequest && authService.isAuthenticated() ? authService.getToken() : null;

  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(cloned);
  }

  return next(req);
};
