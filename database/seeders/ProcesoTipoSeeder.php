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
                'key' => 'estrategico',
                'title' => 'Procesos Estratégicos mirando al futuro',
                'subtitle' => 'Definen la dirección y objetivos de la organización',
                'empty_text' => 'No hay procesos estratégicos registrados aún.',
                'color' => '#1E40AF',
                'icon' => 'building',
                'orden' => 1
            ],
            [
                'key' => 'misional',
                'title' => 'Procesos Misionales',
                'subtitle' => 'Ejecutan las funciones principales de la organización',
                'empty_text' => 'No hay procesos misionales registrados aún.',
                'color' => '#059669',
                'icon' => 'target',
                'orden' => 2
            ],
            [
                'key' => 'apoyo',
                'title' => 'Procesos de Apoyo',
                'subtitle' => 'Soportan y habilitan los procesos estratégicos y misionales',
                'empty_text' => 'No hay procesos de apoyo registrados aún.',
                'color' => '#7C3AED',
                'icon' => 'support',
                'orden' => 3
            ],
            [
                'key' => 'evaluacion',
                'title' => 'Procesos de Evaluación',
                'subtitle' => 'Evaluación y mejora continua de la organización',
                'empty_text' => 'No hay procesos de evaluación registrados aún.',
                'color' => '#DC2626',
                'icon' => 'chart',
                'orden' => 4
            ]
        ];

        foreach ($tipos as $tipo) {
            ProcesoTipo::updateOrCreate(
                ['key' => $tipo['key']],
                $tipo
            );
        }
    }
}
