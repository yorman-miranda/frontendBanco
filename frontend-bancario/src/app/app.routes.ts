import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
    // Rutas públicas
    {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
    },

    // Rutas protegidas (requieren autenticación)
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'clientes',
        loadComponent: () => import('./pages/clients/clients.component').then(m => m.ClientesComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'cuentas',
        loadComponent: () => import('./pages/accounts/accounts.component').then(m => m.CuentasComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'transacciones',
        loadComponent: () => import('./pages/transactions/transactions.component').then(m => m.TransaccionesComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'operaciones',
        loadComponent: () => import('./pages/operaciones/operaciones.component').then(m => m.OperacionesComponent),
        canActivate: [AuthGuard]
    },

    // Rutas solo para administradores
    {
        path: 'usuarios',
        loadComponent: () => import('./pages/users/users.component').then(m => m.UsuariosComponent),
        canActivate: [AuthGuard, AdminGuard]
    },
    {
        path: 'empleados',
        loadComponent: () => import('./pages/employees/employees.component').then(m => m.EmpleadosComponent),
        canActivate: [AuthGuard, AdminGuard]
    },
    {
        path: 'sucursales',
        loadComponent: () => import('./pages/sucursales/sucursales.component').then(m => m.SucursalesComponent),
        canActivate: [AuthGuard, AdminGuard]
    },

    // Ruta por defecto (404)
    {
        path: '**',
        redirectTo: '/dashboard'
    }
];