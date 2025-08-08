<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('procesos_apoyo', function (Blueprint $table) {
            // Quitar la clave foránea existente para poder cambiar la nulabilidad
            try {
                $table->dropForeign(['direccion_id']);
            } catch (\Throwable $e) {
                // ignorar si no existe
            }

            // Hacer la columna nullable
            $table->unsignedBigInteger('direccion_id')->nullable()->change();

            // Volver a crear la foreign key con nullOnDelete para permitir disociación
            $table->foreign('direccion_id')
                  ->references('id')->on('direcciones')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('procesos_apoyo', function (Blueprint $table) {
            try {
                $table->dropForeign(['direccion_id']);
            } catch (\Throwable $e) {
                // ignorar si no existe
            }

            // Restaurar a no nullable con onDelete cascade
            $table->unsignedBigInteger('direccion_id')->nullable(false)->change();
            $table->foreign('direccion_id')
                  ->references('id')->on('direcciones')
                  ->cascadeOnDelete();
        });
    }
};

