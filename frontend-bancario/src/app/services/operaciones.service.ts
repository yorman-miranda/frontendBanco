// operaciones.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { OperacionBancaria, RespuestaOperacion } from '../models';

@Injectable({
    providedIn: 'root'
})
export class OperacionesService {

    constructor(
        private apiService: ApiService,
        private authService: AuthService
    ) { }

    realizarDeposito(depositoData: OperacionBancaria): Observable<RespuestaOperacion> {
        // Asegurarse de que el ID de usuario esté incluido en los datos
        const userId = this.authService.getCurrentUserId();
        if (userId) {
            // Si necesitas enviar el ID de usuario al backend, puedes agregarlo aquí
            console.log('👤 Usuario realizando depósito:', userId);
        }

        return this.apiService.post<RespuestaOperacion>('/operaciones/deposito', depositoData);
    }

    realizarRetiro(retiroData: OperacionBancaria): Observable<RespuestaOperacion> {
        // Asegurarse de que el ID de usuario esté incluido en los datos
        const userId = this.authService.getCurrentUserId();
        if (userId) {
            // Si necesitas enviar el ID de usuario al backend, puedes agregarlo aquí
            console.log('👤 Usuario realizando retiro:', userId);
        }

        return this.apiService.post<RespuestaOperacion>('/operaciones/retiro', retiroData);
    }

    // Método opcional para obtener historial de transacciones
    obtenerTransaccionesPorCuenta(idCuenta: string): Observable<any> {
        return this.apiService.get<any>(`/transacciones/cuenta/${idCuenta}`);
    }
}