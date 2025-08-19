# 📚 Documentación de la API - Intranet INTI

## 📋 Tabla de Contenidos
- [Información General](#información-general)
- [Autenticación](#autenticación)
- [Endpoints de Autenticación](#endpoints-de-autenticación)
- [Endpoints de Documentos](#endpoints-de-documentos)
- [Endpoints de Direcciones](#endpoints-de-direcciones)
- [Endpoints de Procesos de Apoyo](#endpoints-de-procesos-de-apoyo)
- [Endpoints de Usuarios](#endpoints-de-usuarios)
- [Endpoints de Estadísticas](#endpoints-de-estadísticas)
- [Códigos de Error](#códigos-de-error)
- [Ejemplos de Uso](#ejemplos-de-uso)

---

## 🌐 Información General

### Base URL
```
http://localhost:8000/api
```

### Versión
```
v1.0.0
```

### Formato de Respuesta
Todas las respuestas de la API están en formato JSON con la siguiente estructura:

```json
{
    "success": true,
    "data": {
        // Datos de la respuesta
    },
    "message": "Mensaje descriptivo",
    "performance": {
        "query_time": "0.045s",
        "memory_usage": "12.5MB"
    }
}
```

### Headers Requeridos
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}  // Para endpoints protegidos
```

---

## 🔐 Autenticación

La API utiliza **Laravel Sanctum** para autenticación basada en tokens.

### Flujo de Autenticación
1. **Login**: POST `/api/login` → Recibe token
2. **Usar Token**: Incluir en header `Authorization: Bearer {token}`
3. **Logout**: POST `/api/logout` → Invalida token

### Configuración de Sesión
- **Lifetime**: 60 minutos
- **Expire on Close**: true
- **Token Lifetime**: 4 horas

---

## 🔑 Endpoints de Autenticación

### POST /api/login
**Autentica un usuario y devuelve un token de acceso.**

#### Parámetros
```json
{
    "email": "usuario@inti.com",
    "password": "password123"
}
```

#### Respuesta Exitosa (200)
```json
{
    "success": true,
    "data": {
        "user": {
            "id": 1,
            "name": "Juan Pérez",
            "email": "usuario@inti.com",
            "role": "admin",
            "last_login_at": "2025-08-09T14:30:00.000000Z"
        },
        "token": "1|abc123def456ghi789...",
        "token_type": "Bearer"
    },
    "message": "Login exitoso"
}
```

#### Respuesta de Error (401)
```json
{
    "success": false,
    "message": "Credenciales inválidas"
}
```

### POST /api/logout
**Cierra la sesión del usuario actual.**

#### Headers
```
Authorization: Bearer {token}
```

#### Respuesta Exitosa (200)
```json
{
    "success": true,
    "message": "Logout exitoso"
}
```

### GET /api/user
**Obtiene información del usuario autenticado.**

#### Headers
```
Authorization: Bearer {token}
```

#### Respuesta Exitosa (200)
```json
{
    "success": true,
    "data": {
        "user": {
            "id": 1,
            "name": "Juan Pérez",
            "email": "usuario@inti.com",
            "role": "admin",
            "last_login_at": "2025-08-09T14:30:00.000000Z",
            "created_at": "2025-01-01T00:00:00.000000Z"
        }
    }
}
```

---

## 📄 Endpoints de Documentos

### GET /api/documentos
**Obtiene una lista paginada de documentos con filtros opcionales.**

#### Headers
```
Authorization: Bearer {token}
```

#### Parámetros de Query
| Parámetro | Tipo | Requerido | Descripción | Ejemplo |
|-----------|------|-----------|-------------|---------|
| `page` | integer | No | Número de página | `1` |
| `per_page` | integer | No | Documentos por página (máx: 100) | `10` |
| `direccion_id` | integer | No | Filtrar por dirección | `1` |
| `proceso_apoyo_id` | integer | No | Filtrar por proceso de apoyo | `2` |
| `search` | string | No | Búsqueda en título, descripción, etiquetas | `"formato"` |
| `sort_by` | string | No | Campo de ordenamiento | `"created_at"` |
| `sort_order` | string | No | Orden (asc/desc) | `"desc"` |

#### Ejemplo de Request
```
GET /api/documentos?page=1&per_page=10&direccion_id=1&sort_by=created_at&sort_order=desc
```

#### Respuesta Exitosa (200)
```json
{
    "success": true,
    "data": {
        "documentos": [
            {
                "id": 1,
                "titulo": "FORMATO PRACTICAS",
                "descripcion": "Formato para prácticas profesionales",
                "nombre_original": "formato_practicas.pdf",
                "ruta_archivo": "documentos/2025/08/formato_practicas.pdf",
                "tamaño": 2048576,
                "tipo_mime": "application/pdf",
                "etiquetas": "practicas,formato,profesional",
                "estado": "activo",
                "direccion": {
                    "id": 1,
                    "nombre": "Dirección Comercial",
                    "codigo": "DC"
                },
                "proceso_apoyo": {
                    "id": 2,
                    "nombre": "Marketing edicion",
                    "codigo": "ME"
                },
                "created_at": "2025-08-09T14:30:00.000000Z",
                "updated_at": "2025-08-09T14:30:00.000000Z"
            }
        ],
        "pagination": {
            "current_page": 1,
            "per_page": 10,
            "total": 25,
            "last_page": 3,
            "from": 1,
            "to": 10
        }
    },
    "performance": {
        "query_time": "0.045s",
        "memory_usage": "12.5MB"
    }
}
```

### POST /api/documentos
**Crea un nuevo documento.**

#### Headers
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

#### Parámetros
| Parámetro | Tipo | Requerido | Descripción | Validación |
|-----------|------|-----------|-------------|------------|
| `titulo` | string | Sí | Título del documento | min:3, max:255 |
| `descripcion` | string | No | Descripción del documento | max:1000 |
| `archivo` | file | Sí | Archivo a subir | max:8MB |
| `direccion_id` | integer | Sí | ID de la dirección | exists:direcciones,id |
| `proceso_apoyo_id` | integer | No | ID del proceso de apoyo | exists:procesos_apoyo,id |
| `etiquetas` | string | No | Etiquetas separadas por comas | max:500 |

#### Ejemplo de Request
```javascript
const formData = new FormData();
formData.append('titulo', 'Nuevo Documento');
formData.append('descripcion', 'Descripción del documento');
formData.append('archivo', fileInput.files[0]);
formData.append('direccion_id', '1');
formData.append('proceso_apoyo_id', '2');
formData.append('etiquetas', 'importante,urgente');
```

#### Respuesta Exitosa (201)
```json
{
    "success": true,
    "data": {
        "documento": {
            "id": 26,
            "titulo": "Nuevo Documento",
            "descripcion": "Descripción del documento",
            "nombre_original": "documento.pdf",
            "ruta_archivo": "documentos/2025/08/documento.pdf",
            "tamaño": 1048576,
            "tipo_mime": "application/pdf",
            "etiquetas": "importante,urgente",
            "estado": "activo",
            "direccion": {
                "id": 1,
                "nombre": "Dirección Comercial"
            },
            "proceso_apoyo": {
                "id": 2,
                "nombre": "Marketing edicion"
            },
            "created_at": "2025-08-09T15:00:00.000000Z"
        }
    },
    "message": "Documento creado exitosamente"
}
```

### GET /api/documentos/{id}
**Obtiene un documento específico por ID.**

#### Headers
```
Authorization: Bearer {token}
```

#### Respuesta Exitosa (200)
```json
{
    "success": true,
    "data": {
        "documento": {
            "id": 1,
            "titulo": "FORMATO PRACTICAS",
            "descripcion": "Formato para prácticas profesionales",
            "nombre_original": "formato_practicas.pdf",
            "ruta_archivo": "documentos/2025/08/formato_practicas.pdf",
            "tamaño": 2048576,
            "tipo_mime": "application/pdf",
            "etiquetas": "practicas,formato,profesional",
            "estado": "activo",
            "direccion": {
                "id": 1,
                "nombre": "Dirección Comercial",
                "codigo": "DC"
            },
            "proceso_apoyo": {
                "id": 2,
                "nombre": "Marketing edicion",
                "codigo": "ME"
            },
            "created_at": "2025-08-09T14:30:00.000000Z",
            "updated_at": "2025-08-09T14:30:00.000000Z"
        }
    }
}
```

### PUT /api/documentos/{id}
**Actualiza un documento existente.**

#### Headers
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

#### Parámetros
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `titulo` | string | No | Nuevo título |
| `descripcion` | string | No | Nueva descripción |
| `archivo` | file | No | Nuevo archivo |
| `direccion_id` | integer | No | Nueva dirección |
| `proceso_apoyo_id` | integer | No | Nuevo proceso de apoyo |
| `etiquetas` | string | No | Nuevas etiquetas |
| `estado` | string | No | Nuevo estado (activo/inactivo) |

#### Respuesta Exitosa (200)
```json
{
    "success": true,
    "data": {
        "documento": {
            "id": 1,
            "titulo": "FORMATO PRACTICAS ACTUALIZADO",
            "descripcion": "Formato actualizado para prácticas profesionales",
            "nombre_original": "formato_practicas_v2.pdf",
            "ruta_archivo": "documentos/2025/08/formato_practicas_v2.pdf",
            "tamaño": 2097152,
            "tipo_mime": "application/pdf",
            "etiquetas": "practicas,formato,profesional,actualizado",
            "estado": "activo",
            "direccion": {
                "id": 1,
                "nombre": "Dirección Comercial"
            },
            "proceso_apoyo": {
                "id": 2,
                "nombre": "Marketing edicion"
            },
            "updated_at": "2025-08-09T16:00:00.000000Z"
        }
    },
    "message": "Documento actualizado exitosamente"
}
```

### DELETE /api/documentos/{id}
**Elimina un documento.**

#### Headers
```
Authorization: Bearer {token}
```

#### Respuesta Exitosa (200)
```json
{
    "success": true,
    "message": "Documento eliminado exitosamente"
}
```

### GET /api/documentos/{id}/vista-previa
**Obtiene la URL de vista previa de un documento.**

#### Headers
```
Authorization: Bearer {token}
```

#### Respuesta Exitosa (200)
```json
{
    "success": true,
    "data": {
        "url": "http://localhost:8000/storage/documentos/2025/08/formato_practicas.pdf",
        "tipo_mime": "application/pdf",
        "es_vista_previa": true
    }
}
```

### GET /api/documentos/buscar
**Busca documentos por término de búsqueda.**

#### Headers
```
Authorization: Bearer {token}
```

#### Parámetros de Query
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `termino` | string | Sí | Término de búsqueda (mín: 2 caracteres) |
| `page` | integer | No | Número de página |
| `per_page` | integer | No | Documentos por página |
| `sort_by` | string | No | Campo de ordenamiento |
| `sort_order` | string | No | Orden (asc/desc) |

#### Ejemplo de Request
```
GET /api/documentos/buscar?termino=formato&page=1&per_page=10&sort_by=created_at&sort_order=desc
```

#### Respuesta Exitosa (200)
```json
{
    "success": true,
    "data": {
        "documentos": [
            {
                "id": 1,
                "titulo": "FORMATO PRACTICAS",
                "descripcion": "Formato para prácticas profesionales",
                "nombre_original": "formato_practicas.pdf",
                "ruta_archivo": "documentos/2025/08/formato_practicas.pdf",
                "tamaño": 2048576,
                "tipo_mime": "application/pdf",
                "etiquetas": "practicas,formato,profesional",
                "estado": "activo",
                "direccion": {
                    "id": 1,
                    "nombre": "Dirección Comercial"
                },
                "proceso_apoyo": {
                    "id": 2,
                    "nombre": "Marketing edicion"
                },
                "created_at": "2025-08-09T14:30:00.000000Z"
            }
        ],
        "pagination": {
            "current_page": 1,
            "per_page": 10,
            "total": 5,
            "last_page": 1
        }
    },
    "performance": {
        "query_time": "0.023s",
        "memory_usage": "8.2MB"
    }
}
```

---

## 🏢 Endpoints de Direcciones

### GET /api/direcciones
**Obtiene todas las direcciones.**

#### Headers
```
Authorization: Bearer {token}
```

#### Respuesta Exitosa (200)
```json
{
    "success": true,
    "data": {
        "direcciones": [
            {
                "id": 1,
                "nombre": "Dirección Comercial",
                "codigo": "DC",
                "descripcion": "Dirección encargada de las actividades comerciales",
                "estado": "activo",
                "created_at": "2025-01-01T00:00:00.000000Z"
            },
            {
                "id": 2,
                "nombre": "Dirección de Ingeniería",
                "codigo": "DI",
                "descripcion": "Dirección encargada de las actividades de ingeniería",
                "estado": "activo",
                "created_at": "2025-01-01T00:00:00.000000Z"
            }
        ]
    }
}
```

### GET /api/direcciones/{id}
**Obtiene una dirección específica por ID.**

#### Headers
```
Authorization: Bearer {token}
```

#### Respuesta Exitosa (200)
```json
{
    "success": true,
    "data": {
        "direccion": {
            "id": 1,
            "nombre": "Dirección Comercial",
            "codigo": "DC",
            "descripcion": "Dirección encargada de las actividades comerciales",
            "estado": "activo",
            "procesos_apoyo": [
                {
                    "id": 1,
                    "nombre": "Ventas",
                    "codigo": "VEN"
                },
                {
                    "id": 2,
                    "nombre": "Marketing edicion",
                    "codigo": "ME"
                }
            ],
            "created_at": "2025-01-01T00:00:00.000000Z"
        }
    }
}
```

---

## 🔧 Endpoints de Procesos de Apoyo

### GET /api/procesos-apoyo
**Obtiene todos los procesos de apoyo.**

#### Headers
```
Authorization: Bearer {token}
```

#### Parámetros de Query
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `direccion_id` | integer | No | Filtrar por dirección |

#### Respuesta Exitosa (200)
```json
{
    "success": true,
    "data": {
        "procesos_apoyo": [
            {
                "id": 1,
                "nombre": "Ventas",
                "codigo": "VEN",
                "descripcion": "Proceso de ventas",
                "direccion": {
                    "id": 1,
                    "nombre": "Dirección Comercial"
                },
                "estado": "activo",
                "created_at": "2025-01-01T00:00:00.000000Z"
            },
            {
                "id": 2,
                "nombre": "Marketing edicion",
                "codigo": "ME",
                "descripcion": "Proceso de marketing y edición",
                "direccion": {
                    "id": 1,
                    "nombre": "Dirección Comercial"
                },
                "estado": "activo",
                "created_at": "2025-01-01T00:00:00.000000Z"
            }
        ]
    }
}
```

### GET /api/procesos-apoyo/{id}
**Obtiene un proceso de apoyo específico por ID.**

#### Headers
```
Authorization: Bearer {token}
```

#### Respuesta Exitosa (200)
```json
{
    "success": true,
    "data": {
        "proceso_apoyo": {
            "id": 1,
            "nombre": "Ventas",
            "codigo": "VEN",
            "descripcion": "Proceso de ventas",
            "direccion": {
                "id": 1,
                "nombre": "Dirección Comercial",
                "codigo": "DC"
            },
            "estado": "activo",
            "documentos_count": 15,
            "created_at": "2025-01-01T00:00:00.000000Z"
        }
    }
}
```

---

## 👥 Endpoints de Usuarios

### GET /api/usuarios
**Obtiene todos los usuarios (solo administradores).**

#### Headers
```
Authorization: Bearer {token}
```

#### Respuesta Exitosa (200)
```json
{
    "success": true,
    "data": {
        "usuarios": [
            {
                "id": 1,
                "name": "Juan Pérez",
                "email": "juan@inti.com",
                "role": "admin",
                "last_login_at": "2025-08-09T14:30:00.000000Z",
                "created_at": "2025-01-01T00:00:00.000000Z"
            },
            {
                "id": 2,
                "name": "María García",
                "email": "maria@inti.com",
                "role": "user",
                "last_login_at": "2025-08-09T13:45:00.000000Z",
                "created_at": "2025-01-01T00:00:00.000000Z"
            }
        ]
    }
}
```

### POST /api/usuarios
**Crea un nuevo usuario (solo administradores).**

#### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

#### Parámetros
```json
{
    "name": "Nuevo Usuario",
    "email": "nuevo@inti.com",
    "password": "password123",
    "role": "user"
}
```

#### Respuesta Exitosa (201)
```json
{
    "success": true,
    "data": {
        "usuario": {
            "id": 3,
            "name": "Nuevo Usuario",
            "email": "nuevo@inti.com",
            "role": "user",
            "created_at": "2025-08-09T16:30:00.000000Z"
        }
    },
    "message": "Usuario creado exitosamente"
}
```

---

## 📊 Endpoints de Estadísticas

### GET /api/estadisticas
**Obtiene estadísticas generales del sistema.**

#### Headers
```
Authorization: Bearer {token}
```

#### Respuesta Exitosa (200)
```json
{
    "success": true,
    "data": {
        "total_documentos": 25,
        "documentos_por_direccion": [
            {
                "direccion": "Dirección Comercial",
                "total": 15,
                "porcentaje": 60
            },
            {
                "direccion": "Dirección de Ingeniería",
                "total": 10,
                "porcentaje": 40
            }
        ],
        "documentos_por_tipo": [
            {
                "tipo": "application/pdf",
                "total": 20,
                "porcentaje": 80
            },
            {
                "tipo": "application/msword",
                "total": 5,
                "porcentaje": 20
            }
        ],
        "documentos_recientes": [
            {
                "id": 25,
                "titulo": "Documento Reciente",
                "created_at": "2025-08-09T15:00:00.000000Z"
            }
        ],
        "espacio_utilizado": {
            "total_bytes": 52428800,
            "total_mb": 50,
            "formato": "50 MB"
        }
    }
}
```

---

## 🚨 Códigos de Error

### Errores HTTP Comunes

| Código | Descripción | Ejemplo |
|--------|-------------|---------|
| `400` | Bad Request - Parámetros inválidos | `{"success": false, "message": "Parámetros inválidos"}` |
| `401` | Unauthorized - Token inválido o expirado | `{"success": false, "message": "No autorizado"}` |
| `403` | Forbidden - Sin permisos | `{"success": false, "message": "Acceso denegado"}` |
| `404` | Not Found - Recurso no encontrado | `{"success": false, "message": "Documento no encontrado"}` |
| `413` | Payload Too Large - Archivo muy grande | `{"success": false, "message": "El archivo excede el tamaño máximo"}` |
| `422` | Unprocessable Entity - Validación fallida | `{"success": false, "errors": {"titulo": ["El título es requerido"]}}` |
| `500` | Internal Server Error - Error del servidor | `{"success": false, "message": "Error interno del servidor"}` |

### Errores de Validación (422)
```json
{
    "success": false,
    "message": "Los datos proporcionados no son válidos",
    "errors": {
        "titulo": [
            "El título es requerido",
            "El título debe tener al menos 3 caracteres"
        ],
        "archivo": [
            "El archivo es requerido",
            "El archivo debe ser menor a 8MB"
        ],
        "direccion_id": [
            "La dirección seleccionada no es válida"
        ]
    }
}
```

---

## 💡 Ejemplos de Uso

### JavaScript/React

#### Autenticación
```javascript
// Login
const login = async (email, password) => {
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.success) {
        localStorage.setItem('token', data.data.token);
        return data.data.user;
    }
    throw new Error(data.message);
};

// Usar token en requests
const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    return fetch(url, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            ...options.headers
        }
    });
};
```

#### Obtener Documentos
```javascript
// Obtener documentos con filtros
const getDocumentos = async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetchWithAuth(`/api/documentos?${params}`);
    const data = await response.json();
    
    if (data.success) {
        return data.data;
    }
    throw new Error(data.message);
};

// Uso
const documentos = await getDocumentos({
    page: 1,
    per_page: 10,
    direccion_id: 1,
    sort_by: 'created_at',
    sort_order: 'desc'
});
```

#### Subir Documento
```javascript
// Subir documento
const uploadDocumento = async (formData) => {
    const response = await fetch('/api/documentos', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
        },
        body: formData
    });
    
    const data = await response.json();
    if (data.success) {
        return data.data.documento;
    }
    throw new Error(data.message);
};

// Uso
const formData = new FormData();
formData.append('titulo', 'Mi Documento');
formData.append('descripcion', 'Descripción del documento');
formData.append('archivo', fileInput.files[0]);
formData.append('direccion_id', '1');
formData.append('proceso_apoyo_id', '2');

const nuevoDocumento = await uploadDocumento(formData);
```

#### Búsqueda
```javascript
// Buscar documentos
const buscarDocumentos = async (termino) => {
    const response = await fetchWithAuth(`/api/documentos/buscar?termino=${encodeURIComponent(termino)}`);
    const data = await response.json();
    
    if (data.success) {
        return data.data;
    }
    throw new Error(data.message);
};

// Uso
const resultados = await buscarDocumentos('formato practicas');
```

### cURL

#### Login
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "usuario@inti.com",
    "password": "password123"
  }'
```

#### Obtener Documentos
```bash
curl -X GET "http://localhost:8000/api/documentos?page=1&per_page=10&direccion_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

#### Subir Documento
```bash
curl -X POST http://localhost:8000/api/documentos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json" \
  -F "titulo=Nuevo Documento" \
  -F "descripcion=Descripción del documento" \
  -F "archivo=@/path/to/file.pdf" \
  -F "direccion_id=1" \
  -F "proceso_apoyo_id=2"
```

#### Buscar Documentos
```bash
curl -X GET "http://localhost:8000/api/documentos/buscar?termino=formato" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

---

## 🔧 Endpoints de Debug (Solo Desarrollo)

### GET /api/debug/documentos
**Endpoint temporal para debug de filtros (solo en desarrollo).**

#### Parámetros de Query
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `direccion_id` | integer | No | Filtrar por dirección |
| `proceso_apoyo_id` | integer | No | Filtrar por proceso de apoyo |

#### Respuesta
```json
{
    "success": true,
    "data": {
        "documentos": [...],
        "count": 5,
        "params": {
            "direccion_id": "1",
            "proceso_apoyo_id": "2"
        }
    }
}
```

---

## 📝 Notas Importantes

### Límites de Archivos
- **Tamaño máximo**: 8MB por archivo
- **Tipos permitidos**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT
- **Ubicación**: `storage/app/public/documentos/{year}/{month}/`

### Paginación
- **Por defecto**: 10 documentos por página
- **Máximo**: 100 documentos por página
- **Parámetros**: `page`, `per_page`

### Búsqueda
- **Mínimo**: 2 caracteres
- **Campos**: título, descripción, nombre_original, etiquetas
- **Optimizada**: Índices de base de datos para mejor rendimiento

### Seguridad
- **Autenticación**: Token Bearer requerido para endpoints protegidos
- **Validación**: Todos los inputs son validados en el servidor
- **Sanitización**: Los archivos son escaneados y validados
- **Acceso**: Control de permisos por rol de usuario

### Rendimiento
- **Caché**: Estadísticas cacheadas por 5 minutos
- **Índices**: Base de datos optimizada con índices compuestos
- **Eager Loading**: Relaciones cargadas eficientemente
- **Métricas**: Tiempo de consulta y uso de memoria incluidos

---

## 📞 Soporte

Para soporte técnico o reportar problemas:

- **Email**: soporte@inti.com
- **Documentación**: `/docs/`
- **Logs**: `storage/logs/laravel.log`
Nota: Los comandos artisan internos de verificación fueron removidos. Utiliza las rutas de la API y logs para diagnóstico.

---

*Última actualización: 9 de Agosto, 2025*
*Versión de la API: 1.0.0*
