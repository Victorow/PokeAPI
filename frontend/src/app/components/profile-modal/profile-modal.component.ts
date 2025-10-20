import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.css']
})
export class ProfileModalComponent {
  @Input() isVisible = false;
  @Input() user: any = null;
  @Output() close = new EventEmitter<void>();


  constructor(
    private authService: AuthService,
    private modalService: ModalService,
    private router: Router
  ) {}

  onClose(): void {
    console.log('Close button clicked!');
    this.close.emit();
  }

  togglePasswordForm(): void {
    console.log('Navigate to reset password page!');
    this.onClose(); // Fecha o modal primeiro
    this.router.navigate(['/reset-senha']); // Navega para a página de reset de senha
  }


  onLogout(): void {
    this.modalService.showConfirm(
      'Deseja realmente sair da sua conta?',
      'warning',
      'Sim, sair',
      'Cancelar'
    ).subscribe((result: boolean) => {
      if (result) {
        this.authService.logout();
        this.onClose();
        this.router.navigate(['/login']);
      }
    });
  }
}
