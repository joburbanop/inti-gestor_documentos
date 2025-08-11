<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Documento;
use App\Models\User;
use Illuminate\Http\Request;

class TestPaginationDebug extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:pagination-debug {page=1} {per_page=10} {extensiones?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Prueba específica de paginación para debug';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🧪 Probando paginación específica...');

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

        // Simular autenticación
        $user = User::first();
        if (!$user) {
            $this->error('❌ No hay usuarios en la base de datos');
            return;
        }

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
                $this->info('   - Página solicitada: ' . $page);
                $this->info('   - Página actual en respuesta: ' . $data['data']['pagination']['current_page']);
                $this->info('   - Última página: ' . $data['data']['pagination']['last_page']);
                $this->info('   - Por página: ' . $data['data']['pagination']['per_page']);
                $this->info('   - Total: ' . $data['data']['pagination']['total']);
                
                // Verificar que la página solicitada coincida con la respuesta
                if ($page == $data['data']['pagination']['current_page']) {
                    $this->info('✅ Página solicitada coincide con la respuesta');
                } else {
                    $this->error('❌ Página solicitada NO coincide con la respuesta');
                }
                
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
        }
    }
}
