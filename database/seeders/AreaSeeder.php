<?php

namespace Database\Seeders;

use App\Models\Area;
use Illuminate\Database\Seeder;

class AreaSeeder extends Seeder
{
    public function run(): void
    {
        $areas = [
            [
                'name' => 'Dirección Administrativa',
                'description' => 'Gestiona todos los procesos administrativos de la empresa',
                'code' => 'ADM',
                'color' => '#1F448B'
            ],
            [
                'name' => 'Dirección de Ingeniería',
                'description' => 'Responsable de todos los proyectos de ingeniería y desarrollo técnico',
                'code' => 'ING',
                'color' => '#FF7D09'
            ],
            [
                'name' => 'Dirección Financiera',
                'description' => 'Gestiona las finanzas, contabilidad y recursos económicos',
                'code' => 'FIN',
                'color' => '#B1CC34'
            ],
            [
                'name' => 'Dirección Comercial',
                'description' => 'Responsable de ventas, marketing y relaciones comerciales',
                'code' => 'COM',
                'color' => '#E74C3C'
            ],
            [
                'name' => 'Dirección de Derechos Humanos',
                'description' => 'Gestiona recursos humanos, talento y desarrollo organizacional',
                'code' => 'RRHH',
                'color' => '#9B59B6'
            ]
        ];

        foreach ($areas as $areaData) {
            Area::updateOrCreate(
                ['code' => $areaData['code']],
                $areaData
            );
        }
    }
}
