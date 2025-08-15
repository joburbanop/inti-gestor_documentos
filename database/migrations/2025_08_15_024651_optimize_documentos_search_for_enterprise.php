<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Índices compuestos para búsqueda rápida por proceso interno
        Schema::table('documentos', function (Blueprint $table) {
            $table->index(['proceso_interno_id', 'created_at'], 'idx_documentos_proceso_interno_created');
        });

        // 2. Índice para búsqueda por tipo de archivo
        Schema::table('documentos', function (Blueprint $table) {
            $table->index('tipo_archivo', 'idx_documentos_tipo_archivo');
        });

        // 3. Índice para búsqueda por fecha
        Schema::table('documentos', function (Blueprint $table) {
            $table->index('created_at', 'idx_documentos_created_at');
        });

        // 4. Índice para búsqueda por confidencialidad
        Schema::table('documentos', function (Blueprint $table) {
            $table->index('confidencialidad', 'idx_documentos_confidencialidad');
        });

        // 5. Índice para búsqueda por usuario que subió
        Schema::table('documentos', function (Blueprint $table) {
            $table->index(['subido_por', 'created_at'], 'idx_documentos_subido_por');
        });

        // 6. Índice compuesto para búsqueda completa
        Schema::table('documentos', function (Blueprint $table) {
            $table->index(['proceso_interno_id', 'tipo_archivo', 'confidencialidad', 'created_at'], 'idx_documentos_search_complete');
        });

        // 7. Optimizar tabla procesos generales
        Schema::table('procesos_generales', function (Blueprint $table) {
            $table->index('activo', 'idx_procesos_generales_activo');
            $table->index('nombre', 'idx_procesos_generales_nombre');
        });

        // 8. Optimizar tabla procesos internos
        Schema::table('procesos_internos', function (Blueprint $table) {
            $table->index(['proceso_general_id', 'activo'], 'idx_procesos_internos_general_activo');
            $table->index('nombre', 'idx_procesos_internos_nombre');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar índices en orden inverso
        Schema::table('procesos_internos', function (Blueprint $table) {
            $table->dropIndex('idx_procesos_internos_nombre');
            $table->dropIndex('idx_procesos_internos_general_activo');
        });

        Schema::table('procesos_generales', function (Blueprint $table) {
            $table->dropIndex('idx_procesos_generales_nombre');
            $table->dropIndex('idx_procesos_generales_activo');
        });

        Schema::table('documentos', function (Blueprint $table) {
            $table->dropIndex('idx_documentos_search_complete');
            $table->dropIndex('idx_documentos_subido_por');
            $table->dropIndex('idx_documentos_confidencialidad');
            $table->dropIndex('idx_documentos_created_at');
            $table->dropIndex('idx_documentos_tipo_archivo');
            $table->dropIndex('idx_documentos_proceso_interno_created');
        });
    }
};
