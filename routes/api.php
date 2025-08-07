<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DireccionController;
use App\Http\Controllers\Api\ProcesoApoyoController;
use App\Http\Controllers\Api\DocumentoController;
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
Route::middleware('api.auth')->group(function () {
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
    Route::apiResource('procesos-apoyo', ProcesoApoyoController::class);

    // Rutas específicas de Documentos (DEBEN IR ANTES que apiResource)
    Route::get('/documentos/buscar', [DocumentoController::class, 'buscar']);
    Route::get('/documentos/recientes', [DocumentoController::class, 'recientes']);
    Route::get('/documentos/estadisticas', [DocumentoController::class, 'estadisticas']);
    
    // Rutas de Documentos (apiResource debe ir DESPUÉS de las rutas específicas)
    Route::apiResource('documentos', DocumentoController::class);
    Route::post('/documentos/{id}/descargar', [DocumentoController::class, 'descargar']);
    Route::get('/documentos/{id}/vista-previa', [DocumentoController::class, 'vistaPrevia']);
}); 