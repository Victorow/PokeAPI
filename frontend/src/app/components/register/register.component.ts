import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/user.model';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  nome = '';
  login = '';
  email = '';
  senha = '';
  confirmarSenha = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService
  ) {}

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Validações
    if (!this.nome || !this.login || !this.email || !this.senha || !this.confirmarSenha) {
      this.errorMessage = 'Preencha todos os campos';
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      this.errorMessage = 'As senhas não coincidem';
      return;
    }

    if (this.senha.length < 6) {
      this.errorMessage = 'A senha deve ter no mínimo 6 caracteres';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Email inválido';
      return;
    }

    this.isLoading = true;

    const registerData: RegisterRequest = {
      nome: this.nome,
      login: this.login,
      email: this.email,
      senha: this.senha
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.successMessage = 'Cadastro realizado com sucesso! Redirecionando...';
        this.isLoading = false;
        
        // Redireciona para login após 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        console.error('Erro no cadastro:', error);
        const errorMsg = error.error?.msg || 'Erro ao realizar cadastro';
        this.errorMessage = errorMsg;
        this.modalService.showError(errorMsg);
        this.isLoading = false;
      }
    });
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
