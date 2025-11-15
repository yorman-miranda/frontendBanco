import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Empleado, EmpleadoCreateRequest, EmpleadoUpdateRequest } from '../models';

@Injectable({
    providedIn: 'root'
})
export class EmpleadoService {
    private readonly endpoint = '/empleados';

    constructor(
        private apiService: ApiService,
        private authService: AuthService
    ) { }

    createEmpleado(empleado: EmpleadoCreateRequest): Observable<Empleado> {
        const currentUserId = this.authService.getCurrentUserId();

        if (!currentUserId) {
            throw new Error('No hay usuario autenticado');
        }

        const payload: any = {
            nombre: empleado.nombre,
            apellido: empleado.apellido,
            cargo: empleado.cargo,
            idSucursal: empleado.idSucursal,
            idUsuario: empleado.idUsuario,
            id_usuario_creacion: currentUserId
        };

        return this.apiService.post<Empleado>(this.endpoint, payload);
    }

    getEmpleados(skip: number = 0, limit: number = 100): Observable<Empleado[]> {
        return this.apiService.get<Empleado[]>(this.endpoint, { skip, limit });
    }

    getEmpleadoById(id: string): Observable<Empleado> {
        return this.apiService.get<Empleado>(`${this.endpoint}/${id}`);
    }

    getEmpleadosBySucursal(sucursalId: string): Observable<Empleado[]> {
        return this.apiService.get<Empleado[]>(`${this.endpoint}/sucursal/${sucursalId}`);
    }

    updateEmpleado(id: string, empleado: EmpleadoUpdateRequest): Observable<Empleado> {
        const currentUserId = this.authService.getCurrentUserId();

        if (!currentUserId) {
            throw new Error('No hay usuario autenticado');
        }

        const payload: any = { ...empleado };
        payload.id_usuario_edicion = currentUserId;

        return this.apiService.put<Empleado>(`${this.endpoint}/${id}`, payload);
    }

    deleteEmpleado(id: string): Observable<any> {
        return this.apiService.delete<any>(`${this.endpoint}/${id}`);
    }
}