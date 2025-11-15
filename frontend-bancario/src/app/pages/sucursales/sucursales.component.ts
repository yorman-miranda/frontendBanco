import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SucursalService } from '../../services/sucursal.service';
import { AuthService } from '../../services/auth.service';
import { Sucursal, SucursalCreateRequest, SucursalUpdateRequest } from '../../models';

@Component({
    selector: 'app-sucursales',
    templateUrl: './sucursales.component.html',
    styleUrls: ['./sucursales.component.css'],
    imports: [FormsModule, CommonModule]
})
export class SucursalesComponent implements OnInit {
    sucursales: Sucursal[] = [];
    showForm: boolean = false;
    isEditing: boolean = false;
    searchId: string = '';
    currentUser: any;
    isLoading: boolean = false;

    newSucursal: SucursalCreateRequest = {
        nombreSucursal: '',
        ciudad: '',
        direccion: '',
        telefono: ''
    };

    editSucursal: SucursalUpdateRequest & { idSucursal?: string } = {
        nombreSucursal: '',
        ciudad: '',
        direccion: '',
        telefono: ''
    };

    constructor(
        private sucursalService: SucursalService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.loadCurrentUser();
        this.loadSucursales();
    }

    loadCurrentUser() {
        this.authService.getCurrentUserObservable().subscribe(user => {
            this.currentUser = user;
        });
    }

    loadSucursales() {
        this.isLoading = true;
        this.sucursalService.getSucursales().subscribe({
            next: (sucursales) => {
                this.sucursales = sucursales;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error cargando sucursales:', error);
                this.isLoading = false;
                this.showError('Error al cargar sucursales: ' + this.getErrorMessage(error));
            }
        });
    }

    onSubmit() {
        if (!this.newSucursal.nombreSucursal || !this.newSucursal.ciudad || !this.newSucursal.direccion) {
            this.showError('Nombre, ciudad y dirección son obligatorios');
            return;
        }

        this.isLoading = true;
        this.sucursalService.createSucursal(this.newSucursal).subscribe({
            next: (response) => {
                this.loadSucursales();
                this.showForm = false;
                this.resetForm();
                this.showSuccess('Sucursal creada exitosamente!');
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error creando sucursal:', error);
                this.showError('Error al crear sucursal: ' + this.getErrorMessage(error));
                this.isLoading = false;
            }
        });
    }

    onUpdate() {
        if (!this.editSucursal.nombreSucursal || !this.editSucursal.ciudad || !this.editSucursal.direccion) {
            this.showError('Nombre, ciudad y dirección son obligatorios');
            return;
        }

        if (!this.editSucursal.idSucursal) {
            this.showError('Error: ID de sucursal no encontrado');
            return;
        }

        this.isLoading = true;
        this.sucursalService.updateSucursal(this.editSucursal.idSucursal, this.editSucursal).subscribe({
            next: (response) => {
                this.loadSucursales();
                this.cancelForm();
                this.showSuccess('Sucursal actualizada exitosamente!');
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error actualizando sucursal:', error);
                this.showError('Error al actualizar sucursal: ' + this.getErrorMessage(error));
                this.isLoading = false;
            }
        });
    }

    cancelForm() {
        this.showForm = false;
        this.isEditing = false;
        this.resetForm();
        this.resetEditForm();
    }

    resetForm() {
        this.newSucursal = {
            nombreSucursal: '',
            ciudad: '',
            direccion: '',
            telefono: ''
        };
    }

    resetEditForm() {
        this.editSucursal = {
            nombreSucursal: '',
            ciudad: '',
            direccion: '',
            telefono: ''
        };
    }

    searchSucursal() {
        if (this.searchId) {
            this.isLoading = true;
            this.sucursalService.getSucursalById(this.searchId).subscribe({
                next: (sucursal) => {
                    this.sucursales = sucursal ? [sucursal] : [];
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error buscando sucursal:', error);
                    this.showError('Error al buscar sucursal: ' + this.getErrorMessage(error));
                    this.isLoading = false;
                }
            });
        } else {
            this.loadSucursales();
        }
    }

    editarSucursal(sucursal: Sucursal) {
        this.isEditing = true;
        this.editSucursal = {
            idSucursal: sucursal.idSucursal,
            nombreSucursal: sucursal.nombreSucursal,
            ciudad: sucursal.ciudad,
            direccion: sucursal.direccion,
            telefono: sucursal.telefono || ''
        };
    }

    deleteSucursal(id: string) {
        if (confirm('¿Está seguro de eliminar esta sucursal?')) {
            this.isLoading = true;
            this.sucursalService.deleteSucursal(id).subscribe({
                next: () => {
                    this.loadSucursales();
                    this.showSuccess('Sucursal eliminada exitosamente!');
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error eliminando sucursal:', error);
                    this.showError('Error al eliminar sucursal: ' + this.getErrorMessage(error));
                    this.isLoading = false;
                }
            });
        }
    }

    get isAdmin(): boolean {
        return this.authService.isAdmin();
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