<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Documento;
use Illuminate\Http\Request;

class TestExtensionFiltering extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:extension-filtering {extension=pdf}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Probar el filtrado por extensiones';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $extension = $this->argument('extension');
        
        $this->info("🔍 Probando filtrado por extensión: .{$extension}");
        
        // Mostrar todos los documentos primero
        $this->info("\n📊 Todos los documentos en la base de datos:");
        $allDocs = Documento::all();
        $this->info("   Total de documentos: {$allDocs->count()}");
        
        // Mostrar extensiones disponibles
        $this->info("\n📊 Extensiones disponibles:");
        $extensions = Documento::selectRaw('extension, COUNT(*) as total')
                              ->whereNotNull('extension')
                              ->where('extension', '!=', '')
                              ->groupBy('extension')
                              ->orderBy('total', 'desc')
                              ->get();
        
        foreach ($extensions as $ext) {
            $this->line("   .{$ext->extension}: {$ext->total} documentos");
        }
        
        // Probar scope directo
        $this->info("\n📊 Probando scope porExtension:");
        $docs = Documento::porExtension($extension)->get();
        $this->info("   Documentos con extensión .{$extension}: {$docs->count()}");
        
        if ($docs->count() > 0) {
            $this->info("   Ejemplos:");
            $docs->take(3)->each(function ($doc) {
                $this->line("     - {$doc->titulo} (.{$doc->extension}) - ID: {$doc->id}");
            });
        }
        
        // Probar scope con array
        $this->info("\n📊 Probando scope porExtensiones (array):");
        $docsArray = Documento::porExtensiones([$extension])->get();
        $this->info("   Documentos con extensión .{$extension} (array): {$docsArray->count()}");
        
        // Probar múltiples extensiones
        $this->info("\n📊 Probando múltiples extensiones:");
        $docsMulti = Documento::porExtensiones(['pdf', 'docx', 'xlsx'])->get();
        $this->info("   Documentos con extensiones .pdf, .docx, .xlsx: {$docsMulti->count()}");
        
        // Probar endpoint API simulado
        $this->info("\n🌐 Probando endpoint API simulado:");
        $request = new Request(['extensiones' => [$extension]]);
        $controller = new \App\Http\Controllers\Api\DocumentoController();
        
        try {
            $response = $controller->index($request);
            $data = json_decode($response->getContent(), true);
            
            if ($data['success']) {
                $documentos = $data['data']['documentos'] ?? $data['data'] ?? [];
                $this->info("   API retornó: " . count($documentos) . " documentos");
                
                if (count($documentos) > 0) {
                    $this->info("   Primer documento: " . $documentos[0]['titulo'] ?? 'Sin título');
                    $this->info("   Extensión del primer documento: " . ($documentos[0]['extension'] ?? 'Sin extensión'));
                }
            } else {
                $this->error("   Error en API: " . ($data['message'] ?? 'Error desconocido'));
            }
        } catch (\Exception $e) {
            $this->error("   Excepción en API: " . $e->getMessage());
        }
        
        // Probar con el documento específico mencionado
        $this->info("\n🔍 Buscando documento específico 'INGRESO PDF':");
        $ingresoPdf = Documento::where('titulo', 'LIKE', '%INGRESO PDF%')->first();
        if ($ingresoPdf) {
            $this->info("   Encontrado: {$ingresoPdf->titulo}");
            $this->info("   Extensión: .{$ingresoPdf->extension}");
            $this->info("   ID: {$ingresoPdf->id}");
            
            // Verificar si aparece en el filtro
            $shouldAppear = Documento::porExtension($ingresoPdf->extension)->where('id', $ingresoPdf->id)->exists();
            $this->info("   ¿Aparece en filtro por .{$ingresoPdf->extension}?: " . ($shouldAppear ? 'SÍ' : 'NO'));
        } else {
            $this->warn("   No se encontró el documento 'INGRESO PDF'");
        }
        
        $this->info("\n✅ Prueba completada!");
    }
}
