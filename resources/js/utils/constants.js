/**
 * Constantes de la aplicación
 */
 /**
 * Configuración de la aplicación
 */
 export const APP_CONFIG = {
 NAME: 'Intranet INTI',
 VERSION: '1.0.0',
 API_BASE_URL: '/api',
 UPLOAD_MAX_SIZE: 8 * 1024 * 1024, // 8MB
 SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
 PAGINATION_DEFAULT: 15,
 SEARCH_MIN_LENGTH: 2
 };
 /**
 * Tipos de archivos permitidos
 */
 export const ALLOWED_FILE_TYPES = {
 DOCUMENTS: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
 SPREADSHEETS: ['xls', 'xlsx', 'csv', 'ods'],
 PRESENTATIONS: ['ppt', 'pptx', 'odp'],
 IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'],
 ARCHIVES: ['zip', 'rar', '7z', 'tar', 'gz'],
 VIDEOS: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'],
 AUDIO: ['mp3', 'wav', 'aac', 'ogg', 'flac']
 };
 /**
 * Estados de documentos
 */
 export const DOCUMENT_STATUS = {
 DRAFT: 'draft',
 PUBLISHED: 'published',
 ARCHIVED: 'archived',
 DELETED: 'deleted'
 };
 /**
 * Niveles de confidencialidad
 */
 export const CONFIDENTIALITY_LEVELS = {
 PUBLIC: 'Publico',
 INTERNAL: 'Interno',
 CONFIDENTIAL: 'Confidencial',
 RESTRICTED: 'Restringido'
 };
 /**
 * Roles de usuario
 */
 export const USER_ROLES = {
 ADMIN: 'admin',
 USER: 'user',
 MANAGER: 'manager',
 VIEWER: 'viewer'
 };
 /**
 * Permisos de usuario
 */
 export const USER_PERMISSIONS = {
 // Documentos
 DOCUMENTS_VIEW: 'documents.view',
 DOCUMENTS_CREATE: 'documents.create',
 DOCUMENTS_EDIT: 'documents.edit',
 DOCUMENTS_DELETE: 'documents.delete',
 DOCUMENTS_DOWNLOAD: 'documents.download',
 // Procesos
 PROCESSES_VIEW: 'processes.view',
 PROCESSES_CREATE: 'processes.create',
 PROCESSES_EDIT: 'processes.edit',
 PROCESSES_DELETE: 'processes.delete',
 // Usuarios
 USERS_VIEW: 'users.view',
 USERS_CREATE: 'users.create',
 USERS_EDIT: 'users.edit',
 USERS_DELETE: 'users.delete',
 // Administración
 ADMIN_ACCESS: 'admin.access',
 SYSTEM_CONFIG: 'system.config',
 REPORTS_VIEW: 'reports.view'
 };
 /**
 * Tipos de procesos
 */
 export const PROCESS_TYPES = {
 STRATEGIC: 'estrategico',
 MISSIONAL: 'misional',
 SUPPORT: 'apoyo',
 EVALUATION: 'evaluacion'
 };
 /**
 * Categorías de procesos internos
 */
 export const INTERNAL_PROCESS_CATEGORIES = {
 FORMATS: 'Formatos',
 PROCEDURES: 'Procedimientos',
 INSTRUCTIONS: 'Instructivos',
 MANUALS: 'Manuales'
 };
 /**
 * Estados de carga
 */
 export const LOADING_STATES = {
 IDLE: 'idle',
 LOADING: 'loading',
 SUCCESS: 'success',
 ERROR: 'error'
 };
 /**
 * Tipos de notificaciones
 */
 export const NOTIFICATION_TYPES = {
 SUCCESS: 'success',
 ERROR: 'error',
 WARNING: 'warning',
 INFO: 'info'
 };
 /**
 * Rutas de la aplicación
 */
 export const ROUTES = {
 HOME: '/',
 LOGIN: '/login',
 DASHBOARD: '/dashboard',
 DOCUMENTS: '/documentos',
 PROCESSES: '/procesos',
 USERS: '/usuarios',
 ADMIN: '/admin',
 PROFILE: '/perfil',
 SETTINGS: '/configuracion'
 };
 /**
 * Endpoints de la API
 */
 export const API_ENDPOINTS = {
 // Autenticación
 AUTH: {
 LOGIN: '/login',
 LOGOUT: '/auth/logout',
 USER: '/auth/user',
 VERIFY: '/auth/verify',
 REFRESH: '/auth/refresh'
 },
 // Documentos
 DOCUMENTS: {
 BASE: '/documents',
 SEARCH: '/documents/search',
 RECENT: '/documents/recent',
 STATS: '/documents/stats',
 DOWNLOAD: (id) => `/documents/${id}/download`
 },
 // Procesos
 PROCESSES: {
 TYPES: '/processes/types',
 GENERALS: '/processes/generals',
 INTERNALS: '/processes/internals',
 HIERARCHY: '/processes/hierarchy'
 },
 // Usuarios
 USERS: {
 BASE: '/users',
 PROFILE: '/users/profile',
 ADMINS: '/users/admins'
 },
 // Noticias
 NEWS: {
 BASE: '/news',
 LATEST: '/news/latest'
 }
 };
 /**
 * Configuración de paginación
 */
 export const PAGINATION_CONFIG = {
 DEFAULT_PAGE_SIZE: 15,
 PAGE_SIZE_OPTIONS: [10, 15, 25, 50, 100],
 MAX_PAGE_SIZE: 100
 };
 /**
 * Configuración de búsqueda
 */
 export const SEARCH_CONFIG = {
 MIN_LENGTH: 2,
 DEBOUNCE_DELAY: 300,
 MAX_SUGGESTIONS: 10
 };
 /**
 * Configuración de archivos
 */
 export const FILE_CONFIG = {
 MAX_SIZE: 8 * 1024 * 1024, // 8MB
 ALLOWED_EXTENSIONS: [
 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
 'jpg', 'jpeg', 'png', 'gif', 'txt', 'zip', 'rar'
 ],
 UPLOAD_PATH: '/storage/app/public/documentos'
 };
 /**
 * Configuración de cache
 */
 export const CACHE_CONFIG = {
 DEFAULT_TTL: 3600, // 1 hora
 SHORT_TTL: 300, // 5 minutos
 LONG_TTL: 86400, // 24 horas
 PREFIX: 'inti_'
 };
 /**
 * Configuración de sesión
 */
 export const SESSION_CONFIG = {
 TIMEOUT: 30 * 60 * 1000, // 30 minutos
 WARNING_TIME: 5 * 60 * 1000, // 5 minutos antes
 REFRESH_INTERVAL: 5 * 60 * 1000 // 5 minutos
 };
 /**
 * Configuración de notificaciones
 */
 export const NOTIFICATION_CONFIG = {
 AUTO_HIDE_DELAY: 5000, // 5 segundos
 MAX_NOTIFICATIONS: 5,
 POSITION: 'top-right'
 };
 /**
 * Configuración de temas
 */
 export const THEME_CONFIG = {
 COLORS: {
 PRIMARY: '#3B82F6',
 SECONDARY: '#6B7280',
 SUCCESS: '#10B981',
 WARNING: '#F59E0B',
 ERROR: '#EF4444',
 INFO: '#06B6D4'
 },
 BREAKPOINTS: {
 SM: 640,
 MD: 768,
 LG: 1024,
 XL: 1280,
 '2XL': 1536
 }
 };
 /**
 * Configuración de validación
 */
 export const VALIDATION_CONFIG = {
 PASSWORD: {
 MIN_LENGTH: 8,
 REQUIRE_UPPERCASE: true,
 REQUIRE_LOWERCASE: true,
 REQUIRE_NUMBERS: true,
 REQUIRE_SPECIAL: false
 },
 USERNAME: {
 MIN_LENGTH: 3,
 MAX_LENGTH: 50,
 ALLOWED_CHARS: /^[a-zA-Z0-9_-]+$/
 },
 EMAIL: {
 MAX_LENGTH: 255
 }
 };
 /**
 * Mensajes de error comunes
 */
 export const ERROR_MESSAGES = {
 NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet.',
 UNAUTHORIZED: 'No tiene permisos para realizar esta acción.',
 FORBIDDEN: 'Acceso denegado.',
 NOT_FOUND: 'Recurso no encontrado.',
 VALIDATION_ERROR: 'Los datos proporcionados no son válidos.',
 SERVER_ERROR: 'Error interno del servidor.',
 TIMEOUT_ERROR: 'La operación ha tardado demasiado.',
 FILE_TOO_LARGE: 'El archivo es demasiado grande.',
 INVALID_FILE_TYPE: 'Tipo de archivo no permitido.',
 REQUIRED_FIELD: 'Este campo es obligatorio.',
 INVALID_EMAIL: 'Email inválido.',
 WEAK_PASSWORD: 'La contraseña es demasiado débil.'
 };
 /**
 * Mensajes de éxito comunes
 */
 export const SUCCESS_MESSAGES = {
 DOCUMENT_CREATED: 'Documento creado exitosamente.',
 DOCUMENT_UPDATED: 'Documento actualizado exitosamente.',
 DOCUMENT_DELETED: 'Documento eliminado exitosamente.',
 USER_CREATED: 'Usuario creado exitosamente.',
 USER_UPDATED: 'Usuario actualizado exitosamente.',
 USER_DELETED: 'Usuario eliminado exitosamente.',
 LOGIN_SUCCESS: 'Inicio de sesión exitoso.',
 LOGOUT_SUCCESS: 'Sesión cerrada exitosamente.',
 PASSWORD_CHANGED: 'Contraseña cambiada exitosamente.',
 PROFILE_UPDATED: 'Perfil actualizado exitosamente.'
 };