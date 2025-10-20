import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Primeiro verificar se está logado
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // Verificar se é admin
  if (authService.isAdmin()) {
    return true;
  }

  // Se não for admin, redirecionar para home
  router.navigate(['/home']);
  return false;
};

