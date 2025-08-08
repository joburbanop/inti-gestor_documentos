<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // MySQL puede tener constraints que usan el índice; usar SQL directo de forma segura
        if (Schema::hasColumn('procesos_apoyo', 'orden')) {
            try { \DB::statement('ALTER TABLE procesos_apoyo DROP INDEX procesos_direccion_active_order_index'); } catch (\Throwable $e) {}
            try { \DB::statement('ALTER TABLE procesos_apoyo DROP INDEX procesos_apoyo_direccion_id_orden_activo_index'); } catch (\Throwable $e) {}
            Schema::table('procesos_apoyo', function (Blueprint $table) {
                $table->dropColumn('orden');
            });
        }
    }

    public function down(): void
    {
        Schema::table('procesos_apoyo', function (Blueprint $table) {
            // Restaurar columna orden
            if (!Schema::hasColumn('procesos_apoyo', 'orden')) {
                $table->integer('orden')->default(0);
            }
            // Recrear índice compuesto básico sin nombres específicos (MySQL auto-nombra)
            try { $table->index(['direccion_id', 'orden', 'activo']); } catch (\Throwable $e) {}
        });
    }
};

