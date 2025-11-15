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

  // Para mapeo número de cuenta -> UUID
  numeroCuentaOrigen: string = '';
  numeroCuentaDestino: string = '';

  // Filtros
  filtros: FiltroTransacciones = {
    tipo: '',
    fechaInicio: undefined,
    fechaFin: undefined,
    idCuenta: '',
    skip: 0,
    limit: 50
  };

  // Nueva transacción (con UUIDs)
  newTransaccion: TransaccionCreateRequest = {
    tipo: 'DEPOSITO',
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
        console.log('✅ Transacciones cargadas:', transacciones.length);
      },
      error: (error) => {
        console.error('❌ Error cargando transacciones:', error);
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
        console.log('✅ Cuentas cargadas:', cuentas);
      },
      error: (error) => {
        console.error('❌ Error cargando cuentas:', error);
        this.isLoadingCuentas = false;
        this.showError('Error al cargar cuentas: ' + this.getErrorMessage(error));
      }
    });
  }

  // Buscar cuenta por número de cuenta y devolver UUID
  buscarCuentaPorNumero(numeroCuenta: string): Cuenta | null {
    const cuenta = this.cuentas.find(c =>
      c.numeroCuenta === numeroCuenta || c.idCuenta === numeroCuenta
    );
    return cuenta || null;
  }

  // Cuando el usuario ingresa un número de cuenta
  onNumeroCuentaChange(valor: string, tipo: 'origen' | 'destino') {
    console.log(`🔍 Buscando cuenta ${tipo}:`, valor);

    const cuenta = this.buscarCuentaPorNumero(valor);

    if (cuenta) {
      console.log('✅ Cuenta encontrada:', cuenta);
      if (tipo === 'origen') {
        this.newTransaccion.idCuenta = cuenta.idCuenta;
        this.numeroCuentaOrigen = cuenta.numeroCuenta;
      } else {
        this.newTransaccion.idCuentaDestino = cuenta.idCuenta;
        this.numeroCuentaDestino = cuenta.numeroCuenta;
      }
    } else {
      console.log('❌ Cuenta no encontrada');
      if (tipo === 'origen') {
        this.newTransaccion.idCuenta = '';
        this.numeroCuentaOrigen = valor;
      } else {
        this.newTransaccion.idCuentaDestino = '';
        this.numeroCuentaDestino = valor;
      }
    }
  }

  // Filtrar cuentas para el datalist
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
      cuenta.numeroCuenta?.toLowerCase().includes(term) ||
      cuenta.idCuenta?.toLowerCase().includes(term)
    );

    if (tipo === 'origen') {
      this.cuentasFiltradasOrigen = cuentasFiltradas;
    } else {
      this.cuentasFiltradasDestino = cuentasFiltradas;
    }
  }

  onSubmit() {
    console.log('🔄 Enviando transacción...', this.newTransaccion);
    console.log('📋 Números de cuenta:', {
      origen: this.numeroCuentaOrigen,
      destino: this.numeroCuentaDestino
    });

    // Validar que tenemos UUIDs válidos
    if (!this.isValidUUID(this.newTransaccion.idCuenta)) {
      this.showError('Cuenta origen no válida. Seleccione una cuenta de la lista.');
      return;
    }

    if (this.mostrarCampoDestino() && !this.isValidUUID(this.newTransaccion.idCuentaDestino || '')) {
      this.showError('Cuenta destino no válida. Seleccione una cuenta de la lista.');
      return;
    }

    const validacion = this.transaccionService.validarTransaccion(this.newTransaccion);

    if (!validacion.valido) {
      this.showError(validacion.errores.join(', '));
      return;
    }

    this.isLoading = true;

    this.transaccionService.procesarTransaccionCompleta(this.newTransaccion).subscribe({
      next: (response) => {
        console.log('✅ Transacción completada:', response);

        const nuevoSaldo = response.actualizacionSaldo?.nuevoSaldo;
        let mensaje = 'Transacción creada exitosamente!';

        if (nuevoSaldo !== undefined) {
          mensaje = `Transacción creada exitosamente! Nuevo saldo: ${this.formatMonto(nuevoSaldo)}`;
        } else if (response.errorSaldo) {
          mensaje = 'Transacción creada pero hubo un problema actualizando el saldo';
        }

        this.loadTransacciones();
        this.loadCuentas();
        this.showForm = false;
        this.resetForm();
        this.showSuccess(mensaje);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error creando transacción:', error);
        this.showError('Error al crear transacción: ' + this.getErrorMessage(error));
        this.isLoading = false;
      }
    });
  }

  // Validar formato UUID
  isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Cambiar visibilidad de campos según el tipo de transacción
  mostrarCampoDestino(): boolean {
    return this.newTransaccion.tipo === 'TRANSFERENCIA';
  }

  getPlaceholderOrigen(): string {
    switch (this.newTransaccion.tipo) {
      case 'DEPOSITO':
        return 'Número de cuenta que recibe el depósito';
      case 'RETIRO':
        return 'Número de cuenta de la que se retira';
      case 'TRANSFERENCIA':
        return 'Número de cuenta de origen';
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
      tipo: 'DEPOSITO',
      monto: 0,
      idCuenta: '',
      idCuentaDestino: '',
      descripcion: ''
    };
    this.numeroCuentaOrigen = '';
    this.numeroCuentaDestino = '';
    this.cuentasFiltradasOrigen = this.cuentas;
    this.cuentasFiltradasDestino = this.cuentas;
    console.log('🔄 Formulario reiniciado');
  }

  // Obtener información de la cuenta para mostrar
  getCuentaInfo(uuid: string): string {
    const cuenta = this.cuentas.find(c => c.idCuenta === uuid);
    if (!cuenta) return 'Cuenta no encontrada';

    const saldo = cuenta.saldo || 0;
    return `${cuenta.numeroCuenta} - ${cuenta.tipoCuenta} - Saldo: ${this.formatMonto(saldo)}`;
  }

  aplicarFiltros() {
    console.log('🔍 Aplicando filtros:', this.filtros);

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
    console.log('✅ Filtros aplicados. Resultados:', transaccionesFiltradas.length);
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
    console.log('🔄 Filtros limpiados');
  }

  calcularEstadisticas() {
    this.estadisticas = this.transaccionService.obtenerEstadisticas(this.transaccionesFiltradas);
    console.log('📊 Estadísticas calculadas:', this.estadisticas);
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
      console.log('🔍 Buscando transacción por ID:', id);

      this.transaccionService.getTransaccionById(id).subscribe({
        next: (transaccion) => {
          this.transaccionesFiltradas = transaccion ? [transaccion] : [];
          this.calcularEstadisticas();
          this.isLoading = false;
          console.log('✅ Transacción encontrada:', transaccion ? 'Sí' : 'No');
        },
        error: (error) => {
          console.error('❌ Error buscando transacción:', error);
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
      console.log('🔍 Buscando transacciones por cuenta:', cuentaId);

      this.transaccionService.getTransaccionesByCuenta(cuentaId).subscribe({
        next: (transacciones) => {
          this.transaccionesFiltradas = transacciones;
          this.calcularEstadisticas();
          this.isLoading = false;
          console.log('✅ Transacciones encontradas:', transacciones.length);
        },
        error: (error) => {
          console.error('❌ Error cargando transacciones por cuenta:', error);
          this.showError('Error al cargar transacciones: ' + this.getErrorMessage(error));
          this.isLoading = false;
        }
      });
    } else {
      this.limpiarFiltros();
    }
  }

  searchTransaccion() {
    console.log('🔍 Buscando transacción con ID:', this.searchId);

    if (this.searchId) {
      this.buscarPorId(this.searchId);
    } else {
      this.limpiarFiltros();
    }
  }

  deleteTransaccion(id: string) {
    if (confirm('¿Está seguro de eliminar esta transacción? Esta acción no se puede deshacer.')) {
      this.isLoading = true;
      console.log('🗑️ Eliminando transacción:', id);

      this.transaccionService.deleteTransaccion(id).subscribe({
        next: () => {
          this.loadTransacciones();
          this.showSuccess('Transacción eliminada exitosamente!');
          this.isLoading = false;
          console.log('✅ Transacción eliminada');
        },
        error: (error) => {
          console.error('❌ Error eliminando transacción:', error);
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
}