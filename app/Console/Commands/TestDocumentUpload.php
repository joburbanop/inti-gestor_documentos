<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Documento;
use App\Models\Direccion;
use App\Models\ProcesoApoyo;
use App\Models\User;
use Illuminate\Support\Str;

class TestDocumentUpload extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:document-upload {extension=pdf}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Simular subida de documento y verificar actualización de estadísticas';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $extension = $this->argument('extension');
        
        $this->info("🧪 Simulando subida de documento .{$extension}...");
        
        // Mostrar estadísticas antes
        $this->info("\n📊 Estadísticas ANTES de la subida:");
        $this->mostrarEstadisticas();
        
        // Crear documento de prueba
        $direccion = Direccion::where('activo', true)->first();
        $proceso = ProcesoApoyo::where('activo', true)->first();
        $user = User::first();
        
        if (!$direccion || !$proceso || !$user) {
            $this->error('❌ No hay direcciones, procesos o usuarios disponibles.');
            return;
        }
        
        $titulo = "Documento de prueba {$extension} - " . now()->format('Y-m-d H:i:s');
        
        $documento = Documento::create([
            'titulo' => $titulo,
            'descripcion' => "Documento de prueba para verificar actualización de estadísticas - {$extension}",
            'nombre_archivo' => "test_document_{$extension}.{$extension}",
            'nombre_original' => "test_document_{$extension}.{$extension}",
            'ruta_archivo' => "documentos/test/test_document_{$extension}.{$extension}",
            'tipo_archivo' => $this->getMimeType($extension),
            'extension' => $extension,
            'tamaño_archivo' => rand(1024, 1048576), // 1KB a 1MB
            'direccion_id' => $direccion->id,
            'proceso_apoyo_id' => $proceso->id,
            'subido_por' => $user->id,
            'slug' => Str::slug($titulo),
            'tipo' => 'interno',
            'etiquetas' => ['prueba', 'test', $extension],
            'fecha_documento' => now(),
            'vigente_hasta' => now()->addDays(365),
            'confidencialidad' => 'interno',
        ]);
        
        $this->info("✅ Documento creado: {$documento->titulo}");
        
        // Mostrar estadísticas después
        $this->info("\n📊 Estadísticas DESPUÉS de la subida:");
        $this->mostrarEstadisticas();
        
        $this->info("\n🎯 Verificación:");
        $countAntes = Documento::where('extension', $extension)->count();
        $this->info("   Documentos .{$extension}: {$countAntes}");
        
        // Verificar que las estadísticas se actualizaron
        $estadisticas = Documento::getEstadisticasExtensiones();
        $extensionStat = collect($estadisticas)->firstWhere('extension', $extension);
        
        if ($extensionStat) {
            $this->info("   ✅ Estadísticas actualizadas: .{$extension} = {$extensionStat['total']} documentos");
        } else {
            $this->warn("   ⚠️  No se encontró estadística para .{$extension}");
        }
        
        $this->info("\n✅ Prueba completada!");
    }
    
    private function mostrarEstadisticas()
    {
        $estadisticas = Documento::getEstadisticasExtensiones();
        $porTipo = Documento::getEstadisticasPorTipoDocumento();
        
        $this->info("   Extensiones:");
        foreach ($estadisticas as $stat) {
            $this->line("     .{$stat['extension']}: {$stat['total']} documentos");
        }
        
        $this->info("   Tipos de documento:");
        foreach ($porTipo as $tipo => $total) {
            $this->line("     {$tipo}: {$total} documentos");
        }
    }
    
    private function getMimeType($extension): string
    {
        $mimeTypes = [
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls' => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'csv' => 'text/csv',
            'ppt' => 'application/vnd.ms-powerpoint',
            'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml',
            'mp4' => 'video/mp4',
            'avi' => 'video/x-msvideo',
            'mov' => 'video/quicktime',
            'mp3' => 'audio/mpeg',
            'wav' => 'audio/wav',
            'zip' => 'application/zip',
            'rar' => 'application/x-rar-compressed',
            '7z' => 'application/x-7z-compressed',
            'txt' => 'text/plain',
            'rtf' => 'application/rtf',
        ];

        return $mimeTypes[$extension] ?? 'application/octet-stream';
    }
}
