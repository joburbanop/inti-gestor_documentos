<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Documento;

class TestSimplePagination extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:simple-pagination {page=1} {per_page=5} {extensiones?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Prueba simple de paginación con Eloquent';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🧪 Probando paginación simple con Eloquent...');

        $page = (int) $this->argument('page');
        $perPage = (int) $this->argument('per_page');
        $extensiones = $this->argument('extensiones');

        $this->info("🔍 Parámetros: page=$page, per_page=$perPage, extensiones=$extensiones");

        $query = Documento::with(['direccion:id,nombre,codigo', 'procesoApoyo:id,nombre,codigo', 'subidoPor:id,name']);

        if ($extensiones) {
            $extArray = explode(',', $extensiones);
            $query->porExtensiones($extArray);
        }

        $documentos = $query->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);

        $this->info('✅ Paginación funcionando correctamente');
        $this->info('📄 Documentos encontrados: ' . count($documentos->items()));
        $this->info('📊 Información de paginación:');
        $this->info('   - Página actual: ' . $documentos->currentPage());
        $this->info('   - Última página: ' . $documentos->lastPage());
        $this->info('   - Por página: ' . $documentos->perPage());
        $this->info('   - Total: ' . $documentos->total());

        if (!empty($documentos->items())) {
            $this->info('📋 Documentos en esta página:');
            foreach ($documentos->items() as $doc) {
                $this->info('   - ' . $doc->titulo . ' (' . $doc->extension . ')');
            }
        }
    }
}
