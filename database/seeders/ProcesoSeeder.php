<?php

namespace Database\Seeders;

use App\Models\Direccion;
use App\Models\Proceso;
use Illuminate\Database\Seeder;

class ProcesoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener las direcciones
        $direcciones = Direccion::all()->keyBy('codigo');

        // Procesos Estratégicos (asociados a direcciones)
        $procesosEstrategicos = [
            'ADM' => [
                [
                    'nombre' => 'Planificación Estratégica',
                    'descripcion' => 'Desarrollo y seguimiento del plan estratégico institucional',
                    'codigo' => 'EST-PLAN',
                    'color' => '#1E40AF'
                ],
                [
                    'nombre' => 'Gestión de Calidad',
                    'descripcion' => 'Implementación y mejora continua del sistema de calidad',
                    'codigo' => 'EST-CAL',
                    'color' => '#059669'
                ]
            ],
            'ING' => [
                [
                    'nombre' => 'Innovación Tecnológica',
                    'descripcion' => 'Desarrollo e implementación de nuevas tecnologías',
                    'codigo' => 'EST-INN',
                    'color' => '#7C3AED'
                ],
                [
                    'nombre' => 'Sostenibilidad',
                    'descripcion' => 'Gestión ambiental y desarrollo sostenible',
                    'codigo' => 'EST-SUS',
                    'color' => '#16A34A'
                ]
            ],
            'FIN' => [
                [
                    'nombre' => 'Gestión Financiera Estratégica',
                    'descripcion' => 'Planificación financiera a largo plazo y gestión de inversiones',
                    'codigo' => 'EST-FIN',
                    'color' => '#DC2626'
                ],
                [
                    'nombre' => 'Riesgos Corporativos',
                    'descripcion' => 'Identificación y gestión de riesgos estratégicos',
                    'codigo' => 'EST-RIS',
                    'color' => '#EA580C'
                ]
            ],
            'COM' => [
                [
                    'nombre' => 'Expansión de Mercado',
                    'descripcion' => 'Estrategias de crecimiento y penetración de mercados',
                    'codigo' => 'EST-EXP',
                    'color' => '#4F46E5'
                ],
                [
                    'nombre' => 'Alianzas Estratégicas',
                    'descripcion' => 'Gestión de alianzas y partnerships estratégicos',
                    'codigo' => 'EST-ALI',
                    'color' => '#0891B2'
                ]
            ],
            'DHH' => [
                [
                    'nombre' => 'Desarrollo Organizacional',
                    'descripcion' => 'Transformación y evolución de la cultura organizacional',
                    'codigo' => 'EST-DEV',
                    'color' => '#BE185D'
                ],
                [
                    'nombre' => 'Gestión del Conocimiento',
                    'descripcion' => 'Captura, almacenamiento y transferencia del conocimiento',
                    'codigo' => 'EST-CON',
                    'color' => '#9333EA'
                ]
            ]
        ];

        // Procesos Misionales (core business)
        $procesosMisionales = [
            [
                'nombre' => 'Desarrollo de Productos',
                'descripcion' => 'Investigación, diseño y desarrollo de nuevos productos y servicios',
                'codigo' => 'MIS-PROD',
                'color' => '#2563EB',
                'direcciones' => ['ING', 'COM']
            ],
            [
                'nombre' => 'Gestión de Proyectos',
                'descripcion' => 'Coordinación y ejecución de proyectos misionales',
                'codigo' => 'MIS-PROY',
                'color' => '#059669',
                'direcciones' => ['ING', 'ADM']
            ],
            [
                'nombre' => 'Servicio al Cliente',
                'descripcion' => 'Atención y satisfacción de necesidades del cliente',
                'codigo' => 'MIS-CLI',
                'color' => '#7C3AED',
                'direcciones' => ['COM', 'DHH']
            ],
            [
                'nombre' => 'Investigación y Desarrollo',
                'descripcion' => 'Actividades de I+D para innovación y mejora continua',
                'codigo' => 'MIS-I+D',
                'color' => '#DC2626',
                'direcciones' => ['ING', 'ADM']
            ],
            [
                'nombre' => 'Gestión de Operaciones',
                'descripcion' => 'Optimización de procesos operativos core del negocio',
                'codigo' => 'MIS-OPE',
                'color' => '#EA580C',
                'direcciones' => ['ADM', 'ING']
            ]
        ];

        // Procesos de Apoyo (ya existentes, mejorados)
        $procesosApoyo = [
            'ADM' => [
                [
                    'nombre' => 'Gestión de Recursos Humanos',
                    'descripcion' => 'Procesos de contratación, nómina y gestión del personal',
                    'codigo' => 'APO-RH',
                    'color' => '#3B82F6'
                ],
                [
                    'nombre' => 'Servicios Generales',
                    'descripcion' => 'Mantenimiento, limpieza y servicios de apoyo',
                    'codigo' => 'APO-SG',
                    'color' => '#10B981'
                ],
                [
                    'nombre' => 'Gestión Documental',
                    'descripcion' => 'Archivo, control y gestión de documentos administrativos',
                    'codigo' => 'APO-GD',
                    'color' => '#F59E0B'
                ]
            ],
            'ING' => [
                [
                    'nombre' => 'Diseño y Planificación',
                    'descripcion' => 'Procesos de diseño, planificación y desarrollo de proyectos',
                    'codigo' => 'APO-DP',
                    'color' => '#8B5CF6'
                ],
                [
                    'nombre' => 'Construcción y Supervisión',
                    'descripcion' => 'Control de obra, supervisión y gestión de construcción',
                    'codigo' => 'APO-CS',
                    'color' => '#EF4444'
                ],
                [
                    'nombre' => 'Gestión de Proyectos',
                    'descripcion' => 'Coordinación, seguimiento y control de proyectos',
                    'codigo' => 'APO-GP',
                    'color' => '#06B6D4'
                ]
            ],
            'FIN' => [
                [
                    'nombre' => 'Contabilidad',
                    'descripcion' => 'Registro contable, reportes y estados financieros',
                    'codigo' => 'APO-CON',
                    'color' => '#84CC16'
                ],
                [
                    'nombre' => 'Tesorería',
                    'descripcion' => 'Gestión de flujo de caja y pagos',
                    'codigo' => 'APO-TES',
                    'color' => '#F97316'
                ],
                [
                    'nombre' => 'Presupuestos',
                    'descripcion' => 'Elaboración y control de presupuestos',
                    'codigo' => 'APO-PRE',
                    'color' => '#EC4899'
                ]
            ],
            'COM' => [
                [
                    'nombre' => 'Ventas',
                    'descripcion' => 'Gestión de ventas, clientes y contratos',
                    'codigo' => 'APO-VEN',
                    'color' => '#6366F1'
                ],
                [
                    'nombre' => 'Marketing',
                    'descripcion' => 'Estrategias de marketing y publicidad',
                    'codigo' => 'APO-MAR',
                    'color' => '#14B8A6'
                ],
                [
                    'nombre' => 'Atención al Cliente',
                    'descripcion' => 'Servicio al cliente y soporte post-venta',
                    'codigo' => 'APO-AC',
                    'color' => '#F59E0B'
                ]
            ],
            'DHH' => [
                [
                    'nombre' => 'Desarrollo Organizacional',
                    'descripcion' => 'Capacitación, desarrollo y evaluación del personal',
                    'codigo' => 'APO-DO',
                    'color' => '#8B5CF6'
                ],
                [
                    'nombre' => 'Bienestar Laboral',
                    'descripcion' => 'Programas de bienestar y clima organizacional',
                    'codigo' => 'APO-BL',
                    'color' => '#10B981'
                ],
                [
                    'nombre' => 'Gestión del Talento',
                    'descripcion' => 'Reclutamiento, selección y retención de talento',
                    'codigo' => 'APO-GT',
                    'color' => '#3B82F6'
                ]
            ]
        ];

        // Procesos de Evaluación
        $procesosEvaluacion = [
            [
                'nombre' => 'Auditoría Interna',
                'descripcion' => 'Evaluación de controles internos y cumplimiento normativo',
                'codigo' => 'EVA-AUD',
                'color' => '#DC2626',
                'direcciones' => ['ADM', 'FIN']
            ],
            [
                'nombre' => 'Evaluación de Desempeño',
                'descripcion' => 'Medición y evaluación del rendimiento organizacional',
                'codigo' => 'EVA-DES',
                'color' => '#059669',
                'direcciones' => ['DHH', 'ADM']
            ],
            [
                'nombre' => 'Control de Calidad',
                'descripcion' => 'Verificación y aseguramiento de la calidad de productos/servicios',
                'codigo' => 'EVA-CAL',
                'color' => '#7C3AED',
                'direcciones' => ['ING', 'ADM']
            ],
            [
                'nombre' => 'Evaluación de Riesgos',
                'descripcion' => 'Identificación, análisis y evaluación de riesgos operacionales',
                'codigo' => 'EVA-RIS',
                'color' => '#EA580C',
                'direcciones' => ['FIN', 'ADM']
            ],
            [
                'nombre' => 'Satisfacción del Cliente',
                'descripcion' => 'Medición y análisis de la satisfacción y experiencia del cliente',
                'codigo' => 'EVA-SAT',
                'color' => '#2563EB',
                'direcciones' => ['COM', 'DHH']
            ],
            [
                'nombre' => 'Evaluación de Proveedores',
                'descripcion' => 'Análisis y evaluación del desempeño de proveedores',
                'codigo' => 'EVA-PRO',
                'color' => '#0891B2',
                'direcciones' => ['ADM', 'COM']
            ]
        ];

        // Crear Procesos Estratégicos
        foreach ($procesosEstrategicos as $codigoDireccion => $procesos) {
            if (isset($direcciones[$codigoDireccion])) {
                $direccion = $direcciones[$codigoDireccion];
                
                foreach ($procesos as $proceso) {
                    $procesoModel = Proceso::create([
                        'nombre' => $proceso['nombre'],
                        'descripcion' => $proceso['descripcion'],
                        'tipo' => 'estrategico',
                        'codigo' => $proceso['codigo'],
                        'color' => $proceso['color'],
                        'activo' => true
                    ]);

                    $procesoModel->direcciones()->attach($direccion->id);
                }
            }
        }

        // Crear Procesos Misionales
        foreach ($procesosMisionales as $proceso) {
            $procesoModel = Proceso::create([
                'nombre' => $proceso['nombre'],
                'descripcion' => $proceso['descripcion'],
                'tipo' => 'misional',
                'codigo' => $proceso['codigo'],
                'color' => $proceso['color'],
                'activo' => true
            ]);

            // Asociar con múltiples direcciones
            foreach ($proceso['direcciones'] as $codigoDireccion) {
                if (isset($direcciones[$codigoDireccion])) {
                    $procesoModel->direcciones()->attach($direcciones[$codigoDireccion]->id);
                }
            }
        }

        // Crear Procesos de Apoyo
        foreach ($procesosApoyo as $codigoDireccion => $procesos) {
            if (isset($direcciones[$codigoDireccion])) {
                $direccion = $direcciones[$codigoDireccion];
                
                foreach ($procesos as $proceso) {
                    $procesoModel = Proceso::create([
                        'nombre' => $proceso['nombre'],
                        'descripcion' => $proceso['descripcion'],
                        'tipo' => 'apoyo',
                        'codigo' => $proceso['codigo'],
                        'color' => $proceso['color'],
                        'activo' => true
                    ]);

                    $procesoModel->direcciones()->attach($direccion->id);
                }
            }
        }

        // Crear Procesos de Evaluación
        foreach ($procesosEvaluacion as $proceso) {
            $procesoModel = Proceso::create([
                'nombre' => $proceso['nombre'],
                'descripcion' => $proceso['descripcion'],
                'tipo' => 'evaluacion',
                'codigo' => $proceso['codigo'],
                'color' => $proceso['color'],
                'activo' => true
            ]);

            // Asociar con múltiples direcciones
            foreach ($proceso['direcciones'] as $codigoDireccion) {
                if (isset($direcciones[$codigoDireccion])) {
                    $procesoModel->direcciones()->attach($direcciones[$codigoDireccion]->id);
                }
            }
        }
    }
}
