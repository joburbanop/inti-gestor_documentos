<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::updateOrCreate(
            ['name' => 'admin'],
            [
                'display_name' => 'Administrador',
                'description' => 'Acceso completo al sistema',
                'permissions' => [
                    'view_documents',
                    'download_documents',
                    'upload_documents',
                    'edit_documents',
                    'delete_documents',
                    'manage_areas',
                    'manage_categories',
                    'manage_users',
                    'view_statistics'
                ],
                'is_active' => true
            ]
        );

        Role::updateOrCreate(
            ['name' => 'user'],
            [
                'display_name' => 'Usuario',
                'description' => 'Acceso limitado para ver y descargar documentos',
                'permissions' => [
                    'view_documents',
                    'download_documents'
                ],
                'is_active' => true
            ]
        );
    }
}
