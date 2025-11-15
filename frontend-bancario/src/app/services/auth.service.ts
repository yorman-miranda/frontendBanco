import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ApiService } from './api.service';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private tokenKey = 'authToken';
    private userKey = 'user';
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
    public currentUserSubject = new BehaviorSubject<any>(this.getStoredUser());

    constructor(private apiService: ApiService) { }

    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.apiService.post<AuthResponse>('/auth/login', credentials).pipe(
            tap((response: AuthResponse) => {
                console.log('🔐 LOGIN RESPONSE:', response);
                this.setAuthData(response);
                this.isAuthenticatedSubject.next(true);
                this.currentUserSubject.next(response.user);
            }),
            catchError(error => {
                this.clearAuthData();
                this.isAuthenticatedSubject.next(false);
                this.currentUserSubject.next(null);
                return throwError(() => error);
            })
        );
    }

    register(userData: RegisterRequest): Observable<AuthResponse> {
        return this.apiService.post<AuthResponse>('/auth/registro', userData).pipe(
            tap((response: AuthResponse) => {
                this.setAuthData(response);
                this.isAuthenticatedSubject.next(true);
                this.currentUserSubject.next(response.user);
            }),
            catchError(error => {
                this.clearAuthData();
                this.isAuthenticatedSubject.next(false);
                this.currentUserSubject.next(null);
                return throwError(() => error);
            })
        );
    }

    private setAuthData(response: AuthResponse): void {
        localStorage.setItem(this.tokenKey, response.access_token);
        localStorage.setItem(this.userKey, JSON.stringify(response.user));
    }

    private clearAuthData(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    }

    private hasToken(): boolean {
        return !!localStorage.getItem(this.tokenKey);
    }

    private getStoredUser(): any {
        const userJson = localStorage.getItem(this.userKey);
        return userJson ? JSON.parse(userJson) : null;
    }

    getCurrentUserId(): string | null {
        const user = this.getStoredUser();
        console.log('🔍 Usuario almacenado:', user);
        const userId = user?.idUser || user?.id || user?.userId || null;
        console.log('🔍 ID de usuario encontrado:', userId);
        return userId;
    }

    getCurrentUser(): any {
        return this.getStoredUser();
    }

    getCurrentUserObservable(): Observable<any> {
        return this.currentUserSubject.asObservable();
    }

    isAuthenticated(): boolean {
        return this.hasToken();
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    logout(): void {
        this.clearAuthData();
        this.isAuthenticatedSubject.next(false);
        this.currentUserSubject.next(null);
    }

    isAdmin(): boolean {
        const user = this.getStoredUser();
        return user?.es_admin === true;
    }

    // Para debug
    debugAuth(): void {
        console.log('🐛 DEBUG AUTH:');
        console.log('Token:', this.getToken());
        console.log('User:', this.getStoredUser());
        console.log('User ID:', this.getCurrentUserId());
        console.log('Is Authenticated:', this.isAuthenticated());
        console.log('Is Admin:', this.isAdmin());
    }
}


