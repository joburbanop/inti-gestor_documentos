<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documentos', function (Blueprint $table) {
            // Índices adicionales simples (si no existen)
            try { $table->index('nombre_original', 'idx_documentos_nombre_original'); } catch (\Throwable $e) {}
            // descripcion es TEXT; preferimos índice FULLTEXT abajo

            // Índice compuesto adicional para filtros frecuentes
            try { $table->index(['proceso_general_id', 'proceso_interno_id', 'created_at'], 'idx_documentos_general_interno_created'); } catch (\Throwable $e) {}
        });

        // Columna generada para acelerar búsqueda por etiquetas (JSON)
        // NOTA: MySQL 8 permite columnas generadas y FULLTEXT sobre VARCHAR
        try {
            Schema::table('documentos', function (Blueprint $table) {
                if (!Schema::hasColumn('documentos', 'etiquetas_text')) {
                    $table->string('etiquetas_text', 1024)
                        ->storedAs("json_unquote(json_extract(etiquetas, '$'))")
                        ->nullable();
                }
            });
        } catch (\Throwable $e) {
            // Ignorar si el motor/versión no soporta columnas generadas
        }

        // Índices FULLTEXT para MySQL (InnoDB)
        // Importante: solo se crean si el motor los soporta
        try {
            Schema::table('documentos', function (Blueprint $table) {
                // FULLTEXT sobre título, descripción y nombre original
                $table->fullText(['titulo', 'descripcion', 'nombre_original'], 'ft_documentos_texto');
                // FULLTEXT sobre etiquetas_text si existe
                if (Schema::hasColumn('documentos', 'etiquetas_text')) {
                    $table->fullText('etiquetas_text', 'ft_documentos_etiquetas');
                }
            });
        } catch (\Throwable $e) {
            // Ignorar si FULLTEXT no está disponible
        }
    }

    public function down(): void
    {
        // Eliminar índices FULLTEXT
        try {
            Schema::table('documentos', function (Blueprint $table) {
                try { $table->dropFullText('ft_documentos_etiquetas'); } catch (\Throwable $e) {}
                try { $table->dropFullText('ft_documentos_texto'); } catch (\Throwable $e) {}
            });
        } catch (\Throwable $e) {}

        // Eliminar columna generada
        try {
            Schema::table('documentos', function (Blueprint $table) {
                if (Schema::hasColumn('documentos', 'etiquetas_text')) {
                    $table->dropColumn('etiquetas_text');
                }
            });
        } catch (\Throwable $e) {}

        // Eliminar índices adicionales
        try {
            Schema::table('documentos', function (Blueprint $table) {
                try { $table->dropIndex('idx_documentos_general_interno_created'); } catch (\Throwable $e) {}
                try { $table->dropIndex('idx_documentos_nombre_original'); } catch (\Throwable $e) {}
            });
        } catch (\Throwable $e) {}
    }
};
