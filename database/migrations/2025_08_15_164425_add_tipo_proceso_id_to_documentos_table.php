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
            $table->unsignedBigInteger('tipo_proceso_id')->nullable()->after('id');
            $table->foreign('tipo_proceso_id')->references('id')->on('tipos_procesos')->onDelete('set null');
            $table->index('tipo_proceso_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documentos', function (Blueprint $table) {
            $table->dropForeign(['tipo_proceso_id']);
            $table->dropIndex(['tipo_proceso_id']);
            $table->dropColumn('tipo_proceso_id');
        });
    }
};
