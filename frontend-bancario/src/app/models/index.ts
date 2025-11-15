
//auth.interface
export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
}

export interface TokenPayload {
    sub: string;
    user_id: string;
    es_admin: boolean;
    exp: number;
}

//user interface 
export interface User {
    idUser: string;
    firstName: string;
    lastName: string;
    username: string;
    activo: boolean;
    es_admin: boolean;
    id_usuario_creacion?: string;
    fecha_creacion?: string;
    fecha_actualizacion?: string;
}

export interface UserCreateRequest {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    es_admin?: boolean;
}

export interface UserUpdateRequest {
    firstName?: string;
    lastName?: string;
    username?: string;
    password?: string;
    activo?: boolean;
    es_admin?: boolean;
}

export interface ChangeUserPassword {
    contraseña_actual: string;
    nueva_contraseña: string;
}

//Cliente.interface
export interface Cliente {
    idCliente: string;
    nombre: string;
    documento: string;
    telefono?: string;
    direccion?: string;
    email?: string;
    idUsuario: string;
    idSucursal?: string;
    id_usuario_creacion?: string;
    id_usuario_edicion?: string;
    fecha_creacion?: string;
    fecha_actualizacion?: string;
}

export interface ClienteCreateRequest {
    nombre: string;
    documento: string;
    telefono?: string;
    direccion?: string;
    email: string;
    id_usuario_creacion: string;
    idSucursal?: string;
}

export interface ClienteUpdateRequest {
    nombre?: string;
    documento?: string;
    telefono?: string;
    direccion?: string;
    email?: string;
    idUsuario?: string;
    idSucursal?: string;
}

//Empleado interface
export interface Empleado {
    idEmpleado: string;
    nombre: string;
    apellido: string;
    cargo: string;
    idSucursal: string;
    idUsuario: string;
    id_usuario_creacion?: string;
    id_usuario_edicion?: string;
    fecha_creacion?: string;
    fecha_actualizacion?: string;
}

export interface EmpleadoCreateRequest {
    nombre: string;
    apellido: string;
    cargo: string;
    idSucursal: string;
    idUsuario: string;
}

export interface EmpleadoUpdateRequest {
    nombre?: string;
    apellido?: string;
    cargo?: string;
    idSucursal?: string;
    idUsuario?: string;
}

//Sucursal.interface
export interface Sucursal {
    idSucursal: string;
    nombreSucursal: string;
    ciudad: string;
    direccion: string;
    telefono: string;
    id_usuario_creacion?: string;
    id_usuario_edicion?: string;
    fecha_creacion?: string;
    fecha_actualizacion?: string;
}

export interface SucursalCreateRequest {
    nombreSucursal: string;
    ciudad: string;
    direccion: string;
    telefono: string;
}

export interface SucursalUpdateRequest {
    nombreSucursal?: string;
    ciudad?: string;
    direccion?: string;
    telefono?: string;
}

//Cuenta interface
export interface Cuenta {
    idCuenta: string;
    numeroCuenta: string;
    saldo: number;
    estado: string;
    tipoCuenta: string;
    idCliente: string;
    id_usuario_creacion?: string;
    id_usuario_edicion?: string;
    fecha_creacion?: string;
    fecha_actualizacion?: string;
}

export interface CuentaCreateRequest {
    numeroCuenta: string;
    saldo: number;
    estado: string;
    tipoCuenta: string;
    idCliente: string;
}

export interface CuentaUpdateRequest {
    numeroCuenta?: string;
    saldo?: number;
    estado?: string;
    tipoCuenta?: string;
    idCliente?: string;
}

//transaccion interface
export interface Transaccion {
    idTransaccion: string;
    tipo: string;
    monto: number;
    fecha: string;
    idCuenta: string;
    id_usuario_creacion?: string;
    id_usuario_edicion?: string;
    fecha_creacion?: string;
    fecha_actualizacion?: string;

    // Campos opcionales para relaciones (si tu backend los incluye)

    cuenta?: {
        numeroCuenta: string;
        tipoCuenta: string;
        saldo: number;
    };
    usuario_creacion?: {
        firstName: string;
        lastName: string;
        username: string;
    };
}

export interface TransaccionCreateRequest {
    tipo: string;
    monto: number;
    idCuenta: string;
}

export interface TransaccionUpdateRequest {
    tipo?: string;
    monto?: number;
    idCuenta?: string;
}

export interface FiltroTransacciones {
    tipo?: string;
    fechaInicio?: Date;
    fechaFin?: Date;
    idCuenta?: string;
    skip?: number;
    limit?: number;
}

export interface EstadisticasTransacciones {
    totalTransacciones: number;
    totalDepositos: number;
    totalRetiros: number;
    totalTransferencias: number;
    saldoNeto: number;
}

//operaciones interface
export interface OperacionBancaria {
    monto: number;
    idCuenta: string;
}

export interface Transferencia {
    monto: number;
    idCuentaOrigen: string;
    idCuentaDestino: string;
}

export interface RespuestaOperacion {
    mensaje: string;
    exito: boolean;
    datos?: any;
}