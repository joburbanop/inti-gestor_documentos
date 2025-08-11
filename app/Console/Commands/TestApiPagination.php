<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Documento;
use App\Models\User;
use Illuminate\Http\Request;

class TestApiPagination extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:api-pagination {page=1} {per_page=10} {extensiones?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Prueba la API de paginación directamente';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🧪 Probando API de paginación...');

        $page = (int) $this->argument('page');
        $perPage = (int) $this->argument('per_page');
        $extensiones = $this->argument('extensiones');

        $this->info("🔍 Parámetros: page=$page, per_page=$perPage, extensiones=$extensiones");

        // Crear una request simulada
        $queryParams = [
            'per_page' => $perPage,
            'page' => $page
        ];
        
        if ($extensiones) {
            $queryParams['extensiones'] = explode(',', $extensiones);
        }
        
        $request = Request::create('/api/documentos', 'GET', $queryParams);

        // Simular autenticación (crear un usuario de prueba)
        $user = User::first();
        if (!$user) {
            $this->error('❌ No hay usuarios en la base de datos');
            return;
        }

        // Autenticar al usuario
        auth()->login($user);

        // Obtener el controlador
        $controller = new \App\Http\Controllers\Api\DocumentoController();
        
        try {
            // Llamar al método index
            $response = $controller->index($request);
            $data = json_decode($response->getContent(), true);
            
            if ($data['success']) {
                $this->info('✅ API funcionando correctamente');
                $this->info('📄 Documentos encontrados: ' . count($data['data']['documentos']));
                $this->info('📊 Información de paginación:');
                $this->info('   - Página actual: ' . $data['data']['pagination']['current_page']);
                $this->info('   - Última página: ' . $data['data']['pagination']['last_page']);
                $this->info('   - Por página: ' . $data['data']['pagination']['per_page']);
                $this->info('   - Total: ' . $data['data']['pagination']['total']);
                
                if (!empty($data['data']['documentos'])) {
                    $this->info('📋 Primeros documentos:');
                    foreach (array_slice($data['data']['documentos'], 0, 3) as $doc) {
                        $this->info('   - ' . $doc['titulo'] . ' (' . $doc['extension'] . ')');
                    }
                }
            } else {
                $this->error('❌ Error en la API: ' . $data['message']);
            }
        } catch (\Exception $e) {
            $this->error('❌ Excepción: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
        }
    }
}
