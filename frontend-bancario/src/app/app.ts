import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { SidebarComponent } from './pages/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports: [RouterOutlet, CommonModule, SidebarComponent]
})
export class AppComponent {
  title = 'Sistema Bancario';

  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Verificar si mostrar el sidebar (solo cuando está autenticado)
  shouldShowSidebar(): boolean {
    return this.authService.isAuthenticated();
  }
}