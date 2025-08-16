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
        Schema::table('documentos', function (Blueprint $table) {
            // Agregar campo proceso_general_id después de proceso_interno_id
            $table->unsignedBigInteger('proceso_general_id')->nullable()->after('proceso_interno_id');
            
            // Agregar foreign key
            $table->foreign('proceso_general_id')->references('id')->on('procesos_generales')->onDelete('set null');
            
            // Agregar índice para optimizar consultas
            $table->index('proceso_general_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documentos', function (Blueprint $table) {
            $table->dropForeign(['proceso_general_id']);
            $table->dropIndex(['proceso_general_id']);
            $table->dropColumn('proceso_general_id');
        });
    }
};
