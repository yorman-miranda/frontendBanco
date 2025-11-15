import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClienteService, Cliente, ClienteCreateRequest, ClienteUpdateRequest, FiltroClientes } from '../../services/cliente.service';
import { AuthService } from '../../services/auth.service';
import { SucursalService } from '../../services/sucursal.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css'],
  imports: [CommonModule, FormsModule]
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  sucursales: any[] = [];
  showForm: boolean = false;
  isEditing: boolean = false;
  currentUser: any;
  isLoading: boolean = false;
  searchTerm: string = '';

  // Filtros
  filtros: FiltroClientes = {
    nombre: '',
    documento: '',
    email: '',
    idSucursal: '',
    skip: 0,
    limit: 50
  };

  // Cliente para crear/editar
  clienteForm = {
    nombre: '',
    documento: '',
    email: '',
    telefono: '',
    direccion: '',
    idSucursal: ''
  };

  clienteEditId: string = '';

  constructor(
    private clienteService: ClienteService,
    private authService: AuthService,
    private sucursalService: SucursalService,
    private router: Router
  ) { }

  ngOnInit() {
    console.log('🔄 Inicializando componente de clientes...');

    if (!this.authService.isAuthenticated()) {
      console.log('❌ Usuario no autenticado');
      this.redirectToLogin();
      return;
    }

    this.loadCurrentUser();
    this.loadClientes();
    this.loadSucursales();
  }

  loadCurrentUser() {
    this.currentUser = this.authService.getCurrentUser();
    console.log('🔐 Current User:', this.currentUser);
    console.log('🔐 Is Admin:', this.isAdmin);
    console.log('🔐 User Role:', this.currentUser?.rol);
  }

  loadClientes() {
    this.isLoading = true;
    this.clienteService.getClientes(this.filtros).subscribe({
      next: (clientes) => {
        this.clientes = clientes;
        this.clientesFiltrados = clientes;
        this.isLoading = false;
        console.log(`✅ ${clientes.length} clientes cargados`);
      },
      error: (error) => {
        console.error('Error cargando clientes:', error);
        this.isLoading = false;
        if (error.status === 401 || error.status === 403) {
          this.showError('Sesión expirada. Por favor, inicie sesión nuevamente.');
          this.redirectToLogin();
        } else {
          this.showError('Error al cargar clientes: ' + this.getErrorMessage(error));
        }
      }
    });
  }

  loadSucursales() {
    this.sucursalService.getSucursales().subscribe({
      next: (sucursales) => {
        this.sucursales = sucursales;
        console.log(`✅ ${sucursales.length} sucursales cargadas`);
      },
      error: (error) => {
        console.error('Error cargando sucursales:', error);
        if (error.status === 401 || error.status === 403) {
          this.redirectToLogin();
        }
      }
    });
  }

  toggleForm() {
    console.log('📝 Toggle form - Before:', { showForm: this.showForm, isEditing: this.isEditing });

    if (this.isEditing) {
      this.cancelForm();
    } else {
      this.showForm = !this.showForm;
      if (this.showForm) {
        this.isEditing = false;
        this.resetForm();
      }
    }

    console.log('📝 Toggle form - After:', { showForm: this.showForm, isEditing: this.isEditing });
  }

  onSubmit() {
    console.log('📤 Enviando formulario...');
    console.log('✏️ Modo edición:', this.isEditing);
    console.log('📝 Datos del formulario:', this.clienteForm);

    if (this.isEditing) {
      this.actualizarCliente();
    } else {
      this.crearCliente();
    }
  }

  crearCliente() {
    if (!this.authService.isAuthenticated()) {
      this.showError('Usuario no autenticado. Por favor, inicie sesión nuevamente.');
      return;
    }

    const currentUserId = this.authService.getCurrentUserId();
    console.log('🔍 ID Usuario actual:', currentUserId);

    if (!currentUserId) {
      this.showError('No se pudo obtener el ID del usuario. Por favor, inicie sesión nuevamente.');
      return;
    }

    const clienteData: ClienteCreateRequest = {
      nombre: this.clienteForm.nombre,
      documento: this.clienteForm.documento,
      email: this.clienteForm.email,
      telefono: this.clienteForm.telefono,
      direccion: this.clienteForm.direccion,
      idSucursal: this.clienteForm.idSucursal || undefined,
      idUsuario: currentUserId
    };

    console.log('📤 Datos del cliente a enviar:', clienteData);

    const validacion = this.clienteService.validarCliente(clienteData);
    if (!validacion.valido) {
      this.showError(validacion.errores.join(', '));
      return;
    }

    this.isLoading = true;
    this.clienteService.createCliente(clienteData).subscribe({
      next: (cliente) => {
        console.log('✅ Cliente creado:', cliente);
        this.loadClientes();
        this.cancelForm();
        this.showSuccess('Cliente creado exitosamente!');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error creando cliente:', error);
        this.showError('Error al crear cliente: ' + this.getErrorMessage(error));
        this.isLoading = false;
      }
    });
  }

  actualizarCliente() {
    console.log('🔄 Actualizando cliente ID:', this.clienteEditId);

    const currentUserId = this.authService.getCurrentUserId();

    const clienteData: ClienteUpdateRequest = {
      nombre: this.clienteForm.nombre,
      documento: this.clienteForm.documento,
      email: this.clienteForm.email,
      telefono: this.clienteForm.telefono,
      direccion: this.clienteForm.direccion,
      idSucursal: this.clienteForm.idSucursal || undefined,
    };

    if (currentUserId) {
      clienteData.idUsuario = currentUserId;
    }

    console.log('📤 Datos para actualizar:', clienteData);

    const validacion = this.clienteService.validarCliente(clienteData);
    if (!validacion.valido) {
      this.showError(validacion.errores.join(', '));
      return;
    }

    this.isLoading = true;
    this.clienteService.updateCliente(this.clienteEditId, clienteData).subscribe({
      next: (cliente) => {
        console.log('✅ Cliente actualizado:', cliente);
        this.loadClientes();
        this.cancelForm();
        this.showSuccess('Cliente actualizado exitosamente!');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error actualizando cliente:', error);
        console.error('❌ Error details:', error.error);
        this.showError('Error al actualizar cliente: ' + this.getErrorMessage(error));
        this.isLoading = false;
      }
    });
  }

  editCliente(cliente: Cliente) {
    console.log('✏️ Editando cliente:', cliente);
    this.isEditing = true;
    this.showForm = false;
    this.clienteEditId = cliente.idCliente;
    this.clienteForm = {
      nombre: cliente.nombre,
      documento: cliente.documento,
      email: cliente.email,
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
      idSucursal: cliente.idSucursal || ''
    };
    console.log('📝 Formulario cargado:', this.clienteForm);
  }

  deleteCliente(id: string) {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
      this.isLoading = true;
      this.clienteService.deleteCliente(id).subscribe({
        next: () => {
          this.loadClientes();
          this.showSuccess('Cliente eliminado exitosamente!');
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error eliminando cliente:', error);
          this.showError('Error al eliminar cliente: ' + this.getErrorMessage(error));
          this.isLoading = false;
        }
      });
    }
  }

  cancelForm() {
    console.log('❌ Cancelando formulario');
    this.showForm = false;
    this.isEditing = false;
    this.resetForm();
  }

  resetForm() {
    this.clienteForm = {
      nombre: '',
      documento: '',
      email: '',
      telefono: '',
      direccion: '',
      idSucursal: ''
    };
    this.clienteEditId = '';
  }


  searchClientes() {
    if (this.searchTerm) {
      this.isLoading = true;
      this.clienteService.searchClientes(this.searchTerm).subscribe({
        next: (clientes) => {
          this.clientesFiltrados = clientes;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error buscando clientes:', error);
          this.showError('Error al buscar clientes: ' + this.getErrorMessage(error));
          this.isLoading = false;
        }
      });
    } else {
      this.clientesFiltrados = [...this.clientes];
    }
  }

  aplicarFiltros() {
    this.loadClientes();
  }

  limpiarFiltros() {
    this.filtros = {
      nombre: '',
      documento: '',
      email: '',
      idSucursal: '',
      skip: 0,
      limit: 50
    };
    this.searchTerm = '';
    this.loadClientes();
  }

  getSucursalNombre(idSucursal?: string): string {
    if (!idSucursal) return 'Sin sucursal';
    const sucursal = this.sucursales.find(s => s.idSucursal === idSucursal);
    return sucursal ? sucursal.nombreSucursal : 'Sucursal no encontrada';
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  get isAdmin(): boolean {
    const adminStatus = this.authService.isAdmin();
    console.log('🔐 GET isAdmin() called, returning:', adminStatus);
    return adminStatus;
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