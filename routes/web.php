<?php

use Illuminate\Support\Facades\Route;

// Ruta principal - mostrar la aplicación React
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '^(?!api|build|storage|favicon\.ico).*$');
