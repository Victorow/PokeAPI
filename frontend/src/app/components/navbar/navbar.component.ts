import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { TeamStateService } from '../../services/team-state.service';
import { ProfileModalComponent } from '../profile-modal/profile-modal.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ProfileModalComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  teamCount = 0;
  favoritosCount = 0;
  showProfileModal = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService,
    private teamStateService: TeamStateService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Subscrever às mudanças de estado da equipe e favoritos
    const teamSub = this.teamStateService.team$.subscribe(team => {
      this.teamCount = team.size;
    });
    
    const favoritosSub = this.teamStateService.favoritos$.subscribe(favoritos => {
      this.favoritosCount = favoritos.size;
    });
    
    this.subscriptions.push(teamSub, favoritosSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  logout(): void {
    this.modalService.showConfirm(
      'Deseja realmente sair?',
      'warning',
      'Sim, sair',
      'Cancelar'
    ).subscribe((result: boolean) => {
      if (result) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }

  onProfileClick(): void {
    this.showProfileModal = true;
  }

  onProfileModalClose(): void {
    this.showProfileModal = false;
  }
}
