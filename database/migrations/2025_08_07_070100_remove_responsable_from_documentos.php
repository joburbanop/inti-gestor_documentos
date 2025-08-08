<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documentos', function (Blueprint $table) {
            if (Schema::hasColumn('documentos', 'responsable_id')) {
                try { $table->dropForeign(['responsable_id']); } catch (\Throwable $e) {}
                try { $table->dropIndex(['responsable_id']); } catch (\Throwable $e) {}
                $table->dropColumn('responsable_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('documentos', function (Blueprint $table) {
            if (!Schema::hasColumn('documentos', 'responsable_id')) {
                $table->unsignedBigInteger('responsable_id')->nullable()->after('subido_por');
                $table->foreign('responsable_id')->references('id')->on('users')->nullOnDelete();
                $table->index('responsable_id');
            }
        });
    }
};

