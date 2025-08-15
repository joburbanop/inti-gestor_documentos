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
        Schema::create('documentos', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->text('descripcion')->nullable();
            $table->string('nombre_archivo');
            $table->string('nombre_original');
            $table->string('ruta_archivo');
            $table->string('tipo_archivo');
            $table->bigInteger('tamaño_archivo');
            
            // Etiquetado por proceso interno
            $table->unsignedBigInteger('proceso_interno_id')->nullable();
            $table->unsignedBigInteger('subido_por');
            
            $table->string('slug')->unique();
            $table->integer('contador_descargas')->default(0);
            $table->boolean('publico')->default(false);
            $table->timestamps();
            
            // Relaciones y índices optimizados
            $table->foreign('proceso_interno_id')->references('id')->on('procesos_internos')->onDelete('set null');
            $table->foreign('subido_por')->references('id')->on('users')->onDelete('cascade');
            
            // Índices para consultas optimizadas
            $table->index('proceso_interno_id');
            $table->index('titulo');
            $table->index('slug');
            $table->index('publico');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documentos');
    }
}; 