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
                    
                ],
                [
                    'nombre' => 'Servicios Generales',
                    'descripcion' => 'Mantenimiento, limpieza y servicios de apoyo',
                    'codigo' => 'ADM-SG',
                    
                ],
                [
                    'nombre' => 'Gestión Documental',
                    'descripcion' => 'Archivo, control y gestión de documentos administrativos',
                    'codigo' => 'ADM-GD',
                    
                ]
            ],

            // Dirección de Ingeniería
            'ING' => [
                [
                    'nombre' => 'Diseño y Planificación',
                    'descripcion' => 'Procesos de diseño, planificación y desarrollo de proyectos',
                    'codigo' => 'ING-DP',
                    
                ],
                [
                    'nombre' => 'Construcción y Supervisión',
                    'descripcion' => 'Control de obra, supervisión y gestión de construcción',
                    'codigo' => 'ING-CS',
                    
                ],
                [
                    'nombre' => 'Gestión de Proyectos',
                    'descripcion' => 'Coordinación, seguimiento y control de proyectos',
                    'codigo' => 'ING-GP',
                    
                ]
            ],

            // Dirección Financiera
            'FIN' => [
                [
                    'nombre' => 'Contabilidad',
                    'descripcion' => 'Registro contable, reportes y estados financieros',
                    'codigo' => 'FIN-CON',
                    
                ],
                [
                    'nombre' => 'Tesorería',
                    'descripcion' => 'Gestión de flujo de caja y pagos',
                    'codigo' => 'FIN-TES',
                    
                ],
                [
                    'nombre' => 'Presupuestos',
                    'descripcion' => 'Elaboración y control de presupuestos',
                    'codigo' => 'FIN-PRE',
                    
                ]
            ],

            // Dirección Comercial
            'COM' => [
                [
                    'nombre' => 'Ventas',
                    'descripcion' => 'Gestión de ventas, clientes y contratos',
                    'codigo' => 'COM-VEN',
                    
                ],
                [
                    'nombre' => 'Marketing',
                    'descripcion' => 'Estrategias de marketing y publicidad',
                    'codigo' => 'COM-MAR',
                    
                ],
                [
                    'nombre' => 'Atención al Cliente',
                    'descripcion' => 'Servicio al cliente y soporte post-venta',
                    'codigo' => 'COM-AC',
                    
                ]
            ],

            // Dirección de Talento Humano
            'DHH' => [
                [
                    'nombre' => 'Desarrollo Organizacional',
                    'descripcion' => 'Capacitación, desarrollo y evaluación del personal',
                    'codigo' => 'DHH-DO',
                    
                ],
                [
                    'nombre' => 'Bienestar Laboral',
                    'descripcion' => 'Programas de bienestar y clima organizacional',
                    'codigo' => 'DHH-BL',
                    
                ],
                [
                    'nombre' => 'Gestión del Talento',
                    'descripcion' => 'Reclutamiento, selección y retención de talento',
                    'codigo' => 'DHH-GT',
                    
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
                        'activo' => true
                    ]);
                }
            }
        }
    }
} 