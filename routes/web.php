<?php

use Illuminate\Support\Facades\Route;

// Ruta principal - mostrar la aplicación React
Route::get('/', function () {
    return view('app');
});

// Ruta catch-all para SPA - debe excluir assets, API y otros recursos
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api|build|storage|favicon\.ico|_debugbar|sanctum).*$');
