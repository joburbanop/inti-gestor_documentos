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
            if (!Schema::hasIndex('users', 'users_email_active_index')) {
                $table->index(['email', 'is_active'], 'users_email_active_index');
            }
            if (!Schema::hasIndex('users', 'users_role_active_index')) {
                $table->index(['role_id', 'is_active'], 'users_role_active_index');
            }
            if (!Schema::hasIndex('users', 'users_created_at_index')) {
                $table->index(['created_at'], 'users_created_at_index');
            }
        });

        // Índices para direcciones
        Schema::table('direcciones', function (Blueprint $table) {
            // Índices compuestos para consultas frecuentes
            if (!Schema::hasIndex('direcciones', 'direcciones_active_order_created_index')) {
                $table->index(['activo', 'orden', 'created_at'], 'direcciones_active_order_created_index');
            }
            if (!Schema::hasIndex('direcciones', 'direcciones_codigo_active_index')) {
                $table->index(['codigo', 'activo'], 'direcciones_codigo_active_index');
            }
            if (!Schema::hasIndex('direcciones', 'direcciones_nombre_active_index')) {
                $table->index(['nombre', 'activo'], 'direcciones_nombre_active_index');
            }
        });

        // Índices para procesos de apoyo
        Schema::table('procesos_apoyo', function (Blueprint $table) {
            // Índices compuestos para consultas frecuentes
            if (!Schema::hasIndex('procesos_apoyo', 'procesos_direccion_active_order_index')) {
                $table->index(['direccion_id', 'activo', 'orden'], 'procesos_direccion_active_order_index');
            }
            if (!Schema::hasIndex('procesos_apoyo', 'procesos_codigo_active_index')) {
                $table->index(['codigo', 'activo'], 'procesos_codigo_active_index');
            }
            if (!Schema::hasIndex('procesos_apoyo', 'procesos_nombre_active_index')) {
                $table->index(['nombre', 'activo'], 'procesos_nombre_active_index');
            }
        });

        // Índices para documentos
        Schema::table('documentos', function (Blueprint $table) {
            // Índices compuestos para consultas frecuentes
            if (!Schema::hasIndex('documentos', 'documentos_direccion_created_index')) {
                $table->index(['direccion_id', 'created_at'], 'documentos_direccion_created_index');
            }
            if (!Schema::hasIndex('documentos', 'documentos_proceso_index')) {
                $table->index(['proceso_apoyo_id'], 'documentos_proceso_index');
            }
            if (!Schema::hasIndex('documentos', 'documentos_tipo_index')) {
                $table->index(['tipo_archivo'], 'documentos_tipo_index');
            }
            if (!Schema::hasIndex('documentos', 'documentos_titulo_index')) {
                $table->index(['titulo'], 'documentos_titulo_index');
            }
            if (!Schema::hasIndex('documentos', 'documentos_created_index')) {
                $table->index(['created_at'], 'documentos_created_index');
            }
            if (!Schema::hasIndex('documentos', 'documentos_subido_por_index')) {
                $table->index(['subido_por'], 'documentos_subido_por_index');
            }
        });

        // Índices para personal access tokens (Sanctum)
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            // Índices para autenticación rápida
            if (!Schema::hasIndex('personal_access_tokens', 'tokens_tokenable_index')) {
                $table->index(['tokenable_type', 'tokenable_id'], 'tokens_tokenable_index');
            }
            // Evitar índice sobre columna TEXT/BLOB sin longitud en MySQL
            // El campo "name" puede ser TEXT dependiendo de la migración base.
            // Para máxima compatibilidad, omitimos índice compuesto con "name".
            if (!Schema::hasIndex('personal_access_tokens', 'tokens_expires_index')) {
                $table->index(['expires_at'], 'tokens_expires_index');
            }
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
            $table->dropIndex('direcciones_active_order_created_index');
            $table->dropIndex('direcciones_codigo_active_index');
            $table->dropIndex('direcciones_nombre_active_index');
        });

        // Remover índices de procesos
        Schema::table('procesos_apoyo', function (Blueprint $table) {
            $table->dropIndex('procesos_direccion_active_order_index');
            $table->dropIndex('procesos_codigo_active_index');
            $table->dropIndex('procesos_nombre_active_index');
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
