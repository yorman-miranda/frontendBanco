import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { OperacionBancaria, RespuestaOperacion } from '../models';
import { TransaccionService, TransaccionCreateRequest } from './transaccion.service';

@Injectable({
    providedIn: 'root'
})
export class OperacionesService {

    constructor(
        private apiService: ApiService,
        private authService: AuthService,
        private transaccionService: TransaccionService
    ) { }

    realizarDeposito(depositoData: OperacionBancaria): Observable<any> {
        const userId = this.authService.getCurrentUserId();
        console.log('👤 Usuario realizando depósito:', userId);

        if (!depositoData.idCuenta || depositoData.monto <= 0) {
            throw new Error('Datos inválidos para depósito');
        }

        const transaccionData: TransaccionCreateRequest = {
            tipo: 'DEPOSITO',
            monto: depositoData.monto,
            idCuenta: depositoData.idCuenta,
        };

        console.log('📤 Datos de depósito enviados:', transaccionData);


        return this.transaccionService.procesarTransaccionCompleta(transaccionData);
    }

    realizarRetiro(retiroData: OperacionBancaria): Observable<any> {
        const userId = this.authService.getCurrentUserId();
        console.log('👤 Usuario realizando retiro:', userId);

        // Validar datos básicos
        if (!retiroData.idCuenta || retiroData.monto <= 0) {
            throw new Error('Datos inválidos para retiro');
        }


        const transaccionData: TransaccionCreateRequest = {
            tipo: 'RETIRO',
            monto: retiroData.monto,
            idCuenta: retiroData.idCuenta,
        };

        console.log('📤 Datos de retiro enviados:', transaccionData);


        return this.transaccionService.procesarTransaccionCompleta(transaccionData);
    }

    realizarTransferencia(transferenciaData: any): Observable<any> {
        const userId = this.authService.getCurrentUserId();
        console.log('👤 Usuario realizando transferencia:', userId);

        // Validar datos básicos
        if (!transferenciaData.idCuenta || !transferenciaData.idCuentaDestino || transferenciaData.monto <= 0) {
            throw new Error('Datos inválidos para transferencia');
        }

        if (transferenciaData.idCuenta === transferenciaData.idCuentaDestino) {
            throw new Error('No se puede transferir a la misma cuenta');
        }


        const transaccionData: TransaccionCreateRequest = {
            tipo: 'TRANSFERENCIA',
            monto: transferenciaData.monto,
            idCuenta: transferenciaData.idCuenta,
            idCuentaDestino: transferenciaData.idCuentaDestino,
            descripcion: transferenciaData.descripcion || 'Transferencia realizada'
        };

        console.log('📤 Datos de transferencia enviados:', transaccionData);


        return this.transaccionService.procesarTransaccionCompleta(transaccionData);
    }


    realizarDepositoDirecto(depositoData: OperacionBancaria): Observable<RespuestaOperacion> {
        const userId = this.authService.getCurrentUserId();

        const payload = {
            ...depositoData,
            id_usuario_creacion: userId
        };

        return this.apiService.post<RespuestaOperacion>('/operaciones/deposito', payload);
    }

    realizarRetiroDirecto(retiroData: OperacionBancaria): Observable<RespuestaOperacion> {
        const userId = this.authService.getCurrentUserId();

        const payload = {
            ...retiroData,
            id_usuario_creacion: userId
        };

        return this.apiService.post<RespuestaOperacion>('/operaciones/retiro', payload);
    }

    obtenerTransaccionesPorCuenta(idCuenta: string): Observable<any> {
        return this.apiService.get<any>(`/transacciones/cuenta/${idCuenta}`);
    }
}