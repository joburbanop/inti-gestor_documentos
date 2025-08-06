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
        Schema::create('procesos_apoyo', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->unsignedBigInteger('direccion_id'); // Dirección a la que pertenece
            $table->string('codigo')->nullable(); // Código del proceso
            $table->integer('orden')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
            
            // Relaciones y índices optimizados
            $table->foreign('direccion_id')->references('id')->on('direcciones')->onDelete('cascade');
            $table->index(['direccion_id', 'orden', 'activo']);
            $table->index('codigo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('procesos_apoyo');
    }
}; 