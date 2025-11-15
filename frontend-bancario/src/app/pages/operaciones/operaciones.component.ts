import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OperacionesService } from '../../services/operaciones.service';
import { AuthService } from '../../services/auth.service';
import { TransaccionService } from '../../services/transaccion.service';
import { CuentaService } from '../../services/cuenta.service';
import { Cuenta } from '../../models';

export interface OperacionBancaria {
    monto: number;
    idCuenta: string; // UUID
    descripcion?: string;
}

export interface RespuestaOperacion {
    mensaje: string;
    exito: boolean;
    datos?: {
        nuevo_saldo?: number;
        transaccion_id?: string;
        [key: string]: any;
    };
}

@Component({
    selector: 'app-operaciones',
    templateUrl: './operaciones.component.html',
    styleUrls: ['./operaciones.component.css'],
    imports: [FormsModule, CommonModule]
})
export class OperacionesComponent implements OnInit {
    currentUser: any;
    isLoading: boolean = false;
    cuentas: Cuenta[] = [];

    // Datos para los formularios (con números de cuenta para UI)
    depositoData = {
        monto: 0,
        numeroCuenta: '',
        idCuenta: '',
        descripcion: ''
    };

    retiroData = {
        monto: 0,
        numeroCuenta: '',
        idCuenta: '',
        descripcion: ''
    };

    transferenciaData = {
        monto: 0,
        numeroCuentaOrigen: '',
        idCuentaOrigen: '',
        numeroCuentaDestino: '',
        idCuentaDestino: '',
        descripcion: ''
    };

    activeTab: 'deposito' | 'retiro' | 'transferencia' = 'deposito';

    constructor(
        private operacionesService: OperacionesService,
        private authService: AuthService,
        private transaccionService: TransaccionService,
        private cuentaService: CuentaService
    ) { }

    ngOnInit() {
        this.loadCurrentUser();
        this.loadCuentas();
    }

    loadCurrentUser() {
        this.authService.getCurrentUserObservable().subscribe(user => {
            this.currentUser = user;
            console.log('👤 Usuario actual:', user);
        });
    }

    loadCuentas() {
        this.cuentaService.getCuentas().subscribe({
            next: (cuentas) => {
                this.cuentas = cuentas;
                console.log('✅ Cuentas cargadas:', cuentas);
            },
            error: (error) => {
                console.error('❌ Error cargando cuentas:', error);
                this.showError('Error al cargar cuentas: ' + this.getErrorMessage(error));
            }
        });
    }

    // Buscar cuenta por número y devolver UUID
    buscarCuentaPorNumero(numeroCuenta: string): string {
        if (!numeroCuenta) return '';

        const cuenta = this.cuentas.find(c =>
            c.numeroCuenta === numeroCuenta || c.idCuenta === numeroCuenta
        );

        if (cuenta) {
            console.log('✅ Cuenta encontrada:', cuenta.numeroCuenta, '->', cuenta.idCuenta);
            return cuenta.idCuenta;
        } else {
            console.log('❌ Cuenta no encontrada:', numeroCuenta);
            return '';
        }
    }

    // Validar formato UUID
    isValidUUID(uuid: string): boolean {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }

    realizarDeposito() {
        console.log('🔄 Iniciando depósito...', this.depositoData);

        // Validaciones básicas
        if (this.depositoData.monto <= 0) {
            this.showError('El monto debe ser mayor a 0');
            return;
        }

        if (!this.depositoData.numeroCuenta) {
            this.showError('El número de cuenta es obligatorio');
            return;
        }

        // Buscar UUID de la cuenta
        const uuid = this.buscarCuentaPorNumero(this.depositoData.numeroCuenta);
        if (!uuid) {
            this.showError('Cuenta no encontrada. Verifique el número de cuenta.');
            return;
        }

        if (!this.isValidUUID(uuid)) {
            this.showError('ID de cuenta no válido');
            return;
        }

        // Preparar datos para el servicio
        const operacionData: OperacionBancaria = {
            monto: this.depositoData.monto,
            idCuenta: uuid,
            descripcion: this.depositoData.descripcion || 'Depósito realizado'
        };

        console.log('📤 Datos de depósito enviados:', operacionData);

        this.isLoading = true;
        this.operacionesService.realizarDeposito(operacionData).subscribe({
            next: (response) => {
                console.log('✅ Respuesta del depósito:', response);

                let mensaje = `Depósito de ${this.formatMonto(this.depositoData.monto)} realizado exitosamente`;

                if (response.actualizacionSaldo?.nuevoSaldo !== undefined) {
                    mensaje += `. Nuevo saldo: ${this.formatMonto(response.actualizacionSaldo.nuevoSaldo)}`;
                } else if (response.transaccion) {
                    mensaje += `. Transacción ID: ${response.transaccion.idTransaccion}`;
                }

                this.showSuccess(mensaje);
                this.resetForms();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('❌ Error realizando depósito:', error);
                this.showError('Error al realizar depósito: ' + this.getErrorMessage(error));
                this.isLoading = false;
            }
        });
    }

    realizarRetiro() {
        console.log('🔄 Iniciando retiro...', this.retiroData);

        // Validaciones básicas
        if (this.retiroData.monto <= 0) {
            this.showError('El monto debe ser mayor a 0');
            return;
        }

        if (!this.retiroData.numeroCuenta) {
            this.showError('El número de cuenta es obligatorio');
            return;
        }

        // Buscar UUID de la cuenta
        const uuid = this.buscarCuentaPorNumero(this.retiroData.numeroCuenta);
        if (!uuid) {
            this.showError('Cuenta no encontrada. Verifique el número de cuenta.');
            return;
        }

        if (!this.isValidUUID(uuid)) {
            this.showError('ID de cuenta no válido');
            return;
        }

        // Preparar datos para el servicio
        const operacionData: OperacionBancaria = {
            monto: this.retiroData.monto,
            idCuenta: uuid,
            descripcion: this.retiroData.descripcion || 'Retiro realizado'
        };

        console.log('📤 Datos de retiro enviados:', operacionData);

        this.isLoading = true;
        this.operacionesService.realizarRetiro(operacionData).subscribe({
            next: (response) => {
                console.log('✅ Respuesta del retiro:', response);

                let mensaje = `Retiro de ${this.formatMonto(this.retiroData.monto)} realizado exitosamente`;

                if (response.actualizacionSaldo?.nuevoSaldo !== undefined) {
                    mensaje += `. Nuevo saldo: ${this.formatMonto(response.actualizacionSaldo.nuevoSaldo)}`;
                } else if (response.transaccion) {
                    mensaje += `. Transacción ID: ${response.transaccion.idTransaccion}`;
                }

                this.showSuccess(mensaje);
                this.resetForms();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('❌ Error realizando retiro:', error);
                this.showError('Error al realizar retiro: ' + this.getErrorMessage(error));
                this.isLoading = false;
            }
        });
    }

    realizarTransferencia() {
        console.log('🔄 Iniciando transferencia...', this.transferenciaData);

        // Validaciones básicas
        if (this.transferenciaData.monto <= 0) {
            this.showError('El monto debe ser mayor a 0');
            return;
        }

        if (!this.transferenciaData.numeroCuentaOrigen || !this.transferenciaData.numeroCuentaDestino) {
            this.showError('Los números de cuenta origen y destino son obligatorios');
            return;
        }

        // Buscar UUIDs de las cuentas
        const uuidOrigen = this.buscarCuentaPorNumero(this.transferenciaData.numeroCuentaOrigen);
        const uuidDestino = this.buscarCuentaPorNumero(this.transferenciaData.numeroCuentaDestino);

        if (!uuidOrigen) {
            this.showError('Cuenta origen no encontrada. Verifique el número de cuenta.');
            return;
        }

        if (!uuidDestino) {
            this.showError('Cuenta destino no encontrada. Verifique el número de cuenta.');
            return;
        }

        if (!this.isValidUUID(uuidOrigen) || !this.isValidUUID(uuidDestino)) {
            this.showError('IDs de cuenta no válidos');
            return;
        }

        if (uuidOrigen === uuidDestino) {
            this.showError('No se puede transferir a la misma cuenta');
            return;
        }

        // Preparar datos para el servicio
        const transferenciaData = {
            monto: this.transferenciaData.monto,
            idCuenta: uuidOrigen,
            idCuentaDestino: uuidDestino,
            descripcion: this.transferenciaData.descripcion || 'Transferencia realizada'
        };

        console.log('📤 Datos de transferencia enviados:', transferenciaData);

        this.isLoading = true;
        this.operacionesService.realizarTransferencia(transferenciaData).subscribe({
            next: (response) => {
                console.log('✅ Respuesta de la transferencia:', response);

                let mensaje = `Transferencia de ${this.formatMonto(this.transferenciaData.monto)} realizada exitosamente`;

                if (response.actualizacionSaldo?.nuevoSaldo !== undefined) {
                    mensaje += `. Nuevo saldo: ${this.formatMonto(response.actualizacionSaldo.nuevoSaldo)}`;
                } else if (response.transaccion) {
                    mensaje += `. Transacción ID: ${response.transaccion.idTransaccion}`;
                }

                this.showSuccess(mensaje);
                this.resetForms();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('❌ Error realizando transferencia:', error);
                this.showError('Error al realizar transferencia: ' + this.getErrorMessage(error));
                this.isLoading = false;
            }
        });
    }

    // Método alternativo usando endpoints directos (si existen)
    realizarDepositoDirecto() {
        if (this.depositoData.monto <= 0 || !this.depositoData.numeroCuenta) {
            this.showError('Monto válido y número de cuenta son obligatorios');
            return;
        }

        const uuid = this.buscarCuentaPorNumero(this.depositoData.numeroCuenta);
        if (!uuid) {
            this.showError('Cuenta no encontrada');
            return;
        }

        const operacionData: OperacionBancaria = {
            monto: this.depositoData.monto,
            idCuenta: uuid,
            descripcion: this.depositoData.descripcion
        };

        this.isLoading = true;
        this.operacionesService.realizarDepositoDirecto(operacionData).subscribe({
            next: (response) => {
                this.showSuccess(`Depósito de ${this.formatMonto(this.depositoData.monto)} realizado exitosamente`);
                this.resetForms();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error realizando depósito directo:', error);
                this.showError('Error al realizar depósito: ' + this.getErrorMessage(error));
                this.isLoading = false;
            }
        });
    }

    setActiveTab(tab: 'deposito' | 'retiro' | 'transferencia') {
        this.activeTab = tab;
        console.log('🔀 Cambiando a pestaña:', tab);
    }

    resetForms() {
        this.depositoData = { monto: 0, numeroCuenta: '', idCuenta: '', descripcion: '' };
        this.retiroData = { monto: 0, numeroCuenta: '', idCuenta: '', descripcion: '' };
        this.transferenciaData = {
            monto: 0,
            numeroCuentaOrigen: '',
            idCuentaOrigen: '',
            numeroCuentaDestino: '',
            idCuentaDestino: '',
            descripcion: ''
        };
        console.log('🔄 Formularios reiniciados');
    }

    // Obtener información de cuenta para mostrar
    getCuentaInfo(numeroCuenta: string): string {
        const cuenta = this.cuentas.find(c => c.numeroCuenta === numeroCuenta);
        if (!cuenta) return 'Cuenta no encontrada';

        const saldo = cuenta.saldo || 0;
        return `${cuenta.numeroCuenta} - ${cuenta.tipoCuenta} - Saldo: ${this.formatMonto(saldo)}`;
    }

    // Filtrar cuentas para sugerencias
    getCuentasFiltradas(busqueda: string): Cuenta[] {
        if (!busqueda) return this.cuentas;

        return this.cuentas.filter(cuenta =>
            cuenta.numeroCuenta?.toLowerCase().includes(busqueda.toLowerCase()) ||
            cuenta.idCuenta?.toLowerCase().includes(busqueda.toLowerCase())
        );
    }

    formatMonto(monto: number): string {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(monto);
    }

    private getErrorMessage(error: any): string {
        console.log('🔍 Error detallado:', error);

        if (error.error?.detail) {
            return error.error.detail;
        }
        if (error.error?.errors) {
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
        return 'Error desconocido';
    }

    private showError(message: string) {
        console.error('❌ Error:', message);
        alert('❌ ' + message);
    }

    private showSuccess(message: string) {
        console.log('✅ Éxito:', message);
        alert('✅ ' + message);
    }

    // Debug helper
    debugCuentas() {
        console.log('🐛 Debug - Cuentas disponibles:', this.cuentas);
        console.log('🐛 Debug - Datos depósito:', this.depositoData);
        console.log('🐛 Debug - Datos retiro:', this.retiroData);
        console.log('🐛 Debug - Datos transferencia:', this.transferenciaData);
    }
}