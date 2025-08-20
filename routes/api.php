<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\RoleController;
use App\Http\Controllers\Api\Processes\ProcesoTipoController;
use App\Http\Controllers\Api\Processes\ProcesoGeneralController;
use App\Http\Controllers\Api\Processes\ProcesoInternoController;
use App\Http\Controllers\Api\Users\UserController;
use App\Http\Controllers\Api\Users\AdminController;
use App\Http\Controllers\Api\News\NoticiaController;
use App\Http\Controllers\Api\Documents\DocumentController;
use App\Http\Controllers\Api\DocumentoController;
use App\Http\Controllers\Api\DashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Version 1 (Unified English Routes)
|--------------------------------------------------------------------------
|
| API versionada con rutas unificadas en inglés
| Mantiene compatibilidad con rutas legacy
|
*/

// ========================================
// RUTAS PÚBLICAS (Sin autenticación)
// ========================================
Route::prefix('v1')->group(function () {
    // Autenticación pública
    Route::post('/auth/login', [AuthController::class, 'login']);
    
    // Noticias públicas
    Route::get('/news/latest', [NoticiaController::class, 'latest']);
});

// ========================================
// RUTAS PROTEGIDAS V1 (Nuevas rutas en inglés)
// ========================================
Route::prefix('v1')->middleware(['api.auth', \App\Http\Middleware\CheckUserActivity::class])->group(function () {
    
    // ========================================
    // DOMINIO: AUTENTICACIÓN
    // ========================================
    Route::prefix('auth')->group(function () {
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/verify', [AuthController::class, 'verify']);
    });

    // ========================================
    // DOMINIO: DOCUMENTOS (Nuevas rutas en inglés)
    // ========================================
    Route::prefix('documents')->middleware([\App\Http\Middleware\HandleLargeUploads::class])->group(function () {
        // CRUD principal
        Route::apiResource('/', DocumentController::class)->parameters(['' => 'document']);
        
        // Operaciones específicas
        Route::post('/{id}/download', [DocumentController::class, 'download']);
        Route::get('/{id}/preview', [DocumentController::class, 'preview']);
        
        // Búsqueda y filtros
        Route::get('/search', [DocumentController::class, 'search']);
        Route::get('/recent', [DocumentController::class, 'recent']);
        
        // Estadísticas
        Route::get('/stats', [DocumentController::class, 'stats']);
        Route::get('/stats/extensions', [DocumentController::class, 'extensionStats']);
        Route::get('/extensions/available', [DocumentController::class, 'availableExtensions']);
        Route::get('/tags', [DocumentController::class, 'tags']);
        Route::get('/types', [DocumentController::class, 'types']);
        
        // Sugerencias de etiquetas
        Route::get('/tags/suggestions', function (Request $request) {
            $q = trim($request->get('q', ''));
            $limit = min((int) $request->get('limit', 10), 50);
            $tags = \App\Models\Documento::query()
                ->whereNotNull('etiquetas')
                ->select('etiquetas')
                ->limit(500)
                ->get()
                ->flatMap(function ($doc) { return collect($doc->etiquetas ?? []); })
                ->filter()
                ->map(fn($t) => (string) $t)
                ->unique()
                ->values();
            if ($q !== '') {
                $tags = $tags->filter(fn($t) => stripos($t, $q) !== false)->values();
            }
            return response()->json(['success' => true, 'data' => $tags->take($limit)]);
        });
    });

    // ========================================
    // DOMINIO: PROCESOS (Nuevas rutas en inglés)
    // ========================================
    Route::prefix('processes')->group(function () {
        // Tipos de procesos
        Route::apiResource('types', ProcesoTipoController::class);
        Route::get('/types/{typeId}/generals', [ProcesoTipoController::class, 'procesosGenerales']);
        Route::get('/types/stats', [ProcesoTipoController::class, 'stats']);
        Route::get('/types/config', [ProcesoTipoController::class, 'config']);
        Route::get('/types/{type}/config', [ProcesoTipoController::class, 'typeConfig']);
        
        // Procesos generales
        Route::apiResource('generals', ProcesoGeneralController::class);
        Route::get('/generals/{id}/documents', [ProcesoGeneralController::class, 'documentos']);
        Route::get('/generals/types/available', [ProcesoGeneralController::class, 'tiposDisponibles']);
        
        // Procesos internos
        Route::apiResource('internals', ProcesoInternoController::class);
        Route::get('/generals/{processGeneralId}/internals', [ProcesoInternoController::class, 'porProcesoGeneral']);
    });

    // ========================================
    // DOMINIO: USUARIOS (Nuevas rutas en inglés)
    // ========================================
    Route::prefix('users')->group(function () {
        // CRUD principal
        Route::apiResource('/', UserController::class);
        
        // Operaciones específicas
        Route::get('/stats', [UserController::class, 'stats']);
        Route::patch('/{id}/toggle-status', [UserController::class, 'toggleStatus']);
        
        // Roles
        Route::apiResource('roles', RoleController::class);
    });

    // ========================================
    // DOMINIO: NOTICIAS (Nuevas rutas en inglés)
    // ========================================
    Route::prefix('news')->middleware(\App\Http\Middleware\HandleLargeUploads::class)->group(function () {
        Route::apiResource('/', NoticiaController::class)->parameters(['' => 'news']);
        Route::get('/latest', [NoticiaController::class, 'latest']);
    });

    // ========================================
    // DOMINIO: ADMINISTRACIÓN (Nuevas rutas en inglés)
    // ========================================
    Route::prefix('admin')->group(function () {
        Route::apiResource('users', AdminController::class);
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/activity/recent', [AdminController::class, 'recentActivity']);
        Route::get('/reports/system', [AdminController::class, 'systemReport']);
    });

    // ========================================
    // DOMINIO: DASHBOARD (Nuevas rutas en inglés)
    // ========================================
    Route::prefix('dashboard')->group(function () {
        Route::get('/stats', [DashboardController::class, 'estadisticas']);
        Route::get('/recent-documents', [DashboardController::class, 'recentDocuments']);
        Route::get('/quick-actions', [DashboardController::class, 'accionesRapidas']);
    });
});

// ========================================
// RUTAS LEGACY (Compatibilidad temporal)
// ========================================
Route::prefix('v1')->middleware(['api.auth', \App\Http\Middleware\CheckUserActivity::class])->group(function () {
    
    // Legacy: Documentos
    Route::get('/documentos/buscar', [DocumentoController::class, 'buscar']);
    Route::get('/documentos/recientes', [DocumentoController::class, 'recientes']);
    Route::get('/documentos/estadisticas', [DocumentoController::class, 'estadisticas']);
    Route::get('/documentos/estadisticas-extensiones', [DocumentoController::class, 'estadisticasExtensiones']);
    Route::get('/documentos/extensiones-disponibles', [DocumentoController::class, 'extensionesDisponibles']);
    Route::get('/documentos/etiquetas', [DocumentoController::class, 'etiquetas']);
    Route::get('/documentos/tipos', [DocumentoController::class, 'tipos']);
    Route::middleware(\App\Http\Middleware\HandleLargeUploads::class)->group(function () {
        Route::apiResource('documentos', DocumentoController::class);
        Route::post('/documentos/{id}/descargar', [DocumentoController::class, 'descargar']);
        Route::get('/documentos/{id}/vista-previa', [DocumentoController::class, 'vistaPrevia']);
    });

    // Legacy: Procesos
    Route::apiResource('procesos-generales', ProcesoGeneralController::class);
    Route::get('/procesos-generales/{id}/documentos', [ProcesoGeneralController::class, 'documentos']);
    Route::get('/procesos-generales/tipos/disponibles', [ProcesoGeneralController::class, 'tiposDisponibles']);
    Route::apiResource('tipos-procesos', ProcesoTipoController::class);
    Route::get('/tipos-procesos/{tipoId}/procesos-generales', [ProcesoTipoController::class, 'procesosGenerales']);
    Route::apiResource('procesos-internos', ProcesoInternoController::class);
    Route::get('/procesos-generales/{procesoGeneralId}/procesos-internos', [ProcesoInternoController::class, 'porProcesoGeneral']);
    Route::get('/procesos', [ProcesoGeneralController::class, 'index']);
    Route::post('/procesos-internos', [ProcesoInternoController::class, 'store']);

    // Legacy: Usuarios
    Route::patch('/usuarios/{id}/toggle-status', [UserController::class, 'toggleStatus']);
    Route::get('/usuarios/stats', [UserController::class, 'stats']);    Route::apiResource('users', UserController::class);
    Route::apiResource('usuarios', UserController::class);    Route::apiResource('admins', AdminController::class);
    Route::apiResource('roles', RoleController::class);
    // Legacy: Noticias
    Route::middleware(\App\Http\Middleware\HandleLargeUploads::class)->group(function () {
        Route::get('/noticias/latest', [NoticiaController::class, 'latest']);
        Route::apiResource('noticias', NoticiaController::class);
        Route::patch('/noticias/{id}/toggle', [NoticiaController::class, 'toggle']);
        Route::get('/admin/noticias', [NoticiaController::class, 'indexAdmin']);
    });

    // Legacy: Dashboard
    Route::get('/dashboard/acciones-rapidas', [DashboardController::class, 'accionesRapidas']);
});

// ========================================
// RUTAS SIN VERSIONADO (Compatibilidad temporal)
// ========================================
Route::middleware(['api.auth', \App\Http\Middleware\CheckUserActivity::class])->group(function () {
    // Mantener compatibilidad con rutas sin versionado temporalmente
    Route::get('/dashboard/stats', [DashboardController::class, 'estadisticas']);
    Route::get('/dashboard/recent-documents', [DashboardController::class, 'recentDocuments']);
    Route::get('/dashboard/quick-actions', [DashboardController::class, 'accionesRapidas']);
    Route::get('/dashboard/acciones-rapidas', [DashboardController::class, 'accionesRapidas']);
    
    Route::get('/procesos/tipos/stats', function () {
        return response()->json(['success' => true, 'data' => []]);
    });
    Route::get('/procesos/tipos/config', function () {
        return response()->json(['success' => true, 'data' => []]);
    });
    Route::get('/procesos/tipos/{tipo}/config', function ($tipo) {
        return response()->json(['success' => true, 'data' => []]);
    });
    
    // Rutas adicionales para compatibilidad
    Route::get('/v1/procesos/tipos/stats', function () {
        return response()->json(['success' => true, 'data' => []]);
    });
    Route::get('/v1/procesos/tipos/config', function () {
        return response()->json(['success' => true, 'data' => []]);
    });
});

 