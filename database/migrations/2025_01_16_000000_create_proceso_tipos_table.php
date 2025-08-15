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
        Schema::create('proceso_tipos', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // estrategico, misional, apoyo, evaluacion
            $table->string('title'); // Procesos Estratégicos, Procesos Misionales, etc.
            $table->text('subtitle')->nullable(); // Descripción del tipo
            $table->string('empty_text')->nullable(); // Mensaje cuando no hay procesos
            $table->string('color', 20)->nullable(); // Color para UI
            $table->string('icon')->nullable(); // Icono para UI
            $table->boolean('activo')->default(true);
            $table->integer('orden')->default(0); // Para ordenar en la UI
            $table->timestamps();
            
            $table->index(['activo', 'orden']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proceso_tipos');
    }
};
