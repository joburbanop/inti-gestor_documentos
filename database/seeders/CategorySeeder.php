<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Area;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            // Dirección Administrativa
            [
                'name' => 'Recursos Humanos',
                'description' => 'Gestión de personal, contrataciones y desarrollo organizacional',
                'code' => 'ADM-RH',
                'area_code' => 'ADM'
            ],
            [
                'name' => 'Sistemas y Tecnología',
                'description' => 'Gestión de sistemas informáticos y soporte técnico',
                'code' => 'ADM-SIST',
                'area_code' => 'ADM'
            ],
            [
                'name' => 'Servicios Generales',
                'description' => 'Mantenimiento, limpieza y servicios de apoyo',
                'code' => 'ADM-SG',
                'area_code' => 'ADM'
            ],

            // Dirección de Ingeniería
            [
                'name' => 'Desarrollo de Software',
                'description' => 'Desarrollo de aplicaciones y sistemas informáticos',
                'code' => 'ING-DS',
                'area_code' => 'ING'
            ],
            [
                'name' => 'Infraestructura',
                'description' => 'Gestión de infraestructura tecnológica y redes',
                'code' => 'ING-INF',
                'area_code' => 'ING'
            ],
            [
                'name' => 'Proyectos',
                'description' => 'Gestión y seguimiento de proyectos de ingeniería',
                'code' => 'ING-PRO',
                'area_code' => 'ING'
            ],

            // Dirección Financiera
            [
                'name' => 'Contabilidad',
                'description' => 'Contabilidad general y reportes financieros',
                'code' => 'FIN-CON',
                'area_code' => 'FIN'
            ],
            [
                'name' => 'Tesorería',
                'description' => 'Gestión de flujo de caja y pagos',
                'code' => 'FIN-TES',
                'area_code' => 'FIN'
            ],
            [
                'name' => 'Presupuesto',
                'description' => 'Planificación y control presupuestario',
                'code' => 'FIN-PRE',
                'area_code' => 'FIN'
            ],

            // Dirección Comercial
            [
                'name' => 'Ventas',
                'description' => 'Gestión de ventas y atención al cliente',
                'code' => 'COM-VEN',
                'area_code' => 'COM'
            ],
            [
                'name' => 'Marketing',
                'description' => 'Estrategias de marketing y publicidad',
                'code' => 'COM-MAR',
                'area_code' => 'COM'
            ],
            [
                'name' => 'Servicio al Cliente',
                'description' => 'Atención y soporte a clientes',
                'code' => 'COM-SAC',
                'area_code' => 'COM'
            ],

            // Dirección de Derechos Humanos
            [
                'name' => 'Reclutamiento',
                'description' => 'Procesos de selección y contratación',
                'code' => 'RRHH-REC',
                'area_code' => 'RRHH'
            ],
            [
                'name' => 'Capacitación',
                'description' => 'Desarrollo de talento y formación',
                'code' => 'RRHH-CAP',
                'area_code' => 'RRHH'
            ],
            [
                'name' => 'Bienestar Laboral',
                'description' => 'Programas de bienestar y clima organizacional',
                'code' => 'RRHH-BL',
                'area_code' => 'RRHH'
            ]
        ];

        foreach ($categories as $categoryData) {
            $area = Area::where('code', $categoryData['area_code'])->first();
            if ($area) {
                Category::updateOrCreate(
                    ['code' => $categoryData['code']],
                    [
                        'name' => $categoryData['name'],
                        'description' => $categoryData['description'],
                        'area_id' => $area->id
                    ]
                );
            }
        }
    }
}
