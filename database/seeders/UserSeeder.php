<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('name', 'admin')->first();
        User::updateOrCreate(
            ['email' => 'victor@intiled.com'],
            [
                'name' => 'Victor',
                'password' => Hash::make('password'),
                'role_id' => $adminRole->id,
                'is_active' => true,
            ]
        );

        $userRole = Role::where('name', 'user')->first();
        User::updateOrCreate(
            ['email' => 'usuario@intiled.com'],
            [
                'name' => 'Usuario Ejemplo',
                'password' => Hash::make('password'),
                'role_id' => $userRole->id,
                'is_active' => true,
            ]
        );
    }
}
