<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class TestFrontendEndpoints extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:frontend-endpoints';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Probar todos los endpoints utilizados por el frontend';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🧪 Probando Endpoints del Frontend...');
        $this->newLine();

        // Obtener token de autenticación
        $user = User::first();
        if (!$user) {
            $this->error('❌ No hay usuarios en la base de datos');
            return;
        }

        $token = $user->createToken('test')->plainTextToken;
        $baseUrl = 'http://127.0.0.1:8000';

        $this->info('🔑 Token de autenticación generado');
        $this->newLine();

        // Lista de endpoints a probar
        $endpoints = [
            // Endpoints principales
            ['GET', '/api/procesos-generales', 'Procesos Generales'],
            ['GET', '/api/procesos-generales/1/procesos-internos', 'Procesos Internos por General'],
            ['GET', '/api/categorias?proceso_interno_id=1', 'Categorías por Proceso Interno'],
            ['GET', '/api/documentos/etiquetas', 'Etiquetas de Documentos'],
            ['GET', '/api/documentos/tipos', 'Tipos de Documentos'],
            ['GET', '/api/dashboard/acciones-rapidas', 'Acciones Rápidas'],
            ['GET', '/api/dashboard/estadisticas', 'Estadísticas del Dashboard'],
            
            // Endpoints de creación
            ['POST', '/api/procesos-generales', 'Crear Proceso General'],
            ['POST', '/api/procesos-internos', 'Crear Proceso Interno'],
            ['POST', '/api/categorias', 'Crear Categoría'],
            ['POST', '/api/documentos', 'Crear Documento'],
        ];

        $results = [];

        foreach ($endpoints as [$method, $endpoint, $description]) {
            $this->line("🔍 Probando: {$description}");
            $this->line("   {$method} {$endpoint}");
            
            try {
                $url = $baseUrl . $endpoint;
                $headers = [
                    'Accept: application/json',
                    'Authorization: Bearer ' . $token,
                    'Content-Type: application/json'
                ];

                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
                curl_setopt($ch, CURLOPT_TIMEOUT, 10);

                if ($method === 'POST') {
                    curl_setopt($ch, CURLOPT_POST, true);
                    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([]));
                }

                $response = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);

                $responseData = json_decode($response, true);
                $success = $httpCode >= 200 && $httpCode < 300;

                if ($success) {
                    $this->line("   ✅ {$httpCode} - OK");
                    $results[] = ['✅', $description, $httpCode];
                } else {
                    $this->line("   ❌ {$httpCode} - Error");
                    $this->line("   📄 Respuesta: " . substr($response, 0, 100) . "...");
                    $results[] = ['❌', $description, $httpCode];
                }

            } catch (\Exception $e) {
                $this->line("   💥 Error: " . $e->getMessage());
                $results[] = ['💥', $description, 'ERROR'];
            }

            $this->newLine();
        }

        // Resumen
        $this->info('📊 Resumen de Pruebas:');
        $this->table(
            ['Estado', 'Endpoint', 'Código'],
            $results
        );

        $successCount = count(array_filter($results, fn($r) => $r[0] === '✅'));
        $totalCount = count($results);

        $this->newLine();
        $this->info("🎯 Resultados: {$successCount}/{$totalCount} endpoints funcionando correctamente");

        if ($successCount === $totalCount) {
            $this->info('🎉 ¡Todos los endpoints están funcionando correctamente!');
        } else {
            $this->warn('⚠️  Algunos endpoints tienen problemas. Revisa los errores arriba.');
        }

        $this->newLine();
        $this->info('🔧 Endpoints Eliminados/Actualizados:');
        $this->line('❌ /api/direcciones - Eliminado (reemplazado por /api/procesos-generales)');
        $this->line('❌ /api/direcciones/{id}/procesos-apoyo - Eliminado (reemplazado por /api/procesos-generales/{id}/procesos-internos)');
        $this->line('✅ /api/procesos-generales - Nuevo endpoint principal');
        $this->line('✅ /api/procesos-generales/{id}/procesos-internos - Nuevo endpoint jerárquico');
        $this->line('✅ /api/categorias - Nuevo endpoint para categorías');
    }
}
