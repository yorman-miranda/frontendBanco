import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    imports: [FormsModule, CommonModule]
})
export class LoginComponent {
    credentials: LoginRequest = {
        username: '',
        password: ''
    };
    isLoading: boolean = false;
    errorMessage: string = '';

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    onSubmit() {
        this.isLoading = true;
        this.errorMessage = '';

        this.authService.login(this.credentials).subscribe({
            next: (response) => {
                this.isLoading = false;
                this.router.navigate(['/dashboard']);
            },
            error: (error) => {
                this.isLoading = false;
                this.errorMessage = error.error?.detail || 'Error al iniciar sesión';
            }
        });
    }

    goToRegister() {
        this.router.navigate(['/register']);
    }
}