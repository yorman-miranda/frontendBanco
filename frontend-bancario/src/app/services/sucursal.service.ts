import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Sucursal, SucursalCreateRequest, SucursalUpdateRequest } from '../models';

@Injectable({
    providedIn: 'root'
})
export class SucursalService {
    private readonly endpoint = '/sucursales';

    constructor(
        private apiService: ApiService,
        private authService: AuthService
    ) { }

    createSucursal(sucursal: SucursalCreateRequest): Observable<Sucursal> {
        const currentUserId = this.authService.getCurrentUserId();
        
        if (!currentUserId) {
            throw new Error('No hay usuario autenticado');
        }

        const payload: any = {
            nombreSucursal: sucursal.nombreSucursal,
            ciudad: sucursal.ciudad,
            direccion: sucursal.direccion,
            telefono: sucursal.telefono,
            id_usuario_creacion: currentUserId
        };

        return this.apiService.post<Sucursal>(this.endpoint, payload);
    }

    getSucursales(skip: number = 0, limit: number = 100): Observable<Sucursal[]> {
        return this.apiService.get<Sucursal[]>(this.endpoint, { skip, limit });
    }

    getSucursalById(id: string): Observable<Sucursal> {
        return this.apiService.get<Sucursal>(`${this.endpoint}/${id}`);
    }

    getSucursalesByCiudad(ciudad: string): Observable<Sucursal[]> {
        return this.apiService.get<Sucursal[]>(`${this.endpoint}/ciudad/${ciudad}`);
    }

    updateSucursal(id: string, sucursal: SucursalUpdateRequest): Observable<Sucursal> {
        const currentUserId = this.authService.getCurrentUserId();
        
        if (!currentUserId) {
            throw new Error('No hay usuario autenticado');
        }

        const payload: any = { ...sucursal };
        payload.id_usuario_edicion = currentUserId;

        return this.apiService.put<Sucursal>(`${this.endpoint}/${id}`, payload);
    }

    deleteSucursal(id: string): Observable<any> {
        return this.apiService.delete<any>(`${this.endpoint}/${id}`);
    }
}