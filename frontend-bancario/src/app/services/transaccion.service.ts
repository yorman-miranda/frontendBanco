// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { ApiService } from './api.service';
// import { AuthService } from './auth.service';
// import { Transaccion, TransaccionCreateRequest, TransaccionUpdateRequest } from '../models';

// @Injectable({
//     providedIn: 'root'
// })
// export class TransaccionService {
//     private readonly endpoint = '/transacciones';

//     constructor(
//         private apiService: ApiService,
//         private authService: AuthService
//     ) { }

//     /**
//      * Crear una nueva transacción
//      */
//     createTransaccion(transaccion: TransaccionCreateRequest): Observable<Transaccion> {
//         const currentUserId = this.authService.getCurrentUserId();

//         if (!currentUserId) {
//             throw new Error('No hay usuario autenticado');
//         }

//         // Construir payload para el backend
//         const payload: any = {
//             tipo: transaccion.tipo,
//             monto: transaccion.monto,
//             idCuenta: transaccion.idCuenta,
//             id_usuario_creacion: currentUserId
//         };

//         console.log('📤 Creando transacción:', payload);
//         return this.apiService.post<Transaccion>(this.endpoint, payload);
//     }

//     /**
//      * Obtener todas las transacciones con paginación
//      */
//     getTransacciones(skip: number = 0, limit: number = 100): Observable<Transaccion[]> {
//         return this.apiService.get<Transaccion[]>(this.endpoint, { skip, limit });
//     }

//     /**
//      * Obtener una transacción por su ID
//      */
//     getTransaccionById(id: string): Observable<Transaccion> {
//         return this.apiService.get<Transaccion>(`${this.endpoint}/${id}`);
//     }

//     /**
//      * Obtener transacciones por cuenta específica
//      */
//     getTransaccionesByCuenta(cuentaId: string): Observable<Transaccion[]> {
//         return this.apiService.get<Transaccion[]>(`${this.endpoint}/cuenta/${cuentaId}`);
//     }

//     /**
//      * Actualizar una transacción existente
//      */
//     updateTransaccion(id: string, transaccion: TransaccionUpdateRequest): Observable<Transaccion> {
//         const currentUserId = this.authService.getCurrentUserId();

//         if (!currentUserId) {
//             throw new Error('No hay usuario autenticado');
//         }

//         // Construir payload para actualización
//         const payload: any = {};

//         // Solo incluir campos que se quieren actualizar
//         if (transaccion.tipo !== undefined) payload.tipo = transaccion.tipo;
//         if (transaccion.monto !== undefined) payload.monto = transaccion.monto;
//         if (transaccion.idCuenta !== undefined) payload.idCuenta = transaccion.idCuenta;

//         // Campo obligatorio para auditoría
//         payload.id_usuario_edicion = currentUserId;

//         return this.apiService.put<Transaccion>(`${this.endpoint}/${id}`, payload);
//     }

//     /**
//      * Eliminar una transacción
//      * Solo disponible para administradores
//      */
//     deleteTransaccion(id: string): Observable<any> {
//         return this.apiService.delete<any>(`${this.endpoint}/${id}`);
//     }

//     /**
//      * Método auxiliar para obtener el tipo de clase CSS basado en el tipo de transacción
//      */
//     getTipoClass(tipo: string): string {
//         switch (tipo?.toUpperCase()) {
//             case 'DEPOSITO':
//                 return 'tipo-deposito';
//             case 'RETIRO':
//                 return 'tipo-retiro';
//             case 'TRANSFERENCIA':
//                 return 'tipo-transferencia';
//             default:
//                 return 'tipo-default';
//         }
//     }

//     /**
//      * Método auxiliar para formatear el monto como moneda
//      */
//     formatMonto(monto: number): string {
//         return new Intl.NumberFormat('es-MX', {
//             style: 'currency',
//             currency: 'MXN'
//         }).format(monto);
//     }

//     /**
//      * Método auxiliar para obtener el icono según el tipo de transacción
//      */
//     getTipoIcon(tipo: string): string {
//         switch (tipo?.toUpperCase()) {
//             case 'DEPOSITO':
//                 return '💰';
//             case 'RETIRO':
//                 return '💸';
//             case 'TRANSFERENCIA':
//                 return '🔄';
//             default:
//                 return '📄';
//         }
//     }

//     /**
//      * Método auxiliar para obtener el color según el tipo de transacción
//      */
//     getTipoColor(tipo: string): string {
//         switch (tipo?.toUpperCase()) {
//             case 'DEPOSITO':
//                 return '#28a745'; // Verde
//             case 'RETIRO':
//                 return '#dc3545'; // Rojo
//             case 'TRANSFERENCIA':
//                 return '#007bff'; // Azul
//             default:
//                 return '#6c757d'; // Gris
//         }
//     }

//     /**
//      * Filtrar transacciones por tipo
//      */
//     filtrarPorTipo(transacciones: Transaccion[], tipo: string): Transaccion[] {
//         return transacciones.filter(t => t.tipo?.toUpperCase() === tipo.toUpperCase());
//     }

//     /**
//      * Filtrar transacciones por rango de fechas
//      */
//     filtrarPorFecha(transacciones: Transaccion[], fechaInicio: Date, fechaFin: Date): Transaccion[] {
//         return transacciones.filter(t => {
//             const fechaTransaccion = new Date(t.fecha);
//             return fechaTransaccion >= fechaInicio && fechaTransaccion <= fechaFin;
//         });
//     }

//     /**
//      * Obtener estadísticas de transacciones
//      */
//     obtenerEstadisticas(transacciones: Transaccion[]): any {
//         const totalDepositos = this.filtrarPorTipo(transacciones, 'DEPOSITO')
//             .reduce((sum, t) => sum + t.monto, 0);

//         const totalRetiros = this.filtrarPorTipo(transacciones, 'RETIRO')
//             .reduce((sum, t) => sum + t.monto, 0);

//         const totalTransferencias = this.filtrarPorTipo(transacciones, 'TRANSFERENCIA')
//             .reduce((sum, t) => sum + t.monto, 0);

//         return {
//             totalTransacciones: transacciones.length,
//             totalDepositos,
//             totalRetiros,
//             totalTransferencias,
//             saldoNeto: totalDepositos - totalRetiros
//         };
//     }

//     /**
//      * Obtener las últimas transacciones (más recientes primero)
//      */
//     getUltimasTransacciones(transacciones: Transaccion[], cantidad: number = 10): Transaccion[] {
//         return transacciones
//             .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
//             .slice(0, cantidad);
//     }

//     /**
//      * Validar datos de transacción antes de enviar
//      */
//     validarTransaccion(transaccion: TransaccionCreateRequest): { valido: boolean; errores: string[] } {
//         const errores: string[] = [];

//         if (!transaccion.tipo) {
//             errores.push('El tipo de transacción es requerido');
//         }

//         if (!transaccion.monto || transaccion.monto <= 0) {
//             errores.push('El monto debe ser mayor a 0');
//         }

//         if (!transaccion.idCuenta) {
//             errores.push('El ID de cuenta es requerido');
//         }

//         // Validar tipos permitidos
//         const tiposPermitidos = ['DEPOSITO', 'RETIRO', 'TRANSFERENCIA'];
//         if (transaccion.tipo && !tiposPermitidos.includes(transaccion.tipo.toUpperCase())) {
//             errores.push(`Tipo de transacción no válido. Permitidos: ${tiposPermitidos.join(', ')}`);
//         }

//         return {
//             valido: errores.length === 0,
//             errores
//         };
//     }
// }

// transaccion.service.ts
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

@Injectable({
    providedIn: 'root'
})
export class TransaccionService {

    constructor(
        private apiService: ApiService,
        private authService: AuthService
    ) { }

    // Obtener todas las transacciones
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

    // Obtener transacción por ID
    getTransaccionById(id: string): Observable<Transaccion> {
        return this.apiService.get<Transaccion>(`/transacciones/${id}`).pipe(
            map(transaccion => this.parseTransaccion(transaccion))
        );
    }

    // Obtener transacciones por cuenta
    getTransaccionesByCuenta(cuentaId: string): Observable<Transaccion[]> {
        return this.apiService.get<Transaccion[]>(`/transacciones/cuenta/${cuentaId}`).pipe(
            map(transacciones => transacciones.map(t => this.parseTransaccion(t)))
        );
    }

    // Crear nueva transacción
    createTransaccion(transaccionData: TransaccionCreateRequest): Observable<Transaccion> {
        // El backend ya obtiene el usuario del token, pero podemos agregar info adicional si es necesario
        const userId = this.authService.getCurrentUserId();
        console.log('👤 Usuario creando transacción:', userId);

        return this.apiService.post<Transaccion>('/transacciones/', transaccionData).pipe(
            map(transaccion => this.parseTransaccion(transaccion))
        );
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

    // Filtrar transacciones localmente
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

    // Calcular estadísticas
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

    // Métodos para formateo y estilos
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

    // Parsear fechas de string a Date
    private parseTransaccion(transaccion: any): Transaccion {
        return {
            ...transaccion,
            fecha: new Date(transaccion.fecha),
            fecha_creacion: new Date(transaccion.fecha_creacion),
            fecha_actualizacion: transaccion.fecha_actualizacion ? new Date(transaccion.fecha_actualizacion) : undefined
        };
    }
}