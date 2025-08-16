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
use App\Http\Controllers\Api\CategoriaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rutas públicas de autenticación
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas
Route::middleware(['api.auth', \App\Http\Middleware\CheckUserActivity::class])->group(function () {
    // ========================================
    // RUTAS DE AUTENTICACIÓN
    // ========================================
    Route::prefix('auth')->group(function () {
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/verify', [AuthController::class, 'verify']);
    });

    // ========================================
    // RUTAS DE PROCESOS (Nueva estructura)
    // ========================================
    Route::prefix('processes')->group(function () {
        // Tipos de procesos
        Route::apiResource('types', ProcesoTipoController::class);
        Route::get('/types/{tipoId}/generals', [ProcesoTipoController::class, 'procesosGenerales']);
        
        // Procesos generales
        Route::apiResource('generals', ProcesoGeneralController::class);
        Route::get('/generals/{id}/documents', [ProcesoGeneralController::class, 'documentos']);
        Route::get('/generals/types/available', [ProcesoGeneralController::class, 'tiposDisponibles']);
        
        // Procesos internos
        Route::apiResource('internals', ProcesoInternoController::class);
        Route::get('/generals/{procesoGeneralId}/internals', [ProcesoInternoController::class, 'porProcesoGeneral']);
    });

    // ========================================
    // RUTAS DE DOCUMENTOS (Nueva estructura)
    // ========================================
    Route::prefix('documents')->group(function () {
        Route::middleware(\App\Http\Middleware\HandleLargeUploads::class)->group(function () {
            Route::apiResource('/', DocumentController::class);
            Route::post('/{id}/download', [DocumentController::class, 'descargar'])->name('documents.download');
        });
    });

    // ========================================
    // RUTAS DE USUARIOS (Nueva estructura)
    // ========================================
    Route::prefix('users')->group(function () {
        Route::apiResource('/', UserController::class);
        Route::apiResource('admins', AdminController::class);
    });

    // ========================================
    // RUTAS DE NOTICIAS (Nueva estructura)
    // ========================================
    Route::prefix('news')->group(function () {
        Route::apiResource('/', NoticiaController::class);
    });

    // ========================================
    // RUTAS LEGACY (Compatibilidad)
    // ========================================
    
    // Rutas legacy de procesos
    Route::apiResource('procesos-generales', ProcesoGeneralController::class);
    Route::get('/procesos-generales/{id}/documentos', [ProcesoGeneralController::class, 'documentos']);
    Route::get('/procesos-generales/tipos/disponibles', [ProcesoGeneralController::class, 'tiposDisponibles']);
    Route::apiResource('tipos-procesos', ProcesoTipoController::class);
    Route::get('/tipos-procesos/{tipoId}/procesos-generales', [ProcesoTipoController::class, 'procesosGenerales']);
    Route::apiResource('procesos-internos', ProcesoInternoController::class);
    Route::get('/procesos-generales/{procesoGeneralId}/procesos-internos', 
        [ProcesoInternoController::class, 'porProcesoGeneral']);
    Route::get('/procesos', [ProcesoGeneralController::class, 'index']);
    Route::post('/procesos-internos', [ProcesoInternoController::class, 'store']);

    // Rutas legacy de documentos
    Route::get('/documentos/buscar', [DocumentoController::class, 'buscar']);
    Route::get('/documentos/recientes', [DocumentoController::class, 'recientes']);
    Route::get('/documentos/estadisticas', [DocumentoController::class, 'estadisticas']);
    Route::get('/documentos/estadisticas-extensiones', [DocumentoController::class, 'estadisticasExtensiones']);
    Route::get('/documentos/extensiones-disponibles', [DocumentoController::class, 'extensionesDisponibles']);
    Route::get('/documentos/etiquetas', [DocumentoController::class, 'etiquetas']);
    Route::get('/documentos/tipos', [DocumentoController::class, 'tipos']);
    
    // Sugerencias de etiquetas
    Route::get('/documentos/etiquetas/sugerencias', function (Request $request) {
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
    
    // Rutas legacy de documentos (apiResource)
    Route::middleware(\App\Http\Middleware\HandleLargeUploads::class)->group(function () {
        Route::apiResource('documentos', DocumentoController::class);
        Route::post('/documentos/{id}/descargar', 
            [DocumentoController::class, 'descargar'])->name('documentos.descargar');
    });

    // Rutas legacy de usuarios
    Route::apiResource('users', UserController::class);
    Route::apiResource('roles', RoleController::class);
    Route::apiResource('admins', AdminController::class);

    // Rutas legacy de noticias
    Route::apiResource('noticias', NoticiaController::class);

    // ========================================
    // RUTAS DE DASHBOARD
    // ========================================
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/recent-documents', [DashboardController::class, 'recentDocuments']);
    Route::get('/dashboard/quick-actions', [DashboardController::class, 'quickActions']);

    // ========================================
    // RUTAS DE CONFIGURACIÓN
    // ========================================
    Route::get('/procesos/tipos/stats', function () {
        return response()->json(['success' => true, 'data' => []]);
    });
    Route::get('/procesos/tipos/config', function () {
        return response()->json(['success' => true, 'data' => []]);
    });
    Route::get('/procesos/tipos/{tipo}/config', function ($tipo) {
        return response()->json(['success' => true, 'data' => []]);
    });
}); 