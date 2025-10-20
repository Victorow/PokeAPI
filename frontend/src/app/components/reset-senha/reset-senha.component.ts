import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-senha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './reset-senha.component.html',
  styleUrls: ['./reset-senha.component.css']
})
export class ResetSenhaComponent {
  senhaAtual = '';
  novaSenha = '';
  confirmarNovaSenha = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onResetSenha(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.senhaAtual || !this.novaSenha || !this.confirmarNovaSenha) {
      this.errorMessage = 'Preencha todos os campos.';
      return;
    }

    if (this.novaSenha !== this.confirmarNovaSenha) {
      this.errorMessage = 'A nova senha e a confirmação não coincidem.';
      return;
    }

    if (this.novaSenha.length < 6) {
      this.errorMessage = 'A nova senha deve ter no mínimo 6 caracteres.';
      return;
    }

    if (this.senhaAtual === this.novaSenha) {
      this.errorMessage = 'A nova senha deve ser diferente da senha atual.';
      return;
    }

    this.isLoading = true;

    const resetData = {
      senhaAtual: this.senhaAtual,
      novaSenha: this.novaSenha
    };

    // Simulação - ajuste quando tiver a rota no backend
    setTimeout(() => {
      this.isLoading = false;
      this.successMessage = 'Senha alterada com sucesso!';
      this.limparCampos();
      
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 2000);
    }, 1000);
  }

  limparCampos(): void {
    this.senhaAtual = '';
    this.novaSenha = '';
    this.confirmarNovaSenha = '';
  }

  cancelar(): void {
    this.router.navigate(['/home']);
  }
}
