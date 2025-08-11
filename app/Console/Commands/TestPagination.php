<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Documento;
use Illuminate\Http\Request;

class TestPagination extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:pagination {--page=1} {--per_page=10} {--extension=} {--extensiones=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Prueba la paginación del controlador de documentos';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🧪 Probando paginación de documentos...');

        // Crear una request simulada con query parameters
        $queryParams = [
            'per_page' => $this->option('per_page'),
            'page' => $this->option('page')
        ];
        
        if ($this->option('extension')) {
            $queryParams['extension'] = $this->option('extension');
        }
        
        if ($this->option('extensiones')) {
            $queryParams['extensiones'] = explode(',', $this->option('extensiones'));
        }
        
        $request = Request::create('/api/documentos', 'GET', $queryParams);

        $this->info('🔍 Parámetros de la request:');
        $this->info('   - page: ' . $request->get('page'));
        $this->info('   - per_page: ' . $request->get('per_page'));
        $this->info('   - extensiones: ' . json_encode($request->get('extensiones')));

        // Obtener el controlador
        $controller = new \App\Http\Controllers\Api\DocumentoController();
        
        try {
            // Llamar al método index
            $response = $controller->index($request);
            $data = json_decode($response->getContent(), true);
            
            if ($data['success']) {
                $this->info('✅ Paginación funcionando correctamente');
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
                $this->error('❌ Error en la paginación: ' . $data['message']);
            }
        } catch (\Exception $e) {
            $this->error('❌ Excepción: ' . $e->getMessage());
        }
    }
}
