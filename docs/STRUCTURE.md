# 📁 Estructura del Proyecto - Intranet Inti

## 🎯 **Descripción General**

Este documento describe la estructura completa del proyecto, incluyendo la organización de archivos, directorios y la lógica de organización del código.

## 🏗️ **Estructura de Directorios**

```
intranet-inti/
├── 📁 app/                          # Lógica de aplicación Laravel
│   ├── 📁 Console/                  # Comandos de consola
│   │   └── 📁 Commands/             # Comandos personalizados
│   │       ├── DebugDocumentos.php
│   │       ├── CheckUploadLimits.php
│   │       └── CheckDocumentos.php
│   ├── 📁 Http/                     # Capa HTTP
│   │   ├── 📁 Controllers/          # Controladores
│   │   │   └── 📁 Api/              # Controladores API
│   │   │       ├── AuthController.php
│   │   │       ├── DocumentoController.php
│   │   │       ├── DireccionController.php
│   │   │       └── ProcesoApoyoController.php
│   │   ├── 📁 Middleware/           # Middleware personalizado
│   │   │   ├── CheckUserActivity.php
│   │   │   ├── HandleLargeUploads.php
│   │   │   └── SecureFileAccess.php
│   │   └── 📁 Requests/             # Validaciones de formularios
│   ├── 📁 Models/                   # Modelos Eloquent
│   │   ├── User.php
│   │   ├── Documento.php
│   │   ├── Direccion.php
│   │   └── ProcesoApoyo.php
│   ├── 📁 Services/                 # Servicios de negocio
│   └── 📁 Policies/                 # Políticas de autorización
├── 📁 config/                       # Configuraciones de Laravel
│   ├── app.php
│   ├── auth.php
│   ├── database.php
│   ├── filesystems.php
│   └── session.php
├── 📁 database/                     # Base de datos
│   ├── 📁 migrations/               # Migraciones
│   │   ├── 2025_01_15_000001_create_direcciones_table.php
│   │   ├── 2025_01_15_000002_create_procesos_apoyo_table.php
│   │   ├── 2025_01_15_000003_create_documentos_table.php
│   │   └── 2025_08_09_135017_optimize_documentos_search_for_enterprise.php
│   ├── 📁 seeders/                  # Datos de ejemplo
│   └── 📁 factories/                # Factories para testing
├── 📁 public/                       # Archivos públicos
│   ├── index.php                    # Punto de entrada
│   ├── .htaccess                    # Configuración Apache
│   └── 📁 storage/                  # Enlace simbólico a storage
├── 📁 resources/                    # Recursos de la aplicación
│   ├── 📁 js/                       # JavaScript/React
│   │   ├── 📁 components/           # Componentes React
│   │   │   ├── 📁 common/           # Componentes reutilizables
│   │   │   │   ├── SearchFilterBar.jsx
│   │   │   │   ├── SessionTimeoutWarning.jsx
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   ├── 📁 dashboard/        # Componentes del dashboard
│   │   │   │   ├── HierarchicalFilters.jsx
│   │   │   │   ├── AdvancedSearchFilters.jsx
│   │   │   │   └── DocumentSearchSection.jsx
│   │   │   ├── 📁 icons/            # Iconos SVG
│   │   │   │   └── DashboardIcons.jsx
│   │   │   ├── UserDashboard.jsx    # Dashboard principal
│   │   │   ├── Documentos.jsx       # Gestión de documentos
│   │   │   ├── Direcciones.jsx      # Gestión de direcciones
│   │   │   └── ProcesosApoyo.jsx    # Gestión de procesos
│   │   ├── 📁 contexts/             # Contextos de estado
│   │   │   └── AuthContext.jsx      # Contexto de autenticación
│   │   ├── 📁 styles/               # Estilos CSS
│   │   │   └── 📁 components/       # Estilos por componente
│   │   │       ├── UserDashboard.module.css
│   │   │       ├── Documentos.module.css
│   │   │       ├── SearchFilterBar.module.css
│   │   │       └── Dashboard.module.css
│   │   └── 📁 config/               # Configuraciones
│   │       ├── session.js           # Configuración de sesiones
│   │       └── performance.js       # Configuración de rendimiento
│   ├── 📁 views/                    # Vistas Blade (mínimas)
│   │   └── app.blade.php            # Vista principal SPA
│   └── 📁 lang/                     # Archivos de idioma
├── 📁 routes/                       # Definición de rutas
│   ├── api.php                      # Rutas API
│   └── web.php                      # Rutas web
├── 📁 storage/                      # Almacenamiento de archivos
│   ├── 📁 app/                      # Archivos privados
│   │   └── 📁 public/               # Archivos públicos
│   │       └── 📁 documentos/       # Documentos subidos
│   ├── 📁 framework/                # Archivos del framework
│   │   ├── 📁 cache/                # Caché
│   │   ├── 📁 logs/                 # Logs
│   │   └── 📁 sessions/             # Sesiones
│   └── 📁 logs/                     # Logs de aplicación
├── 📁 tests/                        # Tests automatizados
│   ├── 📁 Feature/                  # Tests de funcionalidades
│   └── 📁 Unit/                     # Tests unitarios
├── 📁 vendor/                       # Dependencias de Composer
├── 📁 node_modules/                 # Dependencias de npm
├── 📁 docs/                         # Documentación del proyecto
│   ├── USER_STORIES.md              # Historias de usuario
│   ├── ARCHITECTURE.md              # Arquitectura del sistema
│   └── STRUCTURE.md                 # Este archivo
├── .env                             # Variables de entorno
├── .env.example                     # Ejemplo de variables de entorno
├── .gitignore                       # Archivos ignorados por Git
├── composer.json                    # Dependencias PHP
├── composer.lock                    # Lock de dependencias PHP
├── package.json                     # Dependencias JavaScript
├── package-lock.json                # Lock de dependencias JavaScript
├── webpack.mix.js                   # Configuración de Mix
├── README.md                        # Documentación principal
└── artisan                          # Comando de Laravel
```

## 🔧 **Organización del Código**

### **Frontend (React)**

#### **Estructura de Componentes**
```
components/
├── common/                          # Componentes reutilizables
│   ├── SearchFilterBar.jsx          # Barra de búsqueda
│   ├── SessionTimeoutWarning.jsx    # Advertencia de sesión
│   └── LoadingSpinner.jsx           # Spinner de carga
├── dashboard/                       # Componentes específicos del dashboard
│   ├── HierarchicalFilters.jsx      # Filtros en cascada
│   ├── AdvancedSearchFilters.jsx    # Filtros avanzados
│   └── DocumentSearchSection.jsx    # Sección de búsqueda
└── [Componentes principales]        # Componentes de páginas
```

#### **Convenciones de Nomenclatura**
```javascript
// Componentes: PascalCase
const UserDashboard = () => { /* ... */ };

// Archivos de componentes: PascalCase.jsx
UserDashboard.jsx
SearchFilterBar.jsx

// Hooks personalizados: camelCase con prefijo 'use'
const useApiRequest = () => { /* ... */ };

// Funciones: camelCase
const handleSearch = () => { /* ... */ };

// Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:8000/api';
```

#### **Organización de Estilos**
```css
/* Estilos modulares por componente */
UserDashboard.module.css
Documentos.module.css
SearchFilterBar.module.css

/* Convenciones CSS */
.container { /* Contenedor principal */ }
.header { /* Encabezado */ }
.content { /* Contenido principal */ }
.footer { /* Pie de página */ }

/* Estados */
.button:hover { /* Estado hover */ }
.button:active { /* Estado activo */ }
.button:disabled { /* Estado deshabilitado */ }
```

### **Backend (Laravel)**

#### **Estructura de Controladores**
```php
// Controladores API: sufijo 'Controller'
class DocumentoController extends Controller
{
    // Métodos CRUD estándar
    public function index() { /* Listar */ }
    public function store() { /* Crear */ }
    public function show() { /* Mostrar */ }
    public function update() { /* Actualizar */ }
    public function destroy() { /* Eliminar */ }
    
    // Métodos específicos
    public function buscar() { /* Búsqueda */ }
    public function descargar() { /* Descarga */ }
    public function vistaPrevia() { /* Vista previa */ }
}
```

#### **Estructura de Modelos**
```php
// Modelos: singular, PascalCase
class Documento extends Model
{
    // Propiedades
    protected $fillable = [/* campos llenables */];
    protected $casts = [/* conversiones de tipos */];
    
    // Relaciones
    public function direccion() { /* ... */ }
    public function procesoApoyo() { /* ... */ }
    
    // Scopes
    public function scopePorDireccion() { /* ... */ }
    public function scopePorProceso() { /* ... */ }
    
    // Accesores y mutadores
    public function getTamañoFormateadoAttribute() { /* ... */ }
}
```

#### **Estructura de Middleware**
```php
// Middleware: sufijo descriptivo
class CheckUserActivity
{
    public function handle(Request $request, Closure $next)
    {
        // Lógica del middleware
        return $next($request);
    }
}
```

## 📊 **Base de Datos**

### **Estructura de Tablas**
```sql
-- Convenciones de nomenclatura
-- Tablas: plural, snake_case
-- Columnas: snake_case
-- Claves foráneas: singular_tabla_id

-- Tabla de usuarios
users (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id BIGINT UNSIGNED,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Tabla de direcciones
direcciones (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Tabla de procesos de apoyo
procesos_apoyo (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    descripcion TEXT NULL,
    direccion_id BIGINT UNSIGNED,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (direccion_id) REFERENCES direcciones(id)
);

-- Tabla de documentos
documentos (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo_archivo VARCHAR(100) NOT NULL,
    tamaño_archivo BIGINT UNSIGNED NOT NULL,
    direccion_id BIGINT UNSIGNED,
    proceso_apoyo_id BIGINT UNSIGNED,
    subido_por BIGINT UNSIGNED,
    slug VARCHAR(255) UNIQUE,
    tipo VARCHAR(100) NULL,
    etiquetas JSON NULL,
    fecha_documento DATE NULL,
    vigente_hasta DATE NULL,
    confidencialidad ENUM('Publico', 'Interno', 'Restringido') DEFAULT 'Publico',
    contador_descargas INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (direccion_id) REFERENCES direcciones(id),
    FOREIGN KEY (proceso_apoyo_id) REFERENCES procesos_apoyo(id),
    FOREIGN KEY (subido_por) REFERENCES users(id)
);
```

### **Índices Optimizados**
```sql
-- Índices para búsqueda rápida
CREATE INDEX idx_documentos_direccion_proceso 
ON documentos(direccion_id, proceso_apoyo_id, created_at);

CREATE INDEX idx_documentos_search_complete 
ON documentos(direccion_id, proceso_apoyo_id, tipo_archivo, confidencialidad, created_at);

CREATE INDEX idx_documentos_tipo_archivo 
ON documentos(tipo_archivo);

CREATE INDEX idx_documentos_created_at 
ON documentos(created_at);

CREATE INDEX idx_documentos_confidencialidad 
ON documentos(confidencialidad);

CREATE INDEX idx_documentos_subido_por 
ON documentos(subido_por, created_at);

CREATE INDEX idx_direcciones_activo 
ON direcciones(activo);

CREATE INDEX idx_procesos_apoyo_direccion 
ON procesos_apoyo(direccion_id, activo);
```

## 🔄 **Flujo de Archivos**

### **Subida de Documentos**
```
1. Usuario selecciona archivo
   ↓
2. Frontend valida tipo y tamaño
   ↓
3. FormData se envía a /api/documentos
   ↓
4. HandleLargeUploads middleware procesa
   ↓
5. DocumentoController valida y almacena
   ↓
6. Archivo se guarda en storage/app/public/documentos/
   ↓
7. Registro se crea en tabla documentos
   ↓
8. Respuesta JSON se envía al frontend
```

### **Búsqueda de Documentos**
```
1. Usuario aplica filtros
   ↓
2. Frontend construye query parameters
   ↓
3. GET request a /api/documentos con filtros
   ↓
4. DocumentoController aplica filtros
   ↓
5. Query SQL optimizada con índices
   ↓
6. Resultados paginados se retornan
   ↓
7. Frontend renderiza resultados
```

## 📁 **Almacenamiento de Archivos**

### **Estructura de Directorios**
```
storage/
├── app/                             # Archivos privados
│   └── public/                      # Archivos públicos
│       └── documentos/              # Documentos subidos
│           ├── 2025/                # Organización por año
│           │   ├── 01/              # Organización por mes
│           │   │   ├── 15/          # Organización por día
│           │   │   │   ├── documento1.pdf
│           │   │   │   └── documento2.docx
│           │   │   └── ...
│           │   └── ...
│           └── ...
└── framework/                       # Archivos del framework
    ├── cache/                       # Caché
    ├── logs/                        # Logs
    └── sessions/                    # Sesiones
```

### **Convenciones de Nomenclatura**
```php
// Archivos: timestamp_nombre_original.extensión
$nombreArchivo = time() . '_' . $request->file('archivo')->getClientOriginalName();

// Ejemplo: 1754747141_formato_practicas.docx
```

## 🔧 **Configuración**

### **Archivos de Configuración**
```php
// config/app.php - Configuración general
'name' => env('APP_NAME', 'Intranet Inti'),
'env' => env('APP_ENV', 'production'),
'debug' => env('APP_DEBUG', false),

// config/database.php - Configuración de BD
'default' => env('DB_CONNECTION', 'mysql'),
'mysql' => [
    'driver' => 'mysql',
    'host' => env('DB_HOST', '127.0.0.1'),
    'port' => env('DB_PORT', '3306'),
    'database' => env('DB_DATABASE', 'intranet_inti'),
    'username' => env('DB_USERNAME', 'root'),
    'password' => env('DB_PASSWORD', ''),
],

// config/filesystems.php - Configuración de archivos
'disks' => [
    'local' => [
        'driver' => 'local',
        'root' => storage_path('app'),
    ],
    'public' => [
        'driver' => 'local',
        'root' => storage_path('app/public'),
        'url' => env('APP_URL').'/storage',
        'visibility' => 'public',
    ],
],
```

### **Variables de Entorno**
```bash
# .env
APP_NAME="Intranet Inti"
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=intranet_inti
DB_USERNAME=root
DB_PASSWORD=

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
```

## 📊 **Logs y Monitoreo**

### **Estructura de Logs**
```
storage/logs/
├── laravel.log                      # Log principal
├── laravel-2025-01-15.log           # Logs por fecha
└── debug.log                        # Logs de debug
```

### **Niveles de Log**
```php
// Log::emergency() - Sistema inutilizable
// Log::alert() - Acción inmediata requerida
// Log::critical() - Condición crítica
// Log::error() - Error de ejecución
// Log::warning() - Advertencia
// Log::notice() - Evento normal pero significativo
// Log::info() - Información general
// Log::debug() - Información de debug
```

## 🚀 **Deployment**

### **Estructura de Producción**
```
/var/www/intranet-inti/
├── current/                         # Enlace simbólico a versión actual
├── releases/                        # Versiones desplegadas
│   ├── 20250115-120000/            # Release por fecha
│   └── 20250115-130000/            # Release más reciente
├── shared/                          # Archivos compartidos
│   ├── storage/                     # Almacenamiento persistente
│   ├── .env                        # Variables de entorno
│   └── logs/                       # Logs persistentes
└── vendor/                          # Dependencias
```

### **Comandos de Deployment**
```bash
# Desplegar nueva versión
php artisan down --message="Actualizando sistema"
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan up
```

Esta estructura proporciona una organización clara, mantenible y escalable para el sistema de gestión documental empresarial.
