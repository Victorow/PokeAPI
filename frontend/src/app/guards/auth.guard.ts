import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar se o token existe e é válido
  const token = authService.getToken();
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  // Verificar se o usuário está logado
  if (authService.isLoggedIn()) {
    return true;
  }

  // Se chegou aqui, o token pode estar expirado ou inválido
  authService.logout();
  router.navigate(['/login']);
  return false;
};
