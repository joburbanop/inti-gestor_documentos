<?php

namespace Database\Seeders;

use App\Models\ProcesoTipo;
use Illuminate\Database\Seeder;

class ProcesoTipoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tipos = [
            [
                'nombre' => 'estrategico',
                'titulo' => 'Procesos Estratégicos',
                'descripcion' => 'Definen la dirección y objetivos de la organización mirando al futuro',
                'icono' => 'building'
            ],
            [
                'nombre' => 'misional',
                'titulo' => 'Procesos Misionales',
                'descripcion' => 'Ejecutan las funciones principales de la organización',
                'icono' => 'target'
            ],
            [
                'nombre' => 'apoyo',
                'titulo' => 'Procesos de Apoyo',
                'descripcion' => 'Soportan y habilitan los procesos estratégicos y misionales',
                'icono' => 'support'
            ],
            [
                'nombre' => 'evaluacion',
                'titulo' => 'Procesos de Evaluación',
                'descripcion' => 'Evaluación y mejora continua de la organización',
                'icono' => 'chart'
            ]
        ];

        foreach ($tipos as $tipo) {
            ProcesoTipo::updateOrCreate(
                ['nombre' => $tipo['nombre']],
                $tipo
            );
        }
    }
}
