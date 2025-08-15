<?php

namespace Database\Seeders;

use App\Models\ProcesoGeneral;
use Illuminate\Database\Seeder;

class ProcesoGeneralSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $procesosGenerales = [
            [
                'nombre' => 'Administración',
                'descripcion' => 'Gestión administrativa y operativa de la organización',
                'codigo' => 'ADM',
                'color' => '#1F448B',
                'orden' => 1
            ],
            [
                'nombre' => 'Ingeniería',
                'descripcion' => 'Desarrollo técnico y de proyectos de ingeniería',
                'codigo' => 'ING',
                'color' => '#059669',
                'orden' => 2
            ],
            [
                'nombre' => 'Finanzas',
                'descripcion' => 'Gestión financiera y contable de la organización',
                'codigo' => 'FIN',
                'color' => '#7C3AED',
                'orden' => 3
            ],
            [
                'nombre' => 'Comercial',
                'descripcion' => 'Gestión comercial y de ventas',
                'codigo' => 'COM',
                'color' => '#DC2626',
                'orden' => 4
            ],
            [
                'nombre' => 'Recursos Humanos',
                'descripcion' => 'Gestión del talento humano y desarrollo organizacional',
                'codigo' => 'DHH',
                'color' => '#EA580C',
                'orden' => 5
            ]
        ];

        foreach ($procesosGenerales as $proceso) {
            ProcesoGeneral::updateOrCreate(
                ['codigo' => $proceso['codigo']],
                $proceso
            );
        }
    }
}
