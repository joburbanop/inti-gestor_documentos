<?php

namespace Database\Seeders;

use App\Models\Direccion;
use Illuminate\Database\Seeder;

class DireccionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $direcciones = [
            [
                'nombre' => 'Dirección Administrativa',
                'descripcion' => 'Gestión administrativa, recursos humanos, nómina y servicios generales',
                'codigo' => 'ADM',
                'color' => '#1F448B',
                'activo' => true
            ],
            [
                'nombre' => 'Dirección de Ingeniería',
                'descripcion' => 'Desarrollo de proyectos, ingeniería, diseño y construcción',
                'codigo' => 'ING',
                'color' => '#FF7D09',
                'activo' => true
            ],
            [
                'nombre' => 'Dirección Financiera',
                'descripcion' => 'Gestión financiera, contabilidad, tesorería y presupuestos',
                'codigo' => 'FIN',
                'color' => '#B1CC34',
                'activo' => true
            ],
            [
                'nombre' => 'Dirección Comercial',
                'descripcion' => 'Ventas, marketing, atención al cliente y desarrollo de negocio',
                'codigo' => 'COM',
                'color' => '#6B46C1',
                'activo' => true
            ],
            [
                'nombre' => 'Dirección de Talento Humano',
                'descripcion' => 'Gestión del talento humano, desarrollo organizacional y bienestar',
                'codigo' => 'DHH',
                'color' => '#059669',
                'activo' => true
            ]
        ];

        foreach ($direcciones as $direccion) {
            // Evitar duplicados por el código único
            \App\Models\Direccion::updateOrCreate(
                ['codigo' => $direccion['codigo']],
                $direccion
            );
        }
    }
} 