import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CuentaService } from '../../services/cuenta.service';
import { ClienteService } from '../../services/cliente.service';
import { AuthService } from '../../services/auth.service';
import { Cuenta, CuentaCreateRequest, CuentaUpdateRequest } from '../../models';

@Component({
  selector: 'app-cuentas',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css'],
  imports: [CommonModule, FormsModule]
})
export class CuentasComponent implements OnInit {
  cuentas: Cuenta[] = [];
  cuentasFiltradas: Cuenta[] = [];
  clientes: any[] = [];
  showForm: boolean = false;
  isEditing: boolean = false;
  currentUser: any;
  isLoading: boolean = false;
  searchTerm: string = '';

  // Cuenta para crear/editar
  cuentaForm = {
    numeroCuenta: '',
    saldo: 0,
    estado: 'ACTIVA',
    tipoCuenta: 'AHORROS',
    idCliente: ''
  };

  cuentaEditId: string = '';

  // Opciones para selects
  estados = [
    { value: 'ACTIVA', label: 'Activa' },
    { value: 'INACTIVA', label: 'Inactiva' },
    { value: 'BLOQUEADA', label: 'Bloqueada' },
    { value: 'CERRADA', label: 'Cerrada' }
  ];

  tiposCuenta = [
    { value: 'AHORROS', label: 'Ahorros' },
    { value: 'CORRIENTE', label: 'Corriente' },
    { value: 'PLAZO_FIJO', label: 'Plazo Fijo' }
  ];

  constructor(
    private cuentaService: CuentaService,
    private clienteService: ClienteService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    // Verificar autenticación primero
    if (!this.authService.isAuthenticated()) {
      this.redirectToLogin();
      return;
    }

    this.loadCurrentUser();
    this.loadCuentas();
    this.loadClientes();
  }

  loadCurrentUser() {
    // Usar el método directo en lugar del Observable
    this.currentUser = this.authService.getCurrentUser();

    // DEBUG
    console.log('🔐 Current User:', this.currentUser);
    console.log('🔐 Is Authenticated:', this.authService.isAuthenticated());
  }

  loadCuentas() {
    this.isLoading = true;
    this.cuentaService.getCuentas().subscribe({
      next: (cuentas) => {
        this.cuentas = cuentas;
        this.cuentasFiltradas = cuentas;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando cuentas:', error);
        this.isLoading = false;

        if (error.status === 401 || error.status === 403) {
          this.showError('Sesión expirada. Por favor, inicie sesión nuevamente.');
          this.redirectToLogin();
        } else {
          this.showError('Error al cargar cuentas: ' + this.getErrorMessage(error));
        }
      }
    });
  }

  loadClientes() {
    this.clienteService.getClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
      },
      error: (error) => {
        console.error('Error cargando clientes:', error);
        if (error.status === 401 || error.status === 403) {
          this.redirectToLogin();
        } else {
          this.showError('Error al cargar clientes: ' + this.getErrorMessage(error));
        }
      }
    });
  }

  onSubmit() {
    if (this.isEditing) {
      this.actualizarCuenta();
    } else {
      this.crearCuenta();
    }
  }

  crearCuenta() {
    const cuentaData: CuentaCreateRequest = {
      numeroCuenta: this.cuentaForm.numeroCuenta,
      saldo: this.cuentaForm.saldo,
      estado: this.cuentaForm.estado,
      tipoCuenta: this.cuentaForm.tipoCuenta,
      idCliente: this.cuentaForm.idCliente
    };

    const validacion = this.validarCuenta(cuentaData);

    if (!validacion.valido) {
      this.showError(validacion.errores.join(', '));
      return;
    }

    this.isLoading = true;
    this.cuentaService.createCuenta(cuentaData).subscribe({
      next: (cuenta) => {
        this.loadCuentas();
        this.cancelForm();
        this.showSuccess('Cuenta creada exitosamente!');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creando cuenta:', error);
        this.showError('Error al crear cuenta: ' + this.getErrorMessage(error));
        this.isLoading = false;
      }
    });
  }

  actualizarCuenta() {
    const cuentaData: CuentaUpdateRequest = {
      numeroCuenta: this.cuentaForm.numeroCuenta,
      saldo: this.cuentaForm.saldo,
      estado: this.cuentaForm.estado,
      tipoCuenta: this.cuentaForm.tipoCuenta,
      idCliente: this.cuentaForm.idCliente
    };

    const validacion = this.validarCuenta(cuentaData);

    if (!validacion.valido) {
      this.showError(validacion.errores.join(', '));
      return;
    }

    this.isLoading = true;
    this.cuentaService.updateCuenta(this.cuentaEditId, cuentaData).subscribe({
      next: (cuenta) => {
        this.loadCuentas();
        this.cancelForm();
        this.showSuccess('Cuenta actualizada exitosamente!');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error actualizando cuenta:', error);
        this.showError('Error al actualizar cuenta: ' + this.getErrorMessage(error));
        this.isLoading = false;
      }
    });
  }

  editCuenta(cuenta: Cuenta) {
    this.isEditing = true;
    this.showForm = true;
    this.cuentaEditId = cuenta.idCuenta;
    this.cuentaForm = {
      numeroCuenta: cuenta.numeroCuenta,
      saldo: cuenta.saldo || 0,
      estado: cuenta.estado,
      tipoCuenta: cuenta.tipoCuenta,
      idCliente: cuenta.idCliente || ''
    };
  }

  deleteCuenta(id: string) {
    if (confirm('¿Está seguro de eliminar esta cuenta?')) {
      this.isLoading = true;
      this.cuentaService.deleteCuenta(id).subscribe({
        next: () => {
          this.loadCuentas();
          this.showSuccess('Cuenta eliminada exitosamente!');
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error eliminando cuenta:', error);
          this.showError('Error al eliminar cuenta: ' + this.getErrorMessage(error));
          this.isLoading = false;
        }
      });
    }
  }

  cancelForm() {
    this.showForm = false;
    this.isEditing = false;
    this.resetForm();
  }

  resetForm() {
    this.cuentaForm = {
      numeroCuenta: '',
      saldo: 0,
      estado: 'ACTIVA',
      tipoCuenta: 'AHORROS',
      idCliente: ''
    };
    this.cuentaEditId = '';
  }

  // Métodos de búsqueda y filtrado
  searchCuentas() {
    if (this.searchTerm) {
      this.cuentasFiltradas = this.cuentas.filter(cuenta =>
        cuenta.numeroCuenta.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.getClienteNombre(cuenta.idCliente || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        cuenta.tipoCuenta.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.cuentasFiltradas = [...this.cuentas];
    }
  }

  limpiarBusqueda() {
    this.searchTerm = '';
    this.cuentasFiltradas = [...this.cuentas];
  }

  // Métodos auxiliares
  validarCuenta(cuenta: CuentaCreateRequest | CuentaUpdateRequest): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!cuenta.numeroCuenta || cuenta.numeroCuenta.trim().length === 0) {
      errores.push('El número de cuenta es requerido');
    }

    if ((cuenta.saldo || 0) < 0) {
      errores.push('El saldo no puede ser negativo');
    }

    if (!cuenta.idCliente) {
      errores.push('Debe seleccionar un cliente');
    }

    if (!cuenta.tipoCuenta) {
      errores.push('Debe seleccionar un tipo de cuenta');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'ACTIVA': return 'badge bg-success';
      case 'INACTIVA': return 'badge bg-warning';
      case 'BLOQUEADA': return 'badge bg-danger';
      case 'CERRADA': return 'badge bg-secondary';
      default: return 'badge bg-secondary';
    }
  }

  getEstadoLabel(estado: string): string {
    const estadoObj = this.estados.find(e => e.value === estado);
    return estadoObj ? estadoObj.label : estado;
  }

  getTipoCuentaLabel(tipo: string): string {
    const tipoObj = this.tiposCuenta.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  }

  getClienteNombre(idCliente: string): string {
    if (!idCliente) return 'Sin cliente asignado';
    const cliente = this.clientes.find(c => c.idCliente === idCliente);
    return cliente ? cliente.nombre : 'Cliente no encontrado';
  }

  formatSaldo(saldo: number | undefined): string {
    const saldoNumero = saldo || 0;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(saldoNumero);
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
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

  private redirectToLogin() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
