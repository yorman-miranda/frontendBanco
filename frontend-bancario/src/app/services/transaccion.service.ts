import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export interface Transaccion {
    idTransaccion: string;
    tipo: string;
    monto: number;
    idCuenta: string;
    fecha: Date;
    fecha_creacion: Date;
    fecha_actualizacion?: Date;
    numeroCuenta?: string;
    numeroCuentaDestino?: string;
    descripcion?: string;
}

export interface TransaccionCreateRequest {
    tipo: string;
    monto: number;
    idCuenta: string;
    idCuentaDestino?: string;
    descripcion?: string;
}

export interface TransaccionUpdateRequest {
    tipo?: string;
    monto?: number;
    idCuenta?: string;
    descripcion?: string;
}

export interface FiltroTransacciones {
    tipo?: string;
    fechaInicio?: string;
    fechaFin?: string;
    idCuenta?: string;
    skip?: number;
    limit?: number;
}

export interface EstadisticasTransacciones {
    totalTransacciones: number;
    totalDepositos: number;
    totalRetiros: number;
    saldoNeto: number;
    promedioTransacciones: number;
}

export interface RespuestaTransaccion {
    mensaje: string;
    exito: boolean;
    datos?: any;
}

export interface ActualizacionSaldo {
    idCuenta: string;
    monto: number;
    tipoOperacion: 'DEPOSITO' | 'RETIRO' | 'TRANSFERENCIA';
}

export interface RespuestaActualizacionSaldo {
    mensaje: string;
    exito: boolean;
    nuevoSaldo: number;
    cuenta: any;
}

@Injectable({
    providedIn: 'root'
})
export class TransaccionService {

    constructor(
        private apiService: ApiService,
        private authService: AuthService
    ) { }


    getTransacciones(filtros?: FiltroTransacciones): Observable<Transaccion[]> {
        let endpoint = '/transacciones/';
        let params: any = {};

        if (filtros) {
            if (filtros.skip !== undefined) params.skip = filtros.skip;
            if (filtros.limit !== undefined) params.limit = filtros.limit;
            if (filtros.tipo) params.tipo = filtros.tipo;
        }

        return this.apiService.get<Transaccion[]>(endpoint, params).pipe(
            map(transacciones => transacciones.map(t => this.parseTransaccion(t)))
        );
    }


    getTransaccionById(id: string): Observable<Transaccion> {
        return this.apiService.get<Transaccion>(`/transacciones/${id}`).pipe(
            map(transaccion => this.parseTransaccion(transaccion))
        );
    }


    getTransaccionesByCuenta(cuentaId: string): Observable<Transaccion[]> {
        return this.apiService.get<Transaccion[]>(`/transacciones/cuenta/${cuentaId}`).pipe(
            map(transacciones => transacciones.map(t => this.parseTransaccion(t)))
        );
    }


    createTransaccion(transaccionData: TransaccionCreateRequest): Observable<Transaccion> {
        const userId = this.authService.getCurrentUserId();
        console.log('👤 Usuario creando transacción:', userId);

        const payload: any = {
            tipo: transaccionData.tipo,
            monto: transaccionData.monto,
            idCuenta: transaccionData.idCuenta
        };


        if (transaccionData.idCuentaDestino) {
            payload.idCuentaDestino = transaccionData.idCuentaDestino;
        }

        if (transaccionData.descripcion) {
            payload.descripcion = transaccionData.descripcion;
        }


        if (userId) {
            payload.id_usuario_creacion = userId;
        }

        console.log('📤 Payload para crear transacción:', payload);

        return this.apiService.post<Transaccion>('/transacciones/', payload).pipe(
            map(transaccion => this.parseTransaccion(transaccion))
        );
    }


    actualizarSaldoCuenta(actualizacion: ActualizacionSaldo): Observable<RespuestaActualizacionSaldo> {
        console.log('🔄 Actualizando saldo:', actualizacion);
        return this.apiService.put<RespuestaActualizacionSaldo>('/cuentas/actualizar-saldo', actualizacion);
    }


    obtenerSaldoCuenta(idCuenta: string): Observable<{ saldo: number }> {
        return this.apiService.get<{ saldo: number }>(`/cuentas/${idCuenta}/saldo`);
    }


    procesarTransaccionCompleta(transaccionData: TransaccionCreateRequest): Observable<any> {
        return new Observable(observer => {
            console.log('🔄 Iniciando procesamiento de transacción completa...');

            this.createTransaccion(transaccionData).subscribe({
                next: (transaccion) => {
                    console.log('✅ Transacción creada:', transaccion);


                    const actualizacion: ActualizacionSaldo = {
                        idCuenta: transaccionData.idCuenta,
                        monto: transaccionData.monto,
                        tipoOperacion: transaccionData.tipo as any
                    };

                    console.log('🔄 Actualizando saldo:', actualizacion);

                    this.actualizarSaldoCuenta(actualizacion).subscribe({
                        next: (respuestaSaldo) => {
                            console.log('✅ Saldo actualizado:', respuestaSaldo);
                            observer.next({
                                transaccion: transaccion,
                                actualizacionSaldo: respuestaSaldo,
                                mensaje: 'Transacción completada exitosamente'
                            });
                            observer.complete();
                        },
                        error: (errorSaldo) => {
                            console.error('❌ Error actualizando saldo:', errorSaldo);
                            // Aún así devolvemos la transacción creada
                            observer.next({
                                transaccion: transaccion,
                                errorSaldo: errorSaldo,
                                mensaje: 'Transacción creada pero error actualizando saldo'
                            });
                            observer.complete();
                        }
                    });
                },
                error: (errorTransaccion) => {
                    console.error('❌ Error creando transacción:', errorTransaccion);
                    observer.error(this.getErrorMessage(errorTransaccion));
                }
            });
        });
    }

    // Actualizar transacción
    updateTransaccion(id: string, transaccionData: TransaccionUpdateRequest): Observable<Transaccion> {
        return this.apiService.put<Transaccion>(`/transacciones/${id}`, transaccionData).pipe(
            map(transaccion => this.parseTransaccion(transaccion))
        );
    }

    // Eliminar transacción (solo admin)
    deleteTransaccion(id: string): Observable<RespuestaTransaccion> {
        return this.apiService.delete<RespuestaTransaccion>(`/transacciones/${id}`);
    }

    // Métodos de utilidad para el componente
    validarTransaccion(transaccion: TransaccionCreateRequest): { valido: boolean; errores: string[] } {
        const errores: string[] = [];

        if (!transaccion.tipo) {
            errores.push('El tipo de transacción es requerido');
        }

        if (!transaccion.monto || transaccion.monto <= 0) {
            errores.push('El monto debe ser mayor a 0');
        }

        if (!transaccion.idCuenta) {
            errores.push('La cuenta de origen es requerida');
        }

        if (transaccion.tipo === 'TRANSFERENCIA' && !transaccion.idCuentaDestino) {
            errores.push('La cuenta destino es requerida para transferencias');
        }

        if (transaccion.tipo === 'TRANSFERENCIA' && transaccion.idCuenta === transaccion.idCuentaDestino) {
            errores.push('No se puede transferir a la misma cuenta');
        }

        return {
            valido: errores.length === 0,
            errores
        };
    }


    filtrarPorTipo(transacciones: Transaccion[], tipo: string): Transaccion[] {
        return transacciones.filter(t => t.tipo === tipo);
    }

    filtrarPorFecha(transacciones: Transaccion[], fechaInicio: string, fechaFin: string): Transaccion[] {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999); // Hasta el final del día

        return transacciones.filter(t => {
            const fechaTransaccion = new Date(t.fecha);
            return fechaTransaccion >= inicio && fechaTransaccion <= fin;
        });
    }


    obtenerEstadisticas(transacciones: Transaccion[]): EstadisticasTransacciones {
        const totalTransacciones = transacciones.length;
        const depositos = transacciones.filter(t => t.tipo === 'DEPOSITO');
        const retiros = transacciones.filter(t => t.tipo === 'RETIRO');

        const totalDepositos = depositos.reduce((sum, t) => sum + t.monto, 0);
        const totalRetiros = retiros.reduce((sum, t) => sum + t.monto, 0);
        const saldoNeto = totalDepositos - totalRetiros;
        const promedioTransacciones = totalTransacciones > 0
            ? (totalDepositos + totalRetiros) / totalTransacciones
            : 0;

        return {
            totalTransacciones,
            totalDepositos,
            totalRetiros,
            saldoNeto,
            promedioTransacciones
        };
    }


    getTipoClass(tipo: string): string {
        switch (tipo) {
            case 'DEPOSITO':
                return 'tipo-deposito';
            case 'RETIRO':
                return 'tipo-retiro';
            case 'TRANSFERENCIA':
                return 'tipo-transferencia';
            case 'PAGO_SERVICIO':
                return 'tipo-pago-servicio';
            default:
                return 'tipo-default';
        }
    }

    getTipoIcon(tipo: string): string {
        switch (tipo) {
            case 'DEPOSITO':
                return '💰';
            case 'RETIRO':
                return '💸';
            case 'TRANSFERENCIA':
                return '🔄';
            case 'PAGO_SERVICIO':
                return '🧾';
            default:
                return '📊';
        }
    }

    getSignoMonto(tipo: string): string {
        switch (tipo) {
            case 'DEPOSITO':
                return '+';
            case 'RETIRO':
                return '-';
            case 'TRANSFERENCIA':
                return '-';
            case 'PAGO_SERVICIO':
                return '-';
            default:
                return '';
        }
    }

    formatMonto(monto: number): string {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(monto);
    }


    private parseTransaccion(transaccion: any): Transaccion {
        return {
            ...transaccion,
            fecha: new Date(transaccion.fecha),
            fecha_creacion: new Date(transaccion.fecha_creacion),
            fecha_actualizacion: transaccion.fecha_actualizacion ? new Date(transaccion.fecha_actualizacion) : undefined
        };
    }

    private getErrorMessage(error: any): string {
        console.log('🔍 Error completo:', error);

        if (error.error?.detail) {
            return error.error.detail;
        }
        if (error.error?.errors) {
            // Si hay errores de validación
            const errors = error.error.errors;
            return Object.keys(errors).map(key => `${key}: ${errors[key]}`).join(', ');
        }
        if (error.error?.message) {
            return error.error.message;
        }
        if (error.message) {
            return error.message;
        }
        if (typeof error === 'string') {
            return error;
        }
        return 'Error desconocido al procesar la transacción';
    }
}