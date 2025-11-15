import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Cuenta, CuentaCreateRequest, CuentaUpdateRequest } from '../models';

@Injectable({
    providedIn: 'root'
})
export class CuentaService {
    private readonly endpoint = '/cuentas';

    constructor(
        private apiService: ApiService,
        private authService: AuthService
    ) { }

    createCuenta(cuenta: CuentaCreateRequest): Observable<Cuenta> {
        const currentUserId = this.authService.getCurrentUserId();

        if (!currentUserId) {
            throw new Error('No hay usuario autenticado');
        }

        const payload: any = {
            numeroCuenta: cuenta.numeroCuenta,
            saldo: cuenta.saldo,
            estado: cuenta.estado,
            tipoCuenta: cuenta.tipoCuenta,
            idCliente: cuenta.idCliente,
            id_usuario_creacion: currentUserId
        };

        return this.apiService.post<Cuenta>(this.endpoint, payload);
    }

    getCuentas(skip: number = 0, limit: number = 100): Observable<Cuenta[]> {
        return this.apiService.get<Cuenta[]>(this.endpoint, { skip, limit });
    }

    getCuentaById(id: string): Observable<Cuenta> {
        return this.apiService.get<Cuenta>(`${this.endpoint}/${id}`);
    }

    getCuentaByNumero(numeroCuenta: string): Observable<Cuenta> {
        return this.apiService.get<Cuenta>(`${this.endpoint}/numero/${numeroCuenta}`);
    }

    updateCuenta(id: string, cuenta: CuentaUpdateRequest): Observable<Cuenta> {
        const currentUserId = this.authService.getCurrentUserId();

        if (!currentUserId) {
            throw new Error('No hay usuario autenticado');
        }

        const payload: any = { ...cuenta };
        payload.id_usuario_edicion = currentUserId;

        return this.apiService.put<Cuenta>(`${this.endpoint}/${id}`, payload);
    }

    deleteCuenta(id: string): Observable<any> {
        return this.apiService.delete<any>(`${this.endpoint}/${id}`);
    }
}