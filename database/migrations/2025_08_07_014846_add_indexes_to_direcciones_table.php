<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('direcciones', function (Blueprint $table) {
            // Índices para optimizar consultas frecuentes (solo los que no existen)
            if (!Schema::hasIndex('direcciones', 'direcciones_activo_orden_index')) {
                $table->index(['activo', 'orden']);
            }
            if (!Schema::hasIndex('direcciones', 'direcciones_nombre_index')) {
                $table->index('nombre');
            }
            if (!Schema::hasIndex('direcciones', 'direcciones_created_at_index')) {
                $table->index('created_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('direcciones', function (Blueprint $table) {
            $table->dropIndex(['activo', 'orden']);
            $table->dropIndex(['nombre']);
            $table->dropIndex(['codigo']);
            $table->dropIndex(['created_at']);
        });
    }
};
