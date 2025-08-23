<?php

namespace Database\Seeders;

use App\Models\ProcesoInterno;
use Illuminate\Database\Seeder;

class ProcesoInternoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Carpetas estándar que son iguales para todos los documentos
        // Son independientes de Tipo de Proceso y Proceso General
        $carpetasEstandar = [
            [
                'nombre' => 'Formatos',
                'descripcion' => 'Formularios y formatos oficiales',
                'icono' => 'document-text'
            ],
            [
                'nombre' => 'Procedimientos',
                'descripcion' => 'Procedimientos y protocolos establecidos',
                'icono' => 'clipboard-list'
            ],
            [
                'nombre' => 'Instructivos',
                'descripcion' => 'Instructivos y guías de trabajo',
                'icono' => 'academic-cap'
            ],
            [
                'nombre' => 'Manuales',
                'descripcion' => 'Manuales de operación y referencia',
                'icono' => 'book-open'
            ]
        ];

        // Crear procesos internos estándar (sin proceso_general_id)
        // Estos son las mismas carpetas para todos los documentos
        foreach ($carpetasEstandar as $carpeta) {
            ProcesoInterno::updateOrCreate(
                [
                    'nombre' => $carpeta['nombre'],
                    'proceso_general_id' => null // NULL = carpeta estándar para todos
                ],
                [
                    'nombre' => $carpeta['nombre'],
                    'descripcion' => $carpeta['descripcion'],
                    'icono' => $carpeta['icono'],
                    'proceso_general_id' => null,
                    'activo' => true
                ]
            );
        }
    }
}
