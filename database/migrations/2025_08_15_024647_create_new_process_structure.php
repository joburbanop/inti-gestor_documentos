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
        // Crear tabla procesos_generales
        Schema::create('procesos_generales', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->string('codigo')->unique(); // ADM, ING, FIN, COM, DHH
            $table->string('color')->default('#1F448B');
            $table->integer('orden')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
            
            // Índices optimizados para consultas frecuentes
            $table->index(['orden', 'activo']);
            $table->index('codigo');
        });

        // Crear tabla procesos_internos
        Schema::create('procesos_internos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->string('codigo', 50)->nullable();
            $table->string('color', 20)->nullable();
            $table->unsignedBigInteger('proceso_general_id');
            $table->boolean('activo')->default(true);
            $table->timestamps();

            // Clave foránea
            $table->foreign('proceso_general_id')->references('id')->on('procesos_generales')->onDelete('cascade');
            
            // Índices
            $table->index(['proceso_general_id', 'activo']);
            $table->index('codigo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar tablas
        Schema::dropIfExists('procesos_internos');
        Schema::dropIfExists('procesos_generales');
    }
};
