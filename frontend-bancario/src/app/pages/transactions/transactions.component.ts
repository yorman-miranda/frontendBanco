import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TransaccionService } from '../../services/transaccion.service';
import { AuthService } from '../../services/auth.service';
import { CuentaService } from '../../services/cuenta.service';
import { Transaccion, TransaccionCreateRequest, FiltroTransacciones, EstadisticasTransacciones } from '../../services/transaccion.service';
import { Cuenta } from '../../models';

@Component({
  selector: 'app-transacciones',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css'],
  imports: [FormsModule, CommonModule]
})
export class TransaccionesComponent implements OnInit {
  transacciones: Transaccion[] = [];
  transaccionesFiltradas: Transaccion[] = [];
  cuentas: Cuenta[] = [];
  cuentasFiltradasOrigen: Cuenta[] = [];
  cuentasFiltradasDestino: Cuenta[] = [];
  showForm: boolean = false;
  currentUser: any;
  isLoading: boolean = false;
  isLoadingCuentas: boolean = false;
  searchId: string = '';
  estadisticas: EstadisticasTransacciones | null = null;

  // Filtros
  filtros: FiltroTransacciones = {
    tipo: '',
    fechaInicio: undefined,
    fechaFin: undefined,
    idCuenta: '',
    skip: 0,
    limit: 50
  };

  // Nueva transacción
  newTransaccion: TransaccionCreateRequest = {
    tipo: 'TRANSFERENCIA',
    monto: 0,
    idCuenta: '',
    idCuentaDestino: '',
    descripcion: ''
  };

  tiposTransaccion = [
    { value: 'DEPOSITO', label: 'Depósito', icon: '💰' },
    { value: 'RETIRO', label: 'Retiro', icon: '💸' },
    { value: 'TRANSFERENCIA', label: 'Transferencia', icon: '🔄' },
  ];

  constructor(
    public transaccionService: TransaccionService,
    private authService: AuthService,
    private cuentaService: CuentaService
  ) { }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadTransacciones();
    this.loadCuentas();
  }

  loadCurrentUser() {
    this.authService.getCurrentUserObservable().subscribe(user => {
      this.currentUser = user;
    });
  }

  loadTransacciones() {
    this.isLoading = true;
    this.transaccionService.getTransacciones().subscribe({
      next: (transacciones) => {
        this.transacciones = transacciones;
        this.transaccionesFiltradas = transacciones;
        this.calcularEstadisticas();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando transacciones:', error);
        this.isLoading = false;
        this.showError('Error al cargar transacciones: ' + this.getErrorMessage(error));
      }
    });
  }

  loadCuentas() {
    this.isLoadingCuentas = true;
    this.cuentaService.getCuentas().subscribe({
      next: (cuentas) => {
        this.cuentas = cuentas;
        this.cuentasFiltradasOrigen = cuentas;
        this.cuentasFiltradasDestino = cuentas;
        this.isLoadingCuentas = false;
      },
      error: (error) => {
        console.error('Error cargando cuentas:', error);
        this.isLoadingCuentas = false;
        this.showError('Error al cargar cuentas: ' + this.getErrorMessage(error));
      }
    });
  }

  // Filtrar cuentas en tiempo real
  filtrarCuentas(busqueda: string, tipo: 'origen' | 'destino') {
    if (!busqueda) {
      if (tipo === 'origen') {
        this.cuentasFiltradasOrigen = this.cuentas;
      } else {
        this.cuentasFiltradasDestino = this.cuentas;
      }
      return;
    }

    const term = busqueda.toLowerCase();
    const cuentasFiltradas = this.cuentas.filter(cuenta =>
      cuenta.numeroCuenta.toLowerCase().includes(term) ||
      cuenta.idCuenta.toLowerCase().includes(term)
    );

    if (tipo === 'origen') {
      this.cuentasFiltradasOrigen = cuentasFiltradas;
    } else {
      this.cuentasFiltradasDestino = cuentasFiltradas;
    }
  }

  // Seleccionar cuenta automáticamente cuando se encuentra una coincidencia exacta
  onCuentaInput(event: any, tipo: 'origen' | 'destino') {
    const valor = event.target.value;
    this.filtrarCuentas(valor, tipo);

    // Buscar coincidencia exacta
    const cuentaEncontrada = this.cuentas.find(cuenta =>
      cuenta.numeroCuenta === valor || cuenta.idCuenta === valor
    );

    if (cuentaEncontrada) {
      if (tipo === 'origen') {
        this.newTransaccion.idCuenta = cuentaEncontrada.idCuenta;
      } else {
        this.newTransaccion.idCuentaDestino = cuentaEncontrada.idCuenta;
      }
    } else {
      // Limpiar si no hay coincidencia
      if (tipo === 'origen') {
        this.newTransaccion.idCuenta = '';
      } else {
        this.newTransaccion.idCuentaDestino = '';
      }
    }
  }

  onSubmit() {
    const validacion = this.transaccionService.validarTransaccion(this.newTransaccion);

    if (!validacion.valido) {
      this.showError(validacion.errores.join(', '));
      return;
    }

    this.isLoading = true;
    this.transaccionService.createTransaccion(this.newTransaccion).subscribe({
      next: (response) => {
        this.loadTransacciones();
        this.showForm = false;
        this.resetForm();
        this.showSuccess('Transacción creada exitosamente!');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creando transacción:', error);
        this.showError('Error al crear transacción: ' + this.getErrorMessage(error));
        this.isLoading = false;
      }
    });
  }

  // Cambiar visibilidad de campos según el tipo de transacción
  mostrarCampoDestino(): boolean {
    return this.newTransaccion.tipo === 'TRANSFERENCIA';
  }

  getPlaceholderOrigen(): string {
    switch (this.newTransaccion.tipo) {
      case 'DEPOSITO':
        return 'Cuenta que recibe el depósito';
      case 'RETIRO':
        return 'Cuenta de la que se retira';
      case 'TRANSFERENCIA':
        return 'Cuenta de origen';
      case 'PAGO_SERVICIO':
        return 'Cuenta desde la que se paga';
      default:
        return 'Seleccionar cuenta';
    }
  }

  getLabelOrigen(): string {
    switch (this.newTransaccion.tipo) {
      case 'DEPOSITO':
        return 'Cuenta Destino *';
      case 'RETIRO':
        return 'Cuenta Origen *';
      case 'TRANSFERENCIA':
        return 'Cuenta Origen *';
      case 'PAGO_SERVICIO':
        return 'Cuenta de Pago *';
      default:
        return 'Cuenta *';
    }
  }

  cancelForm() {
    this.showForm = false;
    this.resetForm();
  }

  resetForm() {
    this.newTransaccion = {
      tipo: 'TRANSFERENCIA',
      monto: 0,
      idCuenta: '',
      idCuentaDestino: '',
      descripcion: ''
    };
    this.cuentasFiltradasOrigen = this.cuentas;
    this.cuentasFiltradasDestino = this.cuentas;
  }

  // Obtener información de la cuenta para mostrar
  getCuentaInfo(idCuenta: string): string {
    const cuenta = this.cuentas.find(c => c.idCuenta === idCuenta);
    if (!cuenta) return 'Cuenta no encontrada';

    return `${cuenta.numeroCuenta} - (${cuenta.tipoCuenta})`;
  }

  aplicarFiltros() {
    let transaccionesFiltradas = [...this.transacciones];

    if (this.filtros.tipo) {
      transaccionesFiltradas = this.transaccionService.filtrarPorTipo(
        transaccionesFiltradas,
        this.filtros.tipo
      );
    }

    if (this.filtros.idCuenta) {
      transaccionesFiltradas = transaccionesFiltradas.filter(
        t => t.idCuenta.includes(this.filtros.idCuenta!)
      );
    }

    if (this.filtros.fechaInicio && this.filtros.fechaFin) {
      transaccionesFiltradas = this.transaccionService.filtrarPorFecha(
        transaccionesFiltradas,
        this.filtros.fechaInicio,
        this.filtros.fechaFin
      );
    }

    this.transaccionesFiltradas = transaccionesFiltradas;
    this.calcularEstadisticas();
  }

  limpiarFiltros() {
    this.filtros = {
      tipo: '',
      fechaInicio: undefined,
      fechaFin: undefined,
      idCuenta: '',
      skip: 0,
      limit: 50
    };
    this.transaccionesFiltradas = [...this.transacciones];
    this.calcularEstadisticas();
  }

  calcularEstadisticas() {
    this.estadisticas = this.transaccionService.obtenerEstadisticas(this.transaccionesFiltradas);
  }

  // Métodos auxiliares
  getTipoClass(tipo: string): string {
    return this.transaccionService.getTipoClass(tipo);
  }

  getTipoIcon(tipo: string): string {
    return this.transaccionService.getTipoIcon(tipo);
  }

  formatMonto(monto: number): string {
    return this.transaccionService.formatMonto(monto);
  }

  buscarPorId(id: string) {
    if (id) {
      this.isLoading = true;
      this.transaccionService.getTransaccionById(id).subscribe({
        next: (transaccion) => {
          this.transaccionesFiltradas = transaccion ? [transaccion] : [];
          this.calcularEstadisticas();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error buscando transacción:', error);
          this.showError('Error al buscar transacción: ' + this.getErrorMessage(error));
          this.isLoading = false;
        }
      });
    } else {
      this.limpiarFiltros();
    }
  }

  buscarPorCuenta(cuentaId: string) {
    if (cuentaId) {
      this.isLoading = true;
      this.transaccionService.getTransaccionesByCuenta(cuentaId).subscribe({
        next: (transacciones) => {
          this.transaccionesFiltradas = transacciones;
          this.calcularEstadisticas();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cargando transacciones por cuenta:', error);
          this.showError('Error al cargar transacciones: ' + this.getErrorMessage(error));
          this.isLoading = false;
        }
      });
    } else {
      this.limpiarFiltros();
    }
  }

  searchTransaccion() {
    if (this.searchId) {
      this.buscarPorId(this.searchId);
    } else {
      this.limpiarFiltros();
    }
  }

  deleteTransaccion(id: string) {
    if (confirm('¿Está seguro de eliminar esta transacción?')) {
      this.isLoading = true;
      this.transaccionService.deleteTransaccion(id).subscribe({
        next: () => {
          this.loadTransacciones();
          this.showSuccess('Transacción eliminada exitosamente!');
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error eliminando transacción:', error);
          this.showError('Error al eliminar transacción: ' + this.getErrorMessage(error));
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
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'Error desconocido';
  }

  private showError(message: string) {
    // En lugar de alert, podrías usar un servicio de notificaciones
    console.error('Error:', message);
    alert('❌ ' + message);
  }

  private showSuccess(message: string) {
    console.log('Éxito:', message);
    alert('✅ ' + message);
  }
}

