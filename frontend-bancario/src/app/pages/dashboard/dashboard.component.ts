import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    imports: [CommonModule]
})
export class DashboardComponent implements OnInit {
    currentUser: any;
    stats = {
        totalClientes: 0,
        totalCuentas: 0,
        totalTransacciones: 0,
        totalSucursales: 0
    };

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        // Verificar autenticación primero
        if (!this.authService.isAuthenticated()) {
            this.redirectToLogin();
            return;
        }

        this.currentUser = this.authService.getCurrentUser();

        console.log('🔐 Dashboard - Current User:', this.currentUser);

        this.loadStats();
    }

    loadStats() {
        // Simular carga de estadísticas
        this.stats = {
            totalClientes: 120,
            totalCuentas: 300,
            totalTransacciones: 1200,
            totalSucursales: 5
        };
    }

    get isAdmin(): boolean {
        return this.authService.isAdmin();
    }

    navigateTo(route: string) {
        this.router.navigate([route]);
    }

    private redirectToLogin() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}