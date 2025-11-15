# 🏦 SISTEMA BANCARIO - FRONTEND

## 📋 DESCRIPCIÓN
Frontend desarrollado en ANGULAR para sistema bancario con autenticación y gestión completa de entidades bancarias.

## 🚀 CARACTERÍSTICAS PRINCIPALES

### 🔐 MÓDULO DE AUTENTICACIÓN
- **LOGIN** de usuarios
- **REGISTRO** de nuevos usuarios
- Manejo de sesiones y tokens

### 👥 GESTIÓN DE USUARIOS Y ROLES
- **ADMINISTRADORES**: Acceso completo al sistema
- **USUARIOS REGULARES**: Acceso limitado
- Control de permisos y roles

### 💰 MÓDULOS DEL SISTEMA
- **CUENTAS BANCARIAS**
- **CLIENTES** 
- **EMPLEADOS**
- **TRANSACCIONES**
- **SUCURSALES**

## 🛠️ TECNOLOGÍAS UTILIZADAS

### FRONTEND FRAMEWORK
- **ANGULAR 16+**
- **TYPESCRIPT**

### UI/UX FRAMEWORK  
- **BOOTSTRAP 5**
- **RESPONSIVE DESIGN**

### HERRAMIENTAS ADICIONALES
- **RXJS** - Programación reactiva
- **ANGULAR ROUTER** - Navegación
- **ANGULAR FORMS** - Formularios

## 📁 ESTRUCTURA DEL PROYECTO

SRC/
├── APP/
│ ├── PAGES/
│ │ ├── AUTH/
│ │ │ ├── LOGIN/
│ │ │ └── REGISTER/
│ │ ├── DASHBOARD/
│ │ ├── ACCOUNTS/
│ │ ├── USERS/
│ │ ├── CLIENTS/
│ │ ├── EMPLOYEES/
│ │ ├── TRANSACTIONS/
│ │ └── BRANCHES/
│ ├── SERVICES/
│ │ ├── AUTH.SERVICE.TS
│ │ ├── ACCOUNT.SERVICE.TS
│ │ ├── USER.SERVICE.TS
│ │ └── API.SERVICE.TS
│ ├── GUARDS/
│ │ ├── AUTH.GUARD.TS
│ │ └── ADMIN.GUARD.TS
│ ├── INTERCEPTORS/
│ │ └── AUTH.INTERCEPTOR.TS
│ ├── MODELS/
│ │ ├── INDEX.TS
│ └── MODELS/
├── ASSETS/
├── ENVIRONMENTS/
└── STYLES/

## ⚙️ INSTALACIÓN Y CONFIGURACIÓN

### PRERREQUISITOS
- **NODE.JS** (v16 o superior)
- **NPM** o **YARN**
- **ANGULAR CLI**

### COMANDOS DE INSTALACIÓN

```bash
# CLONAR REPOSITORIO
git clone [url-repositorio]
cd sistema-bancario-frontend

# INSTALAR DEPENDENCIAS
npm install

# CONFIGURAR ENVIRONMENT
cp src/environments/environment.example.ts src/environments/environment.ts

# EJECUTAR EN MODO DESARROLLO
ng serve

# ACCEDER A LA APLICACIÓN
http://localhost:4200


#🔧 FUNCIONALIDADES POR MÓDULO
##🔐 MÓDULO AUTH
LOGIN COMPONENT: Autenticación con email/contraseña

REGISTER COMPONENT: Registro de nuevos usuarios

GUARDS: Protección de rutas

INTERCEPTORS: Inyección de tokens

##📊 MÓDULO DASHBOARD
VISTA PRINCIPAL: Resumen del sistema

WIDGETS: Estadísticas y métricas

NAVEGACIÓN: Menú principal

##💰 MÓDULO ACCOUNTS
LISTA DE CUENTAS: Visualización paginada

DETALLES DE CUENTA: Información específica

FILTROS: Búsqueda y filtrado

CREACIÓN/EDICIÓN: (Solo administradores)

##👥 MÓDULO USERS
GESTIÓN DE USUARIOS: CRUD completo

ASIGNACIÓN DE ROLES: Permisos y accesos

BÚSQUEDA: Filtros avanzados

##🏢 MÓDULO BRANCHES
SUCURSALES: Listado y gestión

ASIGNACIÓN EMPLEADOS: Personal por sucursal

GEOLOCALIZACIÓN: direccion donde se encuentra

##💸 MÓDULO TRANSACTIONS
HISTORIAL: Listado de transacciones

FILTROS: Por fecha, tipo, monto

DETALLES: Información completa

EXPORTACIÓN: Reportes en PDF/Excel

##👮‍♂️ SISTEMA DE ROLES
ADMINISTRADOR
✅ Acceso total al sistema

✅ Crear/editar/eliminar cualquier entidad

✅ Gestión de usuarios y roles

✅ Reportes y estadísticas

##EMPLEADO
✅ Gestión de clientes

✅ Ver transacciones

✅ Gestión de cuentas básicas

❌ Sin acceso a configuración

##CLIENTE
✅ Ver propia información

✅ Ver cuentas propias

✅ Ver transacciones propias

❌ Sin acceso administrativo