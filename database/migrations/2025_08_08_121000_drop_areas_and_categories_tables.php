<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('categories')) {
            Schema::drop('categories');
        }
        if (Schema::hasTable('areas')) {
            Schema::drop('areas');
        }
    }

    public function down(): void
    {
        // No se recrean las tablas; restaurar con migraciones originales si fuera necesario
    }
};
