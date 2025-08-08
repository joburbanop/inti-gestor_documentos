<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Eliminar la tabla 'documents' si existe
        if (Schema::hasTable('documents')) {
            Schema::drop('documents');
        }
    }

    public function down(): void
    {
        // No se recrea la tabla eliminada; si fuera necesario, restaurar con su migración original
    }
};
