import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Cliente {
    idCliente: string;
    nombre: string;
    documento: string;
    telefono: string;
    direccion: string;
    email: string;
    idSucursal?: string;
    id_usuario_creacion: string;
    id_usuario_edicion?: string;
    fecha_creacion: string;
    fecha_actualizacion?: string;
    sucursal?: {
        idSucursal: string;
        nombreSucursal: string;
    };
}

export interface ClienteCreateRequest {
    nombre: string;
    documento: string;
    email: string;
    telefono?: string;
    direccion?: string;
    idSucursal?: string;
    idUsuario: string;  // ← CAMBIAR a idUsuario (para relación con usuario)
    // id_usuario_creacion lo maneja el backend automáticamente
}

export interface ClienteUpdateRequest {
    nombre?: string;
    documento?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    idSucursal?: string;
    idUsuario?: string;  // ← Para actualización también
    // id_usuario_edicion lo maneja el backend automáticamente
}

export interface FiltroClientes {
    nombre?: string;
    documento?: string;
    email?: string;
    idSucursal?: string;
    skip?: number;
    limit?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ClienteService {
    private apiUrl = `${environment.apiUrl}/clientes`;
    constructor(private http: HttpClient, private authService: AuthService) {
    }

    /**
     * Obtener todos los clientes
     */
    getClientes(filtros?: FiltroClientes): Observable<Cliente[]> {
        let params = new HttpParams();

        if (filtros) {
            if (filtros.nombre) params = params.set('nombre', filtros.nombre);
            if (filtros.documento) params = params.set('documento', filtros.documento);
            if (filtros.email) params = params.set('email', filtros.email);
            if (filtros.idSucursal) params = params.set('idSucursal', filtros.idSucursal);
            if (filtros.skip) params = params.set('skip', filtros.skip.toString());
            if (filtros.limit) params = params.set('limit', filtros.limit.toString());
        }

        return this.http.get<Cliente[]>(this.apiUrl, { params })
            .pipe(
                catchError(this.handleError)
            );
    }

    /**
     * Obtener cliente por ID
     */
    getClienteById(id: string): Observable<Cliente> {
        return this.http.get<Cliente>(`${this.apiUrl}/${id}`)
            .pipe(
                catchError(this.handleError)
            );
    }

    /**
     * Crear nuevo cliente
     */
    // createCliente(cliente: ClienteCreateRequest): Observable<Cliente> {
    //     const currentUserId = this.authService.getCurrentUserId();

    //     if (!currentUserId) {
    //         return throwError(() => new Error('Usuario no autenticado'));
    //     }

    //     // Agregar el id_usuario_creacion al payload
    //     // const payload = {
    //     //     ...cliente,
    //     //     id_usuario_creacion: currentUserId
    //     // };

    //     // console.log('📤 Payload para crear cliente:', payload);

    //     // return this.http.post<Cliente>(this.apiUrl, payload)
    //     //     .pipe(
    //     //         catchError(this.handleError)
    //     //     );
    //     return this.http.post<Cliente>(this.apiUrl, cliente)
    //         .pipe(
    //             catchError(this.handleError)
    //         );
    // }
    createCliente(cliente: ClienteCreateRequest): Observable<Cliente> {
        console.log('📤 Payload para crear cliente:', cliente);
        return this.http.post<Cliente>(this.apiUrl, cliente)
            .pipe(
                catchError(this.handleError)
            );
    }
    /**
     * Actualizar cliente
     */
    updateCliente(id: string, cliente: ClienteUpdateRequest): Observable<Cliente> {
        return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente)
            .pipe(
                catchError(this.handleError)
            );
    }

    /**
     * Eliminar cliente
     */
    deleteCliente(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`)
            .pipe(
                catchError(this.handleError)
            );
    }

    /**
     * Buscar clientes por término
     */
    searchClientes(term: string): Observable<Cliente[]> {
        const params = new HttpParams().set('search', term);
        return this.http.get<Cliente[]>(`${this.apiUrl}/search`, { params })
            .pipe(
                catchError(this.handleError)
            );
    }

    /**
     * Obtener clientes por sucursal
     */
    getClientesBySucursal(idSucursal: string): Observable<Cliente[]> {
        return this.http.get<Cliente[]>(`${this.apiUrl}/sucursal/${idSucursal}`)
            .pipe(
                catchError(this.handleError)
            );
    }

    /**
     * Validar datos del cliente antes de crear/actualizar
     */
    validarCliente(cliente: ClienteCreateRequest | ClienteUpdateRequest): { valido: boolean; errores: string[] } {
        const errores: string[] = [];

        if ('nombre' in cliente && (!cliente.nombre || cliente.nombre.trim().length < 2)) {
            errores.push('El nombre debe tener al menos 2 caracteres');
        }

        if ('documento' in cliente && (!cliente.documento || cliente.documento.trim().length < 3)) {
            errores.push('El documento es requerido');
        }

        if ('email' in cliente && cliente.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(cliente.email)) {
                errores.push('El formato del email no es válido');
            }
        }

        return {
            valido: errores.length === 0,
            errores
        };
    }

    /**
     * Formatear datos del cliente para mostrar
     */
    formatCliente(cliente: Cliente): any {
        return {
            ...cliente,
            sucursalNombre: cliente.sucursal?.nombreSucursal || 'Sin sucursal',
            fechaCreacionFormateada: new Date(cliente.fecha_creacion).toLocaleDateString()
        };
    }

    /**
     * Filtrar clientes localmente (para uso en componentes)
     */
    filtrarClientes(clientes: Cliente[], filtro: string): Cliente[] {
        if (!filtro) return clientes;

        const term = filtro.toLowerCase();
        return clientes.filter(cliente =>
            cliente.nombre.toLowerCase().includes(term) ||
            cliente.documento.toLowerCase().includes(term) ||
            cliente.email.toLowerCase().includes(term) ||
            cliente.telefono.toLowerCase().includes(term)
        );
    }

    /**
     * Manejo de errores
     */
    private handleError(error: any): Observable<never> {
        console.error('Error en ClienteService:', error);

        let errorMessage = 'Ha ocurrido un error en el servicio de clientes';

        if (error.error?.detail) {
            errorMessage = error.error.detail;
        } else if (error.error?.message) {
            errorMessage = error.error.message;
        } else if (error.message) {
            errorMessage = error.message;
        }

        return throwError(() => new Error(errorMessage));
    }
}