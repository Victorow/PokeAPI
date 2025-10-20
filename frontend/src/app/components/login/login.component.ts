import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  login = '';
  senha = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService
  ) {}

  onLogin(): void {
    if (!this.login || !this.senha) {
      this.errorMessage = 'Preencha todos os campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ login: this.login, senha: this.senha }).subscribe({
      next: (response) => {
        console.log('Login realizado com sucesso:', response);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Erro no login:', error);
        const errorMsg = error.error?.msg || 'Login ou senha inválidos';
        this.errorMessage = errorMsg;
        this.modalService.showError(errorMsg);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}