<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('direcciones', 'orden')) {
            // Quitar índices que incluyan orden si existen
            try { \DB::statement('ALTER TABLE direcciones DROP INDEX direcciones_active_order_created_index'); } catch (\Throwable $e) {}
            try { \DB::statement('ALTER TABLE direcciones DROP INDEX direcciones_orden_activo_index'); } catch (\Throwable $e) {}
            Schema::table('direcciones', function (Blueprint $table) {
                $table->dropColumn('orden');
            });
        }
    }

    public function down(): void
    {
        Schema::table('direcciones', function (Blueprint $table) {
            if (!Schema::hasColumn('direcciones', 'orden')) {
                $table->integer('orden')->default(0);
            }
            try { $table->index(['orden', 'activo']); } catch (\Throwable $e) {}
        });
    }
};

