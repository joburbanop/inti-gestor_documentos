<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Documento;

class TestExtensionFilter extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:extension-filter';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Probar el filtro por extensión de documentos';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🧪 Probando filtro por extensión...');
        
        // Obtener estadísticas generales
        $totalDocumentos = Documento::count();
        $this->info("📊 Total de documentos: {$totalDocumentos}");
        
        if ($totalDocumentos === 0) {
            $this->warn('⚠️  No hay documentos en la base de datos. Ejecuta el seeder primero.');
            return;
        }
        
        // Probar estadísticas de extensiones
        $this->info("\n📈 Estadísticas por extensión:");
        $estadisticas = Documento::getEstadisticasExtensiones();
        foreach ($estadisticas as $stat) {
            $porcentaje = $totalDocumentos > 0 ? round(($stat['total'] / $totalDocumentos) * 100, 1) : 0;
            $this->line("   .{$stat['extension']}: {$stat['total']} documentos ({$porcentaje}%)");
        }
        
        // Probar estadísticas por tipo de documento
        $this->info("\n📋 Estadísticas por tipo de documento:");
        $porTipo = Documento::getEstadisticasPorTipoDocumento();
        foreach ($porTipo as $tipo => $total) {
            $porcentaje = $totalDocumentos > 0 ? round(($total / $totalDocumentos) * 100, 1) : 0;
            $this->line("   {$tipo}: {$total} documentos ({$porcentaje}%)");
        }
        
        // Probar filtros específicos
        $this->info("\n🔍 Probando filtros específicos:");
        
        // Filtro por PDF
        $pdfs = Documento::porExtension('pdf')->count();
        $this->line("   PDFs: {$pdfs} documentos");
        
        // Filtro por múltiples extensiones
        $documentos = Documento::porExtensiones(['pdf', 'doc', 'docx'])->count();
        $this->line("   PDFs + Word: {$documentos} documentos");
        
        // Filtro por tipo de documento
        $imagenes = Documento::porTipoDocumento('imagen')->count();
        $this->line("   Imágenes: {$imagenes} documentos");
        
        // Probar extensiones disponibles
        $this->info("\n📁 Extensiones disponibles:");
        $extensiones = Documento::selectRaw('DISTINCT extension')
                               ->whereNotNull('extension')
                               ->where('extension', '!=', '')
                               ->orderBy('extension')
                               ->pluck('extension')
                               ->toArray();
        
        foreach ($extensiones as $extension) {
            $this->line("   .{$extension}");
        }
        
        $this->info("\n✅ Prueba completada exitosamente!");
    }
}
