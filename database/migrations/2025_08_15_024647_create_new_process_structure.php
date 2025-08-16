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
        // Crear tabla tipos_procesos (categorías principales)
        Schema::create('tipos_procesos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->unique(); // estratégico, misional, apoyo, evaluación
            $table->string('titulo'); // "Procesos Estratégicos", "Procesos Misionales", etc.
            $table->text('descripcion')->nullable();
            $table->string('icono')->nullable(); // Nombre del icono
            $table->boolean('activo')->default(true);
            $table->timestamps();
            
            // Índices optimizados
            $table->index('activo');
            $table->index('nombre');
        });

        // Crear tabla procesos_generales (áreas de la empresa)
        Schema::create('procesos_generales', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->string('icono')->nullable();
            $table->unsignedBigInteger('tipo_proceso_id'); // Relación con tipo_proceso
            $table->boolean('activo')->default(true);
            $table->timestamps();

            // Clave foránea
            $table->foreign('tipo_proceso_id')->references('id')->on('tipos_procesos')->onDelete('cascade');
            
            // Índices optimizados
            $table->index(['tipo_proceso_id', 'activo']);
            $table->index('nombre');
        });

        // Crear tabla procesos_internos (subprocesos específicos)
        Schema::create('procesos_internos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->string('icono')->nullable();
            $table->unsignedBigInteger('proceso_general_id');
            $table->boolean('activo')->default(true);
            $table->timestamps();

            // Clave foránea
            $table->foreign('proceso_general_id')->references('id')->on('procesos_generales')->onDelete('cascade');
            
            // Índices optimizados
            $table->index(['proceso_general_id', 'activo']);
            $table->index('nombre');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('procesos_internos');
        Schema::dropIfExists('procesos_generales');
        Schema::dropIfExists('tipos_procesos');
    }
};
