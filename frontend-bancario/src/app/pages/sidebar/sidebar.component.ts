import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
    @Output() logout = new EventEmitter<void>();

    currentUser: any = null;
    private userSubscription: Subscription = new Subscription();

    constructor(private router: Router, private authService: AuthService) { }

    ngOnInit(): void {
        // Suscribirse a los cambios del usuario
        this.userSubscription = this.authService.getCurrentUserObservable().subscribe(user => {
            this.currentUser = user;
        });
    }

    navigateTo(path: string) {
        this.router.navigate([path]);
    }

    logoutUser() {
        this.authService.logout();
        this.logout.emit(); // Emitir evento al componente padre
        this.router.navigate(['/login']);
    }

    // Obtener iniciales del usuario para el avatar
    getUserInitials(): string {
        if (!this.currentUser) return 'U';
        const firstName = this.currentUser.firstName || '';
        const lastName = this.currentUser.lastName || '';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    // Obtener nombre completo del usuario
    getFullName(): string {
        if (!this.currentUser) return 'Usuario';
        return `${this.currentUser.firstName || ''} ${this.currentUser.lastName || ''}`.trim();
    }

    // Verificar si es administrador
    get isAdmin(): boolean {
        return this.authService.isAdmin();
    }

    ngOnDestroy(): void {
        this.userSubscription.unsubscribe();
    }
}