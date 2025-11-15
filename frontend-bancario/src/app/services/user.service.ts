import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { User, UserCreateRequest, UserUpdateRequest, ChangeUserPassword } from '../models';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    private readonly endpoint = '/usuarios';

    constructor(
        private apiService: ApiService,
        private authService: AuthService
    ) { }

    createUser(user: UserCreateRequest): Observable<User> {
        const currentUserId = this.authService.getCurrentUserId();
        
        if (!currentUserId) {
            throw new Error('No hay usuario autenticado');
        }

        const payload: any = {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            password: user.password,
            es_admin: user.es_admin || false,
            id_usuario_creacion: currentUserId
        };

        return this.apiService.post<User>(this.endpoint, payload);
    }

    getUsers(skip: number = 0, limit: number = 100): Observable<User[]> {
        return this.apiService.get<User[]>(this.endpoint, { skip, limit });
    }

    getUserById(id: string): Observable<User> {
        return this.apiService.get<User>(`${this.endpoint}/${id}`);
    }

    updateUser(id: string, user: UserUpdateRequest): Observable<User> {
        const currentUserId = this.authService.getCurrentUserId();
        
        if (!currentUserId) {
            throw new Error('No hay usuario autenticado');
        }

        const payload: any = { ...user };
        payload.id_usuario_edicion = currentUserId;

        return this.apiService.put<User>(`${this.endpoint}/${id}`, payload);
    }

    deleteUser(id: string): Observable<any> {
        return this.apiService.delete<any>(`${this.endpoint}/${id}`);
    }

    changePassword(userId: string, passwords: ChangeUserPassword): Observable<any> {
        return this.apiService.post<any>(`${this.endpoint}/${userId}/cambiar-contraseña`, passwords);
    }
}