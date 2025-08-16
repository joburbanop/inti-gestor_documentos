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
        // Crear tabla categorias (carpetas)
        Schema::create('categorias', function (Blueprint $table) {
            $table->id();
            $table->string('nombre'); // Formatos, Procedimientos, Instructivos, Manuales
            $table->text('descripcion')->nullable();
            $table->string('icono')->nullable();
            $table->unsignedBigInteger('proceso_interno_id');
            $table->boolean('activo')->default(true);
            $table->timestamps();

            // Clave foránea
            $table->foreign('proceso_interno_id')->references('id')->on('procesos_internos')->onDelete('cascade');
            
            // Índices optimizados
            $table->index(['proceso_interno_id', 'activo']);
            $table->index('nombre');
        });

        // Agregar columna categoria_id a documentos
        Schema::table('documentos', function (Blueprint $table) {
            $table->unsignedBigInteger('categoria_id')->nullable()->after('proceso_interno_id');
            $table->foreign('categoria_id')->references('id')->on('categorias')->onDelete('set null');
            $table->index(['categoria_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remover columna categoria_id de documentos
        Schema::table('documentos', function (Blueprint $table) {
            $table->dropForeign(['categoria_id']);
            $table->dropIndex(['categoria_id', 'created_at']);
            $table->dropColumn('categoria_id');
        });

        // Eliminar tabla categorias
        Schema::dropIfExists('categorias');
    }
};
