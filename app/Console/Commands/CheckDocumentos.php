<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Documento;
use App\Models\Direccion;
use App\Models\ProcesoApoyo;
use Illuminate\Support\Facades\Cache;

class CheckDocumentos extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'documentos:check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verificar datos reales de documentos en la base de datos';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Verificando datos reales de documentos...');
        
        // Limpiar caché primero
        Cache::forget('dashboard_estadisticas');
        Cache::forget('total_documentos');
        Cache::forget('total_direcciones');
        Cache::forget('total_procesos');
        
        $this->info('✅ Caché limpiada');
        
        // Obtener datos reales
        $totalDocumentos = Documento::count();
        $totalDirecciones = Direccion::where('activo', true)->count();
        $totalProcesos = ProcesoApoyo::where('activo', true)->count();
        
        // Mostrar estadísticas
        $this->table(
            ['Métrica', 'Valor Real', 'Valor en Caché'],
            [
                ['Total Documentos', $totalDocumentos, Cache::get('total_documentos', 'No cacheado')],
                ['Total Direcciones', $totalDirecciones, Cache::get('total_direcciones', 'No cacheado')],
                ['Total Procesos', $totalProcesos, Cache::get('total_procesos', 'No cacheado')],
            ]
        );
        
        // Mostrar documentos recientes
        $this->info('📄 Documentos recientes:');
        $documentos = Documento::with(['direccion', 'procesoApoyo', 'subidoPor'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
            
        if ($documentos->isEmpty()) {
            $this->warn('No hay documentos en la base de datos');
        } else {
            $documentosData = $documentos->map(function ($doc) {
                return [
                    'ID' => $doc->id,
                    'Título' => $doc->titulo,
                    'Dirección' => optional($doc->direccion)->nombre ?? 'N/A',
                    'Proceso' => optional($doc->procesoApoyo)->nombre ?? 'N/A',
                    'Creado' => $doc->created_at->format('Y-m-d H:i:s'),
                    'Tamaño' => $doc->tamaño_formateado,
                ];
            });
            
            $this->table(
                ['ID', 'Título', 'Dirección', 'Proceso', 'Creado', 'Tamaño'],
                $documentosData->toArray()
            );
        }
        
        // Verificar caché después de limpiar
        $this->info('🔄 Regenerando caché...');
        
        // Forzar regeneración de caché
        $estadisticas = [
            'total_documentos' => $totalDocumentos,
            'total_direcciones' => $totalDirecciones,
            'total_procesos' => $totalProcesos
        ];
        
        Cache::put('dashboard_estadisticas', $estadisticas, 120);
        Cache::put('total_documentos', $totalDocumentos, 60);
        Cache::put('total_direcciones', $totalDirecciones, 60);
        Cache::put('total_procesos', $totalProcesos, 60);
        
        $this->info('✅ Caché regenerada con datos actualizados');
        
        // Verificar API endpoint
        $this->info('🌐 Verificando endpoint de estadísticas...');
        
        try {
            $response = app()->handle(\Illuminate\Http\Request::create('/api/documentos/estadisticas', 'GET'));
            $data = json_decode($response->getContent(), true);
            
            if ($data['success']) {
                $this->info('✅ API endpoint funcionando correctamente');
                $this->table(
                    ['Métrica', 'API Response'],
                    [
                        ['Total Documentos', $data['data']['total_documentos']],
                        ['Total Direcciones', $data['data']['total_direcciones']],
                        ['Total Procesos', $data['data']['total_procesos']],
                    ]
                );
            } else {
                $this->error('❌ Error en API endpoint: ' . $data['message']);
            }
        } catch (\Exception $e) {
            $this->error('❌ Error al verificar API: ' . $e->getMessage());
        }
        
        return 0;
    }
}
