<?php

namespace Database\Seeders;

use App\Models\Direccion;
use App\Models\ProcesoApoyo;
use Illuminate\Database\Seeder;

class ProcesoApoyoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener las direcciones
        $direcciones = Direccion::all()->keyBy('codigo');

        $procesos = [
            // Dirección Administrativa
            'ADM' => [
                [
                    'nombre' => 'Gestión de Recursos Humanos',
                    'descripcion' => 'Procesos de contratación, nómina y gestión del personal',
                    'codigo' => 'ADM-RH',
                    'orden' => 1
                ],
                [
                    'nombre' => 'Servicios Generales',
                    'descripcion' => 'Mantenimiento, limpieza y servicios de apoyo',
                    'codigo' => 'ADM-SG',
                    'orden' => 2
                ],
                [
                    'nombre' => 'Gestión Documental',
                    'descripcion' => 'Archivo, control y gestión de documentos administrativos',
                    'codigo' => 'ADM-GD',
                    'orden' => 3
                ]
            ],

            // Dirección de Ingeniería
            'ING' => [
                [
                    'nombre' => 'Diseño y Planificación',
                    'descripcion' => 'Procesos de diseño, planificación y desarrollo de proyectos',
                    'codigo' => 'ING-DP',
                    'orden' => 1
                ],
                [
                    'nombre' => 'Construcción y Supervisión',
                    'descripcion' => 'Control de obra, supervisión y gestión de construcción',
                    'codigo' => 'ING-CS',
                    'orden' => 2
                ],
                [
                    'nombre' => 'Gestión de Proyectos',
                    'descripcion' => 'Coordinación, seguimiento y control de proyectos',
                    'codigo' => 'ING-GP',
                    'orden' => 3
                ]
            ],

            // Dirección Financiera
            'FIN' => [
                [
                    'nombre' => 'Contabilidad',
                    'descripcion' => 'Registro contable, reportes y estados financieros',
                    'codigo' => 'FIN-CON',
                    'orden' => 1
                ],
                [
                    'nombre' => 'Tesorería',
                    'descripcion' => 'Gestión de flujo de caja y pagos',
                    'codigo' => 'FIN-TES',
                    'orden' => 2
                ],
                [
                    'nombre' => 'Presupuestos',
                    'descripcion' => 'Elaboración y control de presupuestos',
                    'codigo' => 'FIN-PRE',
                    'orden' => 3
                ]
            ],

            // Dirección Comercial
            'COM' => [
                [
                    'nombre' => 'Ventas',
                    'descripcion' => 'Gestión de ventas, clientes y contratos',
                    'codigo' => 'COM-VEN',
                    'orden' => 1
                ],
                [
                    'nombre' => 'Marketing',
                    'descripcion' => 'Estrategias de marketing y publicidad',
                    'codigo' => 'COM-MAR',
                    'orden' => 2
                ],
                [
                    'nombre' => 'Atención al Cliente',
                    'descripcion' => 'Servicio al cliente y soporte post-venta',
                    'codigo' => 'COM-AC',
                    'orden' => 3
                ]
            ],

            // Dirección de Talento Humano
            'DHH' => [
                [
                    'nombre' => 'Desarrollo Organizacional',
                    'descripcion' => 'Capacitación, desarrollo y evaluación del personal',
                    'codigo' => 'DHH-DO',
                    'orden' => 1
                ],
                [
                    'nombre' => 'Bienestar Laboral',
                    'descripcion' => 'Programas de bienestar y clima organizacional',
                    'codigo' => 'DHH-BL',
                    'orden' => 2
                ],
                [
                    'nombre' => 'Gestión del Talento',
                    'descripcion' => 'Reclutamiento, selección y retención de talento',
                    'codigo' => 'DHH-GT',
                    'orden' => 3
                ]
            ]
        ];

        foreach ($procesos as $codigoDireccion => $procesosDireccion) {
            if (isset($direcciones[$codigoDireccion])) {
                $direccion = $direcciones[$codigoDireccion];
                
                foreach ($procesosDireccion as $proceso) {
                    ProcesoApoyo::create([
                        'nombre' => $proceso['nombre'],
                        'descripcion' => $proceso['descripcion'],
                        'direccion_id' => $direccion->id,
                        'codigo' => $proceso['codigo'],
                        'orden' => $proceso['orden'],
                        'activo' => true
                    ]);
                }
            }
        }
    }
} 