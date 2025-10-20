import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';

interface User {
  id: number;
  nome: string;
  login: string;
  email: string;
}

@Component({
  selector: 'app-gestao-usuarios',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './gestao-usuarios.component.html',
  styleUrls: ['./gestao-usuarios.component.css']
})
export class GestaoUsuariosComponent implements OnInit {
  usuarios: User[] = [];
  currentUser: any = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        this.errorMessage = 'Erro ao carregar usuários. Tente novamente.';
        this.isLoading = false;
      }
    });
  }

  deletarUsuario(id: number, nome: string): void {
    if (id === this.currentUser?.id) {
      this.modalService.showError('Você não pode deletar seu próprio usuário.');
      return;
    }

    this.modalService.showConfirm(
      `Deseja realmente excluir o usuário "${nome}"? Esta ação não pode ser desfeita.`,
      'warning',
      'Sim, excluir',
      'Cancelar'
    ).subscribe((result: boolean) => {
      if (result) {
        this.userService.deleteUsuario(id).subscribe({
          next: () => {
            this.usuarios = this.usuarios.filter(u => u.id !== id);
            this.modalService.showSuccess(`Usuário "${nome}" excluído com sucesso!`);
          },
          error: (error) => {
            console.error('Erro ao deletar usuário:', error);
            this.modalService.showError('Não foi possível excluir o usuário. Tente novamente.');
          }
        });
      }
    });
  }

  getInitials(nome: string): string {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}