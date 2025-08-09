<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Poblar la columna extension basándose en el nombre del archivo
        DB::statement("
            UPDATE documentos 
            SET extension = LOWER(SUBSTRING_INDEX(nombre_archivo, '.', -1))
            WHERE nombre_archivo LIKE '%.%' 
            AND extension IS NULL
        ");
        
        // Para archivos sin extensión, establecer como 'sin_extension'
        DB::statement("
            UPDATE documentos 
            SET extension = 'sin_extension'
            WHERE (nombre_archivo NOT LIKE '%.%' OR nombre_archivo LIKE '%.')
            AND extension IS NULL
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("UPDATE documentos SET extension = NULL");
    }
};
