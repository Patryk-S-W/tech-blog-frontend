import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthFacade } from '../auth.facade';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthFacade);
  const router = inject(Router);

  if (authService.hasValidSession()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
