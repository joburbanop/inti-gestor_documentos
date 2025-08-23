<?php

namespace Database\Seeders;

use App\Models\ProcesoTipo;
use App\Models\ProcesoGeneral;
use Illuminate\Database\Seeder;

class ProcesoGeneralSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener los tipos de procesos
        $tiposProcesos = ProcesoTipo::all()->keyBy('nombre');

        // Definir los procesos generales con sus tipos correspondientes
        $procesosGenerales = [
            // Procesos Estratégicos
            [
                'nombre' => 'Planeación Estratégica',
                'descripcion' => 'Procesos de planeación estratégica y dirección de la organización',
                'icono' => 'chart-bar',
                'tipo' => 'estrategico'
            ],
            [
                'nombre' => 'Dirección General',
                'descripcion' => 'Dirección y gestión estratégica de la organización',
                'icono' => 'office-building',
                'tipo' => 'estrategico'
            ],
            
            // Procesos Misionales
            [
                'nombre' => 'Salud Pública',
                'descripcion' => 'Procesos misionales relacionados con la salud pública',
                'icono' => 'heart',
                'tipo' => 'misional'
            ],
            [
                'nombre' => 'Atención al Usuario',
                'descripcion' => 'Procesos de atención y servicio al usuario',
                'icono' => 'user-group',
                'tipo' => 'misional'
            ],
            [
                'nombre' => 'Gestión de Proyectos',
                'descripcion' => 'Gestión y ejecución de proyectos misionales',
                'icono' => 'clipboard-list',
                'tipo' => 'misional'
            ],
            
            // Procesos de Apoyo
            [
                'nombre' => 'Gestión del Talento Humano',
                'descripcion' => 'Gestión integral del talento humano de la organización',
                'icono' => 'users',
                'tipo' => 'apoyo'
            ],
            [
                'nombre' => 'Gestión Financiera',
                'descripcion' => 'Gestión financiera, contable y presupuestal',
                'icono' => 'currency-dollar',
                'tipo' => 'apoyo'
            ],
            [
                'nombre' => 'Gestión Administrativa',
                'descripcion' => 'Procesos administrativos y de soporte',
                'icono' => 'office-building',
                'tipo' => 'apoyo'
            ],
            [
                'nombre' => 'Tecnología de la Información',
                'descripcion' => 'Gestión de sistemas y tecnologías de información',
                'icono' => 'computer-desktop',
                'tipo' => 'apoyo'
            ],
            
            // Procesos de Evaluación
            [
                'nombre' => 'Control Interno',
                'descripcion' => 'Procesos de control interno y auditoría',
                'icono' => 'shield-check',
                'tipo' => 'evaluacion'
            ],
            [
                'nombre' => 'Mejora Continua',
                'descripcion' => 'Procesos de evaluación y mejora continua',
                'icono' => 'arrow-up',
                'tipo' => 'evaluacion'
            ]
        ];

        foreach ($procesosGenerales as $proceso) {
            $tipoProceso = $tiposProcesos[$proceso['tipo']] ?? null;
            
            if ($tipoProceso) {
                ProcesoGeneral::updateOrCreate(
                    ['nombre' => $proceso['nombre']],
                    [
                        'nombre' => $proceso['nombre'],
                        'descripcion' => $proceso['descripcion'],
                        'icono' => $proceso['icono'],
                        'tipo_proceso_id' => $tipoProceso->id,
                        'activo' => true
                    ]
                );
            }
        }
    }
}
