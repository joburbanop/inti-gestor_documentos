<?php

use Illuminate\Support\Facades\Route;

// Ruta principal - mostrar la aplicación React
Route::get('/', function () {
    return view('app');
});

// Ruta para acceso seguro a archivos
Route::get('/storage/{path}', function ($path) {
    return app(\App\Http\Middleware\SecureFileAccess::class)->handle(request(), function() {});
})->where('path', '.*')->middleware('auth:sanctum');

// Ruta catch-all para SPA - debe excluir assets, API y otros recursos
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api|build|storage|favicon\.ico|_debugbar|sanctum).*$');
