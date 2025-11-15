import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmpleadoService } from '../../services/empleado.service';
import { AuthService } from '../../services/auth.service';
import { Empleado, EmpleadoCreateRequest, EmpleadoUpdateRequest } from '../../models';

@Component({
  selector: 'app-empleados',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css'],
  imports: [FormsModule, CommonModule]
})
export class EmpleadosComponent implements OnInit {
  empleados: Empleado[] = [];
  showForm: boolean = false;
  isEditing: boolean = false;
  searchId: string = '';
  currentUser: any;
  isLoading: boolean = false;

  newEmpleado: EmpleadoCreateRequest = {
    nombre: '',
    apellido: '',
    cargo: '',
    idSucursal: '',
    idUsuario: ''
  };

  editarEmpleado: EmpleadoUpdateRequest & { idEmpleado?: string } = {
    nombre: '',
    apellido: '',
    cargo: '',
    idSucursal: '',
    idUsuario: ''
  };

  cargos = ['Cajero', 'Gerente', 'Asesor', 'Supervisor', 'Atención al Cliente'];

  constructor(
    private empleadoService: EmpleadoService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadEmpleados();
  }

  loadCurrentUser() {
    this.authService.getCurrentUserObservable().subscribe(user => {
      this.currentUser = user;
    });
  }

  loadEmpleados() {
    this.isLoading = true;
    this.empleadoService.getEmpleados().subscribe({
      next: (empleados) => {
        this.empleados = empleados;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando empleados:', error);
        this.isLoading = false;
        this.showError('Error al cargar empleados: ' + this.getErrorMessage(error));
      }
    });
  }

  onSubmit() {
    if (!this.newEmpleado.nombre || !this.newEmpleado.apellido || !this.newEmpleado.cargo) {
      this.showError('Nombre, apellido y cargo son obligatorios');
      return;
    }

    this.isLoading = true;
    this.empleadoService.createEmpleado(this.newEmpleado).subscribe({
      next: (response) => {
        this.loadEmpleados();
        this.showForm = false;
        this.resetForm();
        this.showSuccess('Empleado creado exitosamente!');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creando empleado:', error);
        this.showError('Error al crear empleado: ' + this.getErrorMessage(error));
        this.isLoading = false;
      }
    });
  }

  onUpdate() {
    if (!this.editarEmpleado.nombre || !this.editarEmpleado.apellido || !this.editarEmpleado.cargo) {
      this.showError('Nombre, apellido y cargo son obligatorios');
      return;
    }

    if (!this.editarEmpleado.idEmpleado) {
      this.showError('Error: ID de empleado no encontrado');
      return;
    }

    this.isLoading = true;
    this.empleadoService.updateEmpleado(this.editarEmpleado.idEmpleado, this.editarEmpleado).subscribe({
      next: (response) => {
        this.loadEmpleados();
        this.cancelForm();
        this.showSuccess('Empleado actualizado exitosamente!');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error actualizando empleado:', error);
        this.showError('Error al actualizar empleado: ' + this.getErrorMessage(error));
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
    this.newEmpleado = {
      nombre: '',
      apellido: '',
      cargo: '',
      idSucursal: '',
      idUsuario: ''
    };
  }

  resetEditForm() {
    this.editarEmpleado = {
      nombre: '',
      apellido: '',
      cargo: '',
      idSucursal: '',
      idUsuario: ''
    };
  }

  searchEmpleado() {
    if (this.searchId) {
      this.isLoading = true;
      this.empleadoService.getEmpleadoById(this.searchId).subscribe({
        next: (empleado) => {
          this.empleados = empleado ? [empleado] : [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error buscando empleado:', error);
          this.showError('Error al buscar empleado: ' + this.getErrorMessage(error));
          this.isLoading = false;
        }
      });
    } else {
      this.loadEmpleados();
    }
  }

  editEmpleado(empleado: Empleado) {
    this.isEditing = true;
    this.editarEmpleado = {
      idEmpleado: empleado.idEmpleado,
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      cargo: empleado.cargo,
      idSucursal: empleado.idSucursal || '',
      idUsuario: empleado.idUsuario || ''
    };
  }

  deleteEmpleado(id: string) {
    if (confirm('¿Está seguro de eliminar este empleado?')) {
      this.isLoading = true;
      this.empleadoService.deleteEmpleado(id).subscribe({
        next: () => {
          this.loadEmpleados();
          this.showSuccess('Empleado eliminado exitosamente!');
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error eliminando empleado:', error);
          this.showError('Error al eliminar empleado: ' + this.getErrorMessage(error));
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