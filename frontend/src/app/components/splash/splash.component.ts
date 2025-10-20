import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [],
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.css']
})
export class SplashComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Espera 3 segundos e verifica se está logado
    setTimeout(() => {
      if (this.authService.isLoggedIn()) {
        this.router.navigate(['/home']);
      } else {
        this.router.navigate(['/login']);
      }
    }, 3000);
  }
}
