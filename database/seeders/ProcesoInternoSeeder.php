<?php

namespace Database\Seeders;

use App\Models\ProcesoGeneral;
use App\Models\ProcesoInterno;
use Illuminate\Database\Seeder;

class ProcesoInternoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener los procesos generales
        $procesosGenerales = ProcesoGeneral::all()->keyBy('nombre');

        // Carpetas estándar que se aplican a todos los procesos generales
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

        // Crear carpetas (procesos internos) para cada proceso general
        foreach ($procesosGenerales as $procesoGeneral) {
            foreach ($carpetasEstandar as $carpeta) {
                ProcesoInterno::updateOrCreate(
                    [
                        'nombre' => $carpeta['nombre'],
                        'proceso_general_id' => $procesoGeneral->id
                    ],
                    [
                        'nombre' => $carpeta['nombre'],
                        'descripcion' => $carpeta['descripcion'],
                        'icono' => $carpeta['icono'],
                        'proceso_general_id' => $procesoGeneral->id,
                        'activo' => true
                    ]
                );
            }
        }
    }
}
