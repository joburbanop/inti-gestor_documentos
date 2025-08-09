# 🏗️ Arquitectura del Sistema - Intranet Inti

## 🎯 **Descripción General**

Este documento describe la arquitectura técnica del sistema de gestión documental empresarial, incluyendo patrones de diseño, tecnologías y decisiones arquitectónicas.

## 🏛️ **Arquitectura General**

### **Patrón Arquitectónico**
```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   React SPA     │  │   Mobile Web    │  │   Desktop    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Laravel)                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Controllers   │  │   Middleware    │  │   Routes     │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LAYER                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Services      │  │   Models        │  │   Policies   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   MySQL DB      │  │   File Storage  │  │   Cache      │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 **Componentes del Sistema**

### **Frontend (React SPA)**
```
resources/js/
├── components/                 # Componentes React
│   ├── common/                # Componentes reutilizables
│   │   ├── SearchFilterBar.jsx
│   │   ├── SessionTimeoutWarning.jsx
│   │   └── LoadingSpinner.jsx
│   ├── dashboard/             # Componentes del dashboard
│   │   ├── HierarchicalFilters.jsx
│   │   ├── AdvancedSearchFilters.jsx
│   │   └── DocumentSearchSection.jsx
│   ├── UserDashboard.jsx      # Dashboard principal
│   ├── Documentos.jsx         # Gestión de documentos
│   ├── Direcciones.jsx        # Gestión de direcciones
│   └── ProcesosApoyo.jsx      # Gestión de procesos
├── contexts/                  # Contextos de estado
│   └── AuthContext.jsx        # Contexto de autenticación
├── styles/                    # Estilos CSS
│   └── components/            # Estilos por componente
└── config/                    # Configuraciones
    ├── session.js             # Configuración de sesiones
    └── performance.js         # Configuración de rendimiento
```

### **Backend (Laravel API)**
```
app/
├── Console/Commands/          # Comandos personalizados
│   ├── DebugDocumentos.php
│   ├── CheckUploadLimits.php
│   └── CheckDocumentos.php
├── Http/
│   ├── Controllers/Api/       # Controladores API
│   │   ├── AuthController.php
│   │   ├── DocumentoController.php
│   │   ├── DireccionController.php
│   │   └── ProcesoApoyoController.php
│   ├── Middleware/            # Middleware personalizado
│   │   ├── CheckUserActivity.php
│   │   ├── HandleLargeUploads.php
│   │   └── SecureFileAccess.php
│   └── Requests/              # Validaciones de formularios
├── Models/                    # Modelos Eloquent
│   ├── User.php
│   ├── Documento.php
│   ├── Direccion.php
│   └── ProcesoApoyo.php
├── Services/                  # Servicios de negocio
└── Policies/                  # Políticas de autorización
```

### **Base de Datos (MySQL)**
```sql
-- Tabla de usuarios
users (
    id, name, email, password, role_id, 
    last_login_at, created_at, updated_at
)

-- Tabla de direcciones
direcciones (
    id, nombre, codigo, descripcion, 
    activo, created_at, updated_at
)

-- Tabla de procesos de apoyo
procesos_apoyo (
    id, nombre, codigo, descripcion, 
    direccion_id, activo, created_at, updated_at
)

-- Tabla de documentos
documentos (
    id, titulo, descripcion, nombre_archivo, 
    nombre_original, ruta_archivo, tipo_archivo, 
    tamaño_archivo, direccion_id, proceso_apoyo_id, 
    subido_por, slug, tipo, etiquetas, 
    fecha_documento, vigente_hasta, confidencialidad, 
    contador_descargas, created_at, updated_at
)

-- Tabla de roles
roles (
    id, nombre, descripcion, created_at, updated_at
)
```

## 🔄 **Flujo de Datos**

### **Flujo de Autenticación**
```
1. Usuario ingresa credenciales
   ↓
2. Frontend envía POST /api/auth/login
   ↓
3. AuthController valida credenciales
   ↓
4. Sistema genera token Sanctum
   ↓
5. Frontend almacena token en localStorage
   ↓
6. Token se incluye en todas las peticiones API
```

### **Flujo de Búsqueda de Documentos**
```
1. Usuario selecciona dirección
   ↓
2. Frontend envía GET /api/direcciones/{id}/procesos-apoyo
   ↓
3. Backend retorna procesos de la dirección
   ↓
4. Usuario selecciona proceso
   ↓
5. Frontend envía GET /api/documentos?direccion_id=X&proceso_apoyo_id=Y
   ↓
6. Backend aplica filtros y retorna documentos
   ↓
7. Frontend renderiza resultados
```

### **Flujo de Subida de Documentos**
```
1. Usuario arrastra archivo al sistema
   ↓
2. Frontend valida tipo y tamaño
   ↓
3. Frontend envía POST /api/documentos con FormData
   ↓
4. HandleLargeUploads middleware procesa archivo
   ↓
5. DocumentoController valida y almacena
   ↓
6. Sistema crea registro en BD y archivo en storage
   ↓
7. Backend retorna confirmación
   ↓
8. Frontend actualiza lista de documentos
```

## 🏗️ **Patrones de Diseño Implementados**

### **Frontend Patterns**

#### **Component Pattern**
```javascript
// Componente reutilizable con props
const SearchFilterBar = ({ 
    onSearch, 
    onFiltersChange, 
    placeholder = "Buscar...",
    filters = [],
    loading = false 
}) => {
    // Lógica del componente
    return (
        <div className={styles.searchContainer}>
            {/* UI del componente */}
        </div>
    );
};
```

#### **Context Pattern**
```javascript
// Contexto para estado global
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Métodos de autenticación
    const login = async (credentials) => { /* ... */ };
    const logout = async () => { /* ... */ };
    
    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
```

#### **Custom Hooks Pattern**
```javascript
// Hook personalizado para API
const useApiRequest = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const apiRequest = useCallback(async (url, options = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            const data = await response.json();
            return data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);
    
    return { apiRequest, loading, error };
};
```

### **Backend Patterns**

#### **Repository Pattern**
```php
// Servicio para lógica de negocio
class DocumentoService
{
    public function buscarDocumentos(array $filtros): Collection
    {
        $query = Documento::with(['direccion', 'procesoApoyo']);
        
        if (isset($filtros['direccion_id'])) {
            $query->where('direccion_id', $filtros['direccion_id']);
        }
        
        if (isset($filtros['proceso_apoyo_id'])) {
            $query->where('proceso_apoyo_id', $filtros['proceso_apoyo_id']);
        }
        
        return $query->paginate($filtros['per_page'] ?? 10);
    }
}
```

#### **Middleware Pattern**
```php
// Middleware para verificar actividad del usuario
class CheckUserActivity
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        
        if ($user) {
            $user->update(['last_login_at' => now()]);
        }
        
        return $next($request);
    }
}
```

#### **Policy Pattern**
```php
// Política de autorización
class DocumentoPolicy
{
    public function view(User $user, Documento $documento): bool
    {
        // Lógica de autorización
        return $user->hasPermission('documentos.view') ||
               $documento->subido_por === $user->id;
    }
}
```

## 🔒 **Seguridad**

### **Autenticación**
- **Laravel Sanctum**: Tokens API seguros
- **Expiración automática**: 60 minutos de inactividad
- **Renovación de tokens**: Proceso automático

### **Autorización**
- **Roles y permisos**: Sistema granular
- **Policies**: Autorización a nivel de modelo
- **Middleware**: Validación en cada petición

### **Protección de Datos**
- **Validación de entrada**: Sanitización de datos
- **CSRF Protection**: Protección contra ataques CSRF
- **SQL Injection**: Uso de Eloquent ORM
- **XSS Protection**: Escape automático de datos

### **Seguridad de Archivos**
- **Validación de tipos**: Solo archivos permitidos
- **Escaneo de virus**: Verificación de seguridad
- **Acceso controlado**: Autenticación para descargas
- **Almacenamiento seguro**: Archivos fuera del directorio web

## 📈 **Optimizaciones de Rendimiento**

### **Base de Datos**
```sql
-- Índices optimizados
CREATE INDEX idx_documentos_direccion_proceso 
ON documentos(direccion_id, proceso_apoyo_id, created_at);

CREATE INDEX idx_documentos_search_complete 
ON documentos(direccion_id, proceso_apoyo_id, tipo_archivo, confidencialidad, created_at);

-- Consultas optimizadas
SELECT d.*, dir.nombre as direccion_nombre, p.nombre as proceso_nombre
FROM documentos d
JOIN direcciones dir ON d.direccion_id = dir.id
JOIN procesos_apoyo p ON d.proceso_apoyo_id = p.id
WHERE d.direccion_id = ? AND d.proceso_apoyo_id = ?
ORDER BY d.created_at DESC
LIMIT 10;
```

### **Frontend**
```javascript
// Debounce para búsqueda
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    
    return debouncedValue;
};

// Memoización de componentes
const DocumentList = React.memo(({ documentos, onDocumentClick }) => {
    return (
        <div className={styles.documentList}>
            {documentos.map(doc => (
                <DocumentCard 
                    key={doc.id} 
                    documento={doc} 
                    onClick={onDocumentClick}
                />
            ))}
        </div>
    );
});
```

### **Caché**
```php
// Caché de consultas frecuentes
public function estadisticas(): JsonResponse
{
    $estadisticas = Cache::remember('dashboard_estadisticas', 300, function () {
        return [
            'total_documentos' => Documento::count(),
            'total_direcciones' => Direccion::where('activo', true)->count(),
            'total_procesos' => ProcesoApoyo::where('activo', true)->count()
        ];
    });
    
    return response()->json(['success' => true, 'data' => $estadisticas]);
}
```

## 🔄 **Escalabilidad**

### **Horizontal Scaling**
- **Load Balancer**: Distribución de carga
- **Multiple Servers**: Servidores web redundantes
- **Database Clustering**: Base de datos distribuida

### **Vertical Scaling**
- **Optimización de consultas**: Índices y consultas eficientes
- **Caché distribuido**: Redis para caché compartido
- **CDN**: Distribución de contenido estático

### **Microservicios (Futuro)**
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Auth Service   │  │ Document Service│  │ Search Service  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                    ┌─────────────────┐
                    │  API Gateway    │
                    └─────────────────┘
```

## 📊 **Monitoreo y Logging**

### **Logging**
```php
// Logging estructurado
Log::info('Documento subido', [
    'user_id' => $user->id,
    'documento_id' => $documento->id,
    'tamaño' => $documento->tamaño_archivo,
    'tipo' => $documento->tipo_archivo
]);
```

### **Métricas**
- **Tiempo de respuesta**: Prometheus + Grafana
- **Errores**: Sentry para tracking de errores
- **Uso de recursos**: Monitoreo de CPU, memoria, disco

### **Alertas**
- **Disponibilidad**: Alertas de downtime
- **Rendimiento**: Alertas de latencia alta
- **Errores**: Alertas de tasa de error alta

## 🚀 **Deployment**

### **Entorno de Desarrollo**
```bash
# Docker Compose para desarrollo
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - .:/var/www/html
    depends_on:
      - mysql
      - redis
  
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: intranet_inti
      MYSQL_ROOT_PASSWORD: root
  
  redis:
    image: redis:alpine
```

### **Entorno de Producción**
```bash
# Ansible para deployment
- name: Deploy Intranet Inti
  hosts: production
  tasks:
    - name: Pull latest code
      git:
        repo: "{{ repository_url }}"
        dest: "{{ app_path }}"
        version: "{{ branch }}"
    
    - name: Install dependencies
      composer:
        command: install
        working_dir: "{{ app_path }}"
    
    - name: Run migrations
      command: php artisan migrate --force
      working_dir: "{{ app_path }}"
    
    - name: Clear cache
      command: php artisan cache:clear
      working_dir: "{{ app_path }}"
```

## 🎯 **Decisiones Arquitectónicas**

### **¿Por qué Laravel + React?**
- **Laravel**: Framework PHP maduro con excelente ecosistema
- **React**: Biblioteca JavaScript popular y flexible
- **Separación de responsabilidades**: Backend API + Frontend SPA
- **Escalabilidad**: Fácil escalar frontend y backend independientemente

### **¿Por qué MySQL?**
- **Relacional**: Estructura de datos compleja con relaciones
- **ACID**: Transacciones para integridad de datos
- **Índices**: Optimización para consultas complejas
- **Madurez**: Base de datos probada y confiable

### **¿Por qué SPA?**
- **UX**: Experiencia de usuario fluida
- **Rendimiento**: Carga inicial única, navegación rápida
- **Estado**: Gestión de estado compleja en frontend
- **Offline**: Posibilidad de funcionalidad offline

Esta arquitectura proporciona una base sólida, escalable y mantenible para el sistema de gestión documental empresarial.
