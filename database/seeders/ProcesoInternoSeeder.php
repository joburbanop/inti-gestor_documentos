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
        $procesosGenerales = ProcesoGeneral::all()->keyBy('codigo');

        // Procesos Internos para cada proceso general
        $procesosInternos = [
            'ADM' => [
                [
                    'nombre' => 'Gestión Administrativa',
                    'descripcion' => 'Procesos administrativos internos de la dirección',
                    'codigo' => 'INT-ADM-01',
                    'color' => '#3B82F6'
                ],
                [
                    'nombre' => 'Control Interno',
                    'descripcion' => 'Procesos de control y auditoría interna',
                    'codigo' => 'INT-ADM-02',
                    'color' => '#10B981'
                ],
                [
                    'nombre' => 'Gestión de Recursos Humanos',
                    'descripcion' => 'Procesos de contratación, nómina y gestión del personal',
                    'codigo' => 'INT-ADM-03',
                    'color' => '#F59E0B'
                ],
                [
                    'nombre' => 'Servicios Generales',
                    'descripcion' => 'Mantenimiento, limpieza y servicios de apoyo',
                    'codigo' => 'INT-ADM-04',
                    'color' => '#8B5CF6'
                ],
                [
                    'nombre' => 'Gestión Documental',
                    'descripcion' => 'Archivo, control y gestión de documentos administrativos',
                    'codigo' => 'INT-ADM-05',
                    'color' => '#EF4444'
                ]
            ],
            'ING' => [
                [
                    'nombre' => 'Desarrollo Técnico',
                    'descripcion' => 'Procesos de desarrollo técnico interno',
                    'codigo' => 'INT-ING-01',
                    'color' => '#8B5CF6'
                ],
                [
                    'nombre' => 'Innovación Interna',
                    'descripcion' => 'Procesos de innovación y mejora continua',
                    'codigo' => 'INT-ING-02',
                    'color' => '#F59E0B'
                ],
                [
                    'nombre' => 'Diseño y Planificación',
                    'descripcion' => 'Procesos de diseño, planificación y desarrollo de proyectos',
                    'codigo' => 'INT-ING-03',
                    'color' => '#06B6D4'
                ],
                [
                    'nombre' => 'Construcción y Supervisión',
                    'descripcion' => 'Control de obra, supervisión y gestión de construcción',
                    'codigo' => 'INT-ING-04',
                    'color' => '#84CC16'
                ],
                [
                    'nombre' => 'Gestión de Proyectos',
                    'descripcion' => 'Coordinación, seguimiento y control de proyectos',
                    'codigo' => 'INT-ING-05',
                    'color' => '#F97316'
                ]
            ],
            'FIN' => [
                [
                    'nombre' => 'Contabilidad Interna',
                    'descripcion' => 'Procesos contables internos',
                    'codigo' => 'INT-FIN-01',
                    'color' => '#EF4444'
                ],
                [
                    'nombre' => 'Control Financiero',
                    'descripcion' => 'Procesos de control financiero interno',
                    'codigo' => 'INT-FIN-02',
                    'color' => '#06B6D4'
                ],
                [
                    'nombre' => 'Contabilidad',
                    'descripcion' => 'Registro contable, reportes y estados financieros',
                    'codigo' => 'INT-FIN-03',
                    'color' => '#84CC16'
                ],
                [
                    'nombre' => 'Tesorería',
                    'descripcion' => 'Gestión de flujo de caja y pagos',
                    'codigo' => 'INT-FIN-04',
                    'color' => '#F97316'
                ],
                [
                    'nombre' => 'Presupuestos',
                    'descripcion' => 'Elaboración y control de presupuestos',
                    'codigo' => 'INT-FIN-05',
                    'color' => '#EC4899'
                ]
            ],
            'COM' => [
                [
                    'nombre' => 'Gestión Comercial',
                    'descripcion' => 'Procesos comerciales internos',
                    'codigo' => 'INT-COM-01',
                    'color' => '#84CC16'
                ],
                [
                    'nombre' => 'Mercadeo Interno',
                    'descripcion' => 'Procesos de mercadeo interno',
                    'codigo' => 'INT-COM-02',
                    'color' => '#F97316'
                ],
                [
                    'nombre' => 'Ventas',
                    'descripcion' => 'Gestión de ventas, clientes y contratos',
                    'codigo' => 'INT-COM-03',
                    'color' => '#6366F1'
                ],
                [
                    'nombre' => 'Marketing',
                    'descripcion' => 'Estrategias de marketing y publicidad',
                    'codigo' => 'INT-COM-04',
                    'color' => '#14B8A6'
                ],
                [
                    'nombre' => 'Atención al Cliente',
                    'descripcion' => 'Servicio al cliente y soporte post-venta',
                    'codigo' => 'INT-COM-05',
                    'color' => '#F59E0B'
                ]
            ],
            'DHH' => [
                [
                    'nombre' => 'Gestión del Talento',
                    'descripcion' => 'Procesos internos de gestión del talento',
                    'codigo' => 'INT-DHH-01',
                    'color' => '#EC4899'
                ],
                [
                    'nombre' => 'Desarrollo Organizacional',
                    'descripcion' => 'Procesos de desarrollo organizacional interno',
                    'codigo' => 'INT-DHH-02',
                    'color' => '#6366F1'
                ],
                [
                    'nombre' => 'Capacitación y Desarrollo',
                    'descripcion' => 'Capacitación, desarrollo y evaluación del personal',
                    'codigo' => 'INT-DHH-03',
                    'color' => '#8B5CF6'
                ],
                [
                    'nombre' => 'Bienestar Laboral',
                    'descripcion' => 'Programas de bienestar y clima organizacional',
                    'codigo' => 'INT-DHH-04',
                    'color' => '#10B981'
                ],
                [
                    'nombre' => 'Reclutamiento y Selección',
                    'descripcion' => 'Reclutamiento, selección y retención de talento',
                    'codigo' => 'INT-DHH-05',
                    'color' => '#3B82F6'
                ]
            ]
        ];

        // Crear Procesos Internos
        foreach ($procesosInternos as $codigoProcesoGeneral => $procesos) {
            if (isset($procesosGenerales[$codigoProcesoGeneral])) {
                $procesoGeneral = $procesosGenerales[$codigoProcesoGeneral];
                
                foreach ($procesos as $proceso) {
                    ProcesoInterno::updateOrCreate(
                        ['codigo' => $proceso['codigo']],
                        [
                            'nombre' => $proceso['nombre'],
                            'descripcion' => $proceso['descripcion'],
                            'codigo' => $proceso['codigo'],
                            'color' => $proceso['color'],
                            'proceso_general_id' => $procesoGeneral->id,
                            'activo' => true
                        ]
                    );
                }
            }
        }
    }
}
