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
        Schema::table('procesos_internos', function (Blueprint $table) {
            // Hacer proceso_general_id nullable para permitir procesos internos estándar
            $table->unsignedBigInteger('proceso_general_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('procesos_internos', function (Blueprint $table) {
            // Volver a hacer proceso_general_id NOT NULL
            $table->unsignedBigInteger('proceso_general_id')->nullable(false)->change();
        });
    }
};
