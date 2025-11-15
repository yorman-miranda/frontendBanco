import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OperacionesService } from '../../services/operaciones.service';
import { AuthService } from '../../services/auth.service';
// import { OperacionBancaria } from '../../models';

export interface OperacionBancaria {
    monto: number;
    idCuenta: string; // Cambié de UUID a string para mayor compatibilidad
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

export interface Transaccion {
    idTransaccion: string;
    tipo: string;
    monto: number;
    idCuenta: string;
    fecha: Date;
    fecha_creacion: Date;
    fecha_actualizacion?: Date;
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

    depositoData: OperacionBancaria = {
        monto: 0,
        idCuenta: ''
    };

    retiroData: OperacionBancaria = {
        monto: 0,
        idCuenta: ''
    };

    activeTab: 'deposito' | 'retiro' = 'deposito';

    constructor(
        private operacionesService: OperacionesService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.loadCurrentUser();
    }

    loadCurrentUser() {
        this.authService.getCurrentUserObservable().subscribe(user => {
            this.currentUser = user;
        });
    }

    realizarDeposito() {
        if (this.depositoData.monto <= 0 || !this.depositoData.idCuenta) {
            this.showError('Monto válido e ID de cuenta son obligatorios');
            return;
        }

        this.isLoading = true;
        this.operacionesService.realizarDeposito(this.depositoData).subscribe({
            next: (response) => {
                this.showSuccess(`Depósito de ${this.depositoData.monto} realizado exitosamente`);
                this.resetForms();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error realizando depósito:', error);
                this.showError('Error al realizar depósito: ' + this.getErrorMessage(error));
                this.isLoading = false;
            }
        });
    }

    realizarRetiro() {
        if (this.retiroData.monto <= 0 || !this.retiroData.idCuenta) {
            this.showError('Monto válido e ID de cuenta son obligatorios');
            return;
        }

        this.isLoading = true;
        this.operacionesService.realizarRetiro(this.retiroData).subscribe({
            next: (response) => {
                this.showSuccess(`Retiro de ${this.retiroData.monto} realizado exitosamente`);
                this.resetForms();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error realizando retiro:', error);
                this.showError('Error al realizar retiro: ' + this.getErrorMessage(error));
                this.isLoading = false;
            }
        });
    }

    setActiveTab(tab: 'deposito' | 'retiro') {
        this.activeTab = tab;
    }

    resetForms() {
        this.depositoData = { monto: 0, idCuenta: '' };
        this.retiroData = { monto: 0, idCuenta: '' };
    }

    private getErrorMessage(error: any): string {
        if (error.error?.detail) {
            return error.error.detail;
        }
        return error.message || 'Error desconocido';
    }

    private showError(message: string) {
        alert('❌ ' + message);
    }

    private showSuccess(message: string) {
        alert('✅ ' + message);
    }
}