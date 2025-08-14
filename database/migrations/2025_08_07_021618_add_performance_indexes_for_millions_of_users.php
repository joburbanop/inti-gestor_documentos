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
        // Índices ultra optimizados para usuarios
        Schema::table('users', function (Blueprint $table) {
            // Índices compuestos para consultas frecuentes
            try { $table->index(['email', 'is_active'], 'users_email_active_index'); } catch (\Throwable $e) {}
            try { $table->index(['role_id', 'is_active'], 'users_role_active_index'); } catch (\Throwable $e) {}
            try { $table->index(['created_at'], 'users_created_at_index'); } catch (\Throwable $e) {}
        });

        // Índices para direcciones (sin campo 'orden')
        Schema::table('direcciones', function (Blueprint $table) {
            try { $table->index(['codigo', 'activo'], 'direcciones_codigo_active_index'); } catch (\Throwable $e) {}
            try { $table->index(['nombre', 'activo'], 'direcciones_nombre_active_index'); } catch (\Throwable $e) {}
        });

        // Índices para procesos (nueva tabla unificada)
        Schema::table('procesos', function (Blueprint $table) {
            try { $table->index(['codigo', 'activo'], 'procesos_codigo_active_index'); } catch (\Throwable $e) {}
            try { $table->index(['nombre', 'activo'], 'procesos_nombre_active_index'); } catch (\Throwable $e) {}
            try { $table->index(['tipo', 'activo'], 'procesos_tipo_active_index'); } catch (\Throwable $e) {}
        });

        // Índices para documentos
        Schema::table('documentos', function (Blueprint $table) {
            // Índices compuestos para consultas frecuentes
            try { $table->index(['direccion_id', 'created_at'], 'documentos_direccion_created_index'); } catch (\Throwable $e) {}
            try { $table->index(['proceso_id'], 'documentos_proceso_index'); } catch (\Throwable $e) {}
            try { $table->index(['tipo_archivo'], 'documentos_tipo_index'); } catch (\Throwable $e) {}
            // try { $table->index(['titulo'], 'documentos_titulo_index'); } catch (\Throwable $e) {} // Ya existe
            try { $table->index(['created_at'], 'documentos_created_index'); } catch (\Throwable $e) {}
            try { $table->index(['subido_por'], 'documentos_subido_por_index'); } catch (\Throwable $e) {}
        });

        // Índices para personal access tokens (Sanctum)
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            // Índices para autenticación rápida
            try { $table->index(['tokenable_type', 'tokenable_id'], 'tokens_tokenable_index'); } catch (\Throwable $e) {}
            // Evitar índice sobre columna TEXT/BLOB sin longitud en MySQL
            // El campo "name" puede ser TEXT dependiendo de la migración base.
            // Para máxima compatibilidad, omitimos índice compuesto con "name".
            try { $table->index(['expires_at'], 'tokens_expires_index'); } catch (\Throwable $e) {}
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remover índices de usuarios
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_email_active_index');
            $table->dropIndex('users_role_active_index');
            $table->dropIndex('users_created_at_index');
        });

        // Remover índices de direcciones
        Schema::table('direcciones', function (Blueprint $table) {
            $table->dropIndex('direcciones_codigo_active_index');
            $table->dropIndex('direcciones_nombre_active_index');
        });

        // Remover índices de procesos
        Schema::table('procesos', function (Blueprint $table) {
            $table->dropIndex('procesos_codigo_active_index');
            $table->dropIndex('procesos_nombre_active_index');
            $table->dropIndex('procesos_tipo_active_index');
        });

        // Remover índices de documentos
        Schema::table('documentos', function (Blueprint $table) {
            $table->dropIndex('documentos_direccion_created_index');
            $table->dropIndex('documentos_proceso_index');
            $table->dropIndex('documentos_tipo_index');
            $table->dropIndex('documentos_titulo_index');
            $table->dropIndex('documentos_created_index');
            $table->dropIndex('documentos_subido_por_index');
        });

        // Remover índices de tokens
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->dropIndex('tokens_tokenable_index');
            $table->dropIndex('tokens_name_type_index');
            $table->dropIndex('tokens_expires_index');
        });
    }
};
