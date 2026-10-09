import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.estaAutenticado()) {
    return true;
  }

  return router.createUrlTree(['/admin/login']);
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.estaAutenticado()) return router.createUrlTree(['/admin/login']);
  return auth.rol() === 'ADMIN' ? true : router.createUrlTree(['/perfil']);
};
