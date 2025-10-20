import { Routes } from '@angular/router';
import { SplashComponent } from './components/splash/splash.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { FavoritosComponent } from './components/favoritos/favoritos.component';
import { EquipeComponent } from './components/equipe/equipe.component';
import { GestaoUsuariosComponent } from './components/gestao-usuarios/gestao-usuarios.component';
import { ResetSenhaComponent } from './components/reset-senha/reset-senha.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: SplashComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'favoritos',
    component: FavoritosComponent,
    canActivate: [authGuard]
  },
  {
    path: 'equipe',
    component: EquipeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'gestao-usuarios',
    component: GestaoUsuariosComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'reset-senha',
    component: ResetSenhaComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
