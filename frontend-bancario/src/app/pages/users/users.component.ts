import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User, UserCreateRequest, UserUpdateRequest } from '../../models';

@Component({
  selector: 'app-usuarios',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  imports: [FormsModule, CommonModule]
})
export class UsuariosComponent implements OnInit {
  usuarios: User[] = [];
  showForm: boolean = false;
  isEditing: boolean = false;
  searchUsername: string = '';
  currentUser: any;
  isLoading: boolean = false;

  newUser: UserCreateRequest = {
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    es_admin: false
  };

  editUser: UserUpdateRequest & { idUser?: string } = {
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    es_admin: false,
    activo: true
  };

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadUsuarios();
  }

  loadCurrentUser() {
    this.authService.getCurrentUserObservable().subscribe(user => {
      this.currentUser = user;
    });
  }

  loadUsuarios() {
    this.isLoading = true;
    this.usuarioService.getUsers().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
        this.isLoading = false;
        this.showError('Error al cargar usuarios: ' + this.getErrorMessage(error));
      }
    });
  }

  onSubmit() {
    if (!this.isAdmin) {
      this.showError('No tiene permisos para crear usuarios');
      return;
    }

    if (!this.newUser.firstName || !this.newUser.lastName || !this.newUser.username || !this.newUser.password) {
      this.showError('Todos los campos son obligatorios');
      return;
    }

    this.isLoading = true;
    this.usuarioService.createUser(this.newUser).subscribe({
      next: (response) => {
        this.loadUsuarios();
        this.showForm = false;
        this.resetForm();
        this.showSuccess('Usuario creado exitosamente!');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creando usuario:', error);
        this.showError('Error al crear usuario: ' + this.getErrorMessage(error));
        this.isLoading = false;
      }
    });
  }

  onUpdate() {
    if (!this.isAdmin) {
      this.showError('No tiene permisos para editar usuarios');
      return;
    }

    if (!this.editUser.idUser) {
      this.showError('Error: ID de usuario no encontrado');
      return;
    }

    if (!this.editUser.firstName || !this.editUser.lastName || !this.editUser.username) {
      this.showError('Nombre, apellido y usuario son obligatorios');
      return;
    }

    this.isLoading = true;
    this.usuarioService.updateUser(this.editUser.idUser, this.editUser).subscribe({
      next: (response) => {
        this.loadUsuarios();
        this.cancelForm();
        this.showSuccess('Usuario actualizado exitosamente!');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error actualizando usuario:', error);
        this.showError('Error al actualizar usuario: ' + this.getErrorMessage(error));
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
    this.newUser = {
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      es_admin: false
    };
  }

  resetEditForm() {
    this.editUser = {
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      es_admin: false,
      activo: true
    };
  }

  searchUsuario() {
    if (this.searchUsername) {
      this.isLoading = true;
      // Implementar búsqueda si está disponible
      this.showError('Búsqueda por username no implementada');
      this.isLoading = false;
    } else {
      this.loadUsuarios();
    }
  }

  editUsuario(usuario: User) {
    if (!this.isAdmin) {
      this.showError('No tiene permisos para editar usuarios');
      return;
    }

    this.isEditing = true;
    this.editUser = {
      idUser: usuario.idUser,
      firstName: usuario.firstName,
      lastName: usuario.lastName,
      username: usuario.username,
      password: '', // No mostrar contraseña actual por seguridad
      es_admin: usuario.es_admin,
      activo: usuario.activo
    };
  }

  toggleUsuarioEstado(usuario: User) {
    if (!this.isAdmin) {
      this.showError('No tiene permisos para cambiar el estado de usuarios');
      return;
    }

    const nuevoEstado = !usuario.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';

    if (confirm(`¿Está seguro de ${accion} este usuario?`)) {
      this.isLoading = true;
      const updateData: UserUpdateRequest = {
        activo: nuevoEstado
      };

      this.usuarioService.updateUser(usuario.idUser, updateData).subscribe({
        next: (response) => {
          this.loadUsuarios();
          this.showSuccess(`Usuario ${accion}do exitosamente!`);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cambiando estado del usuario:', error);
          this.showError('Error al cambiar estado del usuario: ' + this.getErrorMessage(error));
          this.isLoading = false;
        }
      });
    }
  }

  deleteUsuario(id: string) {
    if (!this.isAdmin) {
      this.showError('No tiene permisos para eliminar usuarios');
      return;
    }

    if (confirm('¿Está seguro de eliminar este usuario?')) {
      this.isLoading = true;
      this.usuarioService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsuarios();
          this.showSuccess('Usuario eliminado exitosamente!');
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error eliminando usuario:', error);
          this.showError('Error al eliminar usuario: ' + this.getErrorMessage(error));
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

