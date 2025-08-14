<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DireccionController;
use App\Http\Controllers\Api\ProcesoApoyoController;
use App\Http\Controllers\Api\ProcesoController;
use App\Http\Controllers\Api\DocumentoController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\NoticiaController;
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
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/verify', [AuthController::class, 'verify']);

    // Rutas de Direcciones
    Route::apiResource('direcciones', DireccionController::class);
    Route::get('/direcciones/{id}/documentos', [DireccionController::class, 'documentos']);

    // Rutas de Procesos de Apoyo (RUTAS ESPECÍFICAS ANTES DEL apiResource)
    Route::get('/procesos-apoyo/todos', [ProcesoApoyoController::class, 'todos']);
    Route::get('/procesos-apoyo/{id}/documentos', [ProcesoApoyoController::class, 'documentos']);
    Route::get('/direcciones/{direccionId}/procesos-apoyo', [ProcesoApoyoController::class, 'porDireccion']);
    // Alias de compatibilidad para llamadas antiguas del frontend
    Route::get('/direcciones/{direccionId}/procesos', [ProcesoApoyoController::class, 'porDireccion']);
    Route::apiResource('procesos-apoyo', ProcesoApoyoController::class);

    // Rutas nuevas para procesos genéricos
    Route::get('/procesos/tipos/stats', [ProcesoController::class, 'tiposStats']);
    Route::apiResource('procesos', ProcesoController::class);

    // Rutas específicas de Documentos (DEBEN IR ANTES que apiResource)
    Route::get('/documentos/buscar', [DocumentoController::class, 'buscar']);
    Route::get('/documentos/recientes', [DocumentoController::class, 'recientes']);
    Route::get('/documentos/estadisticas', [DocumentoController::class, 'estadisticas']);
    Route::get('/documentos/estadisticas-extensiones', [DocumentoController::class, 'estadisticasExtensiones']);
    Route::get('/documentos/extensiones-disponibles', [DocumentoController::class, 'extensionesDisponibles']);
    Route::get('/documentos/etiquetas', [DocumentoController::class, 'etiquetas']);
    Route::get('/documentos/tipos', [DocumentoController::class, 'tipos']);
    // Sugerencias de etiquetas (autosuggest simple desde documentos existentes)
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
    
    // Rutas de Documentos (apiResource debe ir DESPUÉS de las rutas específicas)
    Route::middleware(\App\Http\Middleware\HandleLargeUploads::class)->group(function () {
        Route::apiResource('documentos', DocumentoController::class);
        Route::post('/documentos/{id}/descargar', [DocumentoController::class, 'descargar'])->name('documentos.descargar');
        Route::get('/documentos/{id}/vista-previa', [DocumentoController::class, 'vistaPrevia'])->name('documentos.vista-previa');
    });

    // Noticias: endpoints rápidos para el dashboard
    Route::get('/noticias/latest', [NoticiaController::class, 'latest']);
    // Listado paginado completo si se requiere
    Route::get('/noticias', [NoticiaController::class, 'index']);

    // Ruta de prueba para debug
    Route::get('/debug/documentos', function (Request $request) {
        $query = \App\Models\Documento::with(['direccion:id,nombre,codigo', 'procesoApoyo:id,nombre,codigo']);
        
        if ($request->has('direccion_id')) {
            $query->where('direccion_id', $request->direccion_id);
        }
        
        if ($request->has('proceso_apoyo_id')) {
            $query->where('proceso_apoyo_id', $request->proceso_apoyo_id);
        }
        
        $documentos = $query->get();
        
        return response()->json([
            'success' => true,
            'data' => [
                'documentos' => $documentos,
                'count' => $documentos->count(),
                'params' => $request->all()
            ]
        ]);
    });

    // Rutas de Administración (solo para administradores)
    Route::middleware('admin')->group(function () {
        // Gestión de Usuarios (rutas específicas ANTES del apiResource para evitar colisiones)
        Route::get('/usuarios/stats', [UserController::class, 'stats']);
        Route::patch('/usuarios/{id}/toggle-status', [UserController::class, 'toggleStatus']);
        Route::apiResource('usuarios', UserController::class);

        // Gestión de Roles (rutas específicas ANTES del apiResource para evitar colisiones)
        Route::get('/roles/stats', [RoleController::class, 'stats']);
        Route::get('/roles/permissions', [RoleController::class, 'permissions']);
        Route::get('/roles/{id}/users', [RoleController::class, 'users']);
        Route::apiResource('roles', RoleController::class);

        // Estadísticas Administrativas
        Route::get('/admin/stats', [AdminController::class, 'stats']);
        Route::get('/admin/activity', [AdminController::class, 'recentActivity']);
        Route::get('/admin/report', [AdminController::class, 'systemReport']);

        // Noticias (crear y gestionar)
        Route::get('/admin/noticias', [NoticiaController::class, 'indexAdmin']);
        Route::post('/noticias', [NoticiaController::class, 'store']);
        Route::put('/noticias/{id}', [NoticiaController::class, 'update']);
        Route::patch('/noticias/{id}', [NoticiaController::class, 'update']);
        Route::patch('/noticias/{id}/toggle', [NoticiaController::class, 'toggle']);
        Route::delete('/noticias/{id}', [NoticiaController::class, 'destroy']);
    });
}); 