<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documentos', function (Blueprint $table) {
            if (!Schema::hasColumn('documentos', 'tipo')) {
                $table->string('tipo', 50)->nullable()->after('tipo_archivo');
                // Evitar colisión con índice existente "documentos_tipo_index" (usado para tipo_archivo)
                try { $table->index('tipo', 'documentos_tipo_meta_index'); } catch (\Throwable $e) {}
            }
            if (!Schema::hasColumn('documentos', 'etiquetas')) {
                $table->json('etiquetas')->nullable()->after('tipo');
            }
            if (!Schema::hasColumn('documentos', 'fecha_documento')) {
                $table->date('fecha_documento')->nullable()->after('etiquetas');
                try { $table->index('fecha_documento'); } catch (\Throwable $e) {}
            }
            if (!Schema::hasColumn('documentos', 'vigente_hasta')) {
                $table->date('vigente_hasta')->nullable()->after('fecha_documento');
                try { $table->index('vigente_hasta'); } catch (\Throwable $e) {}
            }
            if (!Schema::hasColumn('documentos', 'confidencialidad')) {
                $table->string('confidencialidad', 20)->nullable()->after('vigente_hasta');
                try { $table->index('confidencialidad'); } catch (\Throwable $e) {}
            }
            if (!Schema::hasColumn('documentos', 'responsable_id')) {
                $table->unsignedBigInteger('responsable_id')->nullable()->after('subido_por');
                $table->foreign('responsable_id')->references('id')->on('users')->nullOnDelete();
                try { $table->index('responsable_id'); } catch (\Throwable $e) {}
            }
        });
    }

    public function down(): void
    {
        Schema::table('documentos', function (Blueprint $table) {
            if (Schema::hasColumn('documentos', 'responsable_id')) {
                try { $table->dropForeign(['responsable_id']); } catch (\Throwable $e) {}
                try { $table->dropIndex(['responsable_id']); } catch (\Throwable $e) {}
                $table->dropColumn('responsable_id');
            }
            if (Schema::hasColumn('documentos', 'confidencialidad')) {
                try { $table->dropIndex(['confidencialidad']); } catch (\Throwable $e) {}
                $table->dropColumn('confidencialidad');
            }
            if (Schema::hasColumn('documentos', 'vigente_hasta')) {
                try { $table->dropIndex(['vigente_hasta']); } catch (\Throwable $e) {}
                $table->dropColumn('vigente_hasta');
            }
            if (Schema::hasColumn('documentos', 'fecha_documento')) {
                try { $table->dropIndex(['fecha_documento']); } catch (\Throwable $e) {}
                $table->dropColumn('fecha_documento');
            }
            if (Schema::hasColumn('documentos', 'etiquetas')) {
                $table->dropColumn('etiquetas');
            }
            if (Schema::hasColumn('documentos', 'tipo')) {
                try { $table->dropIndex('documentos_tipo_meta_index'); } catch (\Throwable $e) {}
                $table->dropColumn('tipo');
            }
        });
    }
};

