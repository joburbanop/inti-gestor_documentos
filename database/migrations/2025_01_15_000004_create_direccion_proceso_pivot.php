<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('direccion_proceso', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('direccion_id');
            $table->unsignedBigInteger('proceso_id');
            $table->timestamps();

            $table->unique(['direccion_id', 'proceso_id']);
            $table->foreign('direccion_id')->references('id')->on('direcciones')->onDelete('cascade');
            $table->foreign('proceso_id')->references('id')->on('procesos')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('direccion_proceso');
    }
};
