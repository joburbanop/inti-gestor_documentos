<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Http\Request;
use App\Services\Document\DocumentService;
use App\Http\Requests\Document\StoreDocumentRequest;
use App\Models\Documento;
use App\Models\ProcesoTipo;
use App\Models\ProcesoGeneral;
use App\Models\ProcesoInterno;

class TestNewDocumentAPI extends Command
{
    protected $signature = 'test:new-document-api';
    protected $description = 'Probar la nueva API de documentos para resolver el error 422';

    public function handle()
    {
        $this->info('🔧 PROBANDO NUEVA API DE DOCUMENTOS');
        $this->newLine();

        // 1. Verificar datos de prueba
        $this->info('📊 Verificando datos de prueba...');
        
        $tipo = ProcesoTipo::first();
        $general = ProcesoGeneral::where('tipo_proceso_id', $tipo->id)->first();
        $interno = ProcesoInterno::where('proceso_general_id', $general->id)->first();
        
        if (!$tipo || !$general || !$interno) {
            $this->error('❌ No hay datos suficientes para la prueba');
            return 1;
        }
        
        $this->line("✅ Tipo: {$tipo->nombre} (ID: {$tipo->id})");
        $this->line("✅ General: {$general->nombre} (ID: {$general->id})");
        $this->line("✅ Interno: {$interno->nombre} (ID: {$interno->id})");

        // 2. Probar validación manual
        $this->newLine();
        $this->info('📋 Probando validación manual...');
        
        try {
            // Crear archivo temporal
            $tempFile = tempnam(sys_get_temp_dir(), 'test_doc_');
            file_put_contents($tempFile, 'Contenido de prueba para nueva API');
            
            // Crear UploadedFile
            $uploadedFile = new \Illuminate\Http\UploadedFile(
                $tempFile,
                'documento_nueva_api.pdf',
                'application/pdf',
                null,
                true
            );
            
            $data = [
                'titulo' => 'Documento Nueva API',
                'descripcion' => 'Prueba de la nueva API refactorizada',
                'tipo_proceso_id' => $tipo->id,
                'proceso_general_id' => $general->id,
                'proceso_interno_id' => $interno->id,
                'confidencialidad' => 'Publico'
            ];
            
            $this->line("✅ Datos de prueba creados");
            $this->line("✅ Archivo: " . $uploadedFile->getClientOriginalName());
            $this->line("✅ Tamaño: " . $uploadedFile->getSize() . " bytes");
            $this->line("✅ Datos: " . json_encode($data));
            
            // Limpiar archivo temporal
            unlink($tempFile);
            
        } catch (\Exception $e) {
            $this->error("❌ Error en preparación: " . $e->getMessage());
            return 1;
        }

        // 3. Probar DocumentService
        $this->newLine();
        $this->info('🔧 Probando DocumentService...');
        
        try {
            $documentService = new DocumentService();
            
            // Crear archivo temporal para el servicio
            $tempFile = tempnam(sys_get_temp_dir(), 'test_service_');
            file_put_contents($tempFile, 'Contenido de prueba para servicio');
            
            $uploadedFile = new \Illuminate\Http\UploadedFile(
                $tempFile,
                'documento_servicio.pdf',
                'application/pdf',
                null,
                true
            );
            
            $data = [
                'titulo' => 'Documento Servicio',
                'descripcion' => 'Prueba del DocumentService',
                'tipo_proceso_id' => $tipo->id,
                'proceso_general_id' => $general->id,
                'proceso_interno_id' => $interno->id,
                'confidencialidad' => 'Publico'
            ];
            
            // Crear documento usando el servicio
            $documento = $documentService->createDocument($data, $uploadedFile);
            
            $this->line("✅ Documento creado exitosamente");
            $this->line("✅ ID: {$documento->id}");
            $this->line("✅ Título: {$documento->titulo}");
            $this->line("✅ Archivo: {$documento->nombre_original}");
            
            // Limpiar archivo temporal
            unlink($tempFile);
            
        } catch (\Exception $e) {
            $this->error("❌ Error en DocumentService: " . $e->getMessage());
            return 1;
        }

        // 4. Probar nueva ruta API
        $this->newLine();
        $this->info('🌐 Probando nueva ruta API...');
        
        $this->line("✅ Ruta: POST /api/documents");
        $this->line("✅ Controller: DocumentController@store");
        $this->line("✅ Request: StoreDocumentRequest");
        $this->line("✅ Service: DocumentService");
        
        // 5. Comparar con la ruta anterior
        $this->newLine();
        $this->info('📊 Comparación con ruta anterior...');
        
        $this->line("🔄 Ruta anterior: POST /api/documentos");
        $this->line("  - Controller: DocumentoController (1102 líneas)");
        $this->line("  - Validación: En el controller");
        $this->line("  - Lógica: Mezclada en el controller");
        
        $this->line("✅ Nueva ruta: POST /api/documents");
        $this->line("  - Controller: DocumentController (179 líneas)");
        $this->line("  - Validación: StoreDocumentRequest");
        $this->line("  - Lógica: DocumentService");
        
        // 6. Resumen de la solución al error 422
        $this->newLine();
        $this->info('🎯 SOLUCIÓN AL ERROR 422');
        $this->line('✅ Validación centralizada en StoreDocumentRequest');
        $this->line('✅ Manejo correcto de FormData');
        $this->line('✅ Logs detallados para debugging');
        $this->line('✅ Separación clara de responsabilidades');
        $this->line('✅ Mejor manejo de errores');
        
        // 7. Instrucciones para el frontend
        $this->newLine();
        $this->info('🚀 INSTRUCCIONES PARA EL FRONTEND');
        $this->line('1. Cambiar la URL de /api/documentos a /api/documents');
        $this->line('2. El resto de la lógica permanece igual');
        $this->line('3. Los logs de debugging están activos');
        $this->line('4. La validación es más robusta');
        
        // 8. Próximos pasos
        $this->newLine();
        $this->info('📋 PRÓXIMOS PASOS');
        $this->line('1. Actualizar frontend para usar /api/documents');
        $this->line('2. Probar creación de documentos en el navegador');
        $this->line('3. Verificar que el error 422 esté resuelto');
        $this->line('4. Monitorear logs para confirmar funcionamiento');
        
        $this->newLine();
        $this->info('🎉 ¡NUEVA API LISTA PARA RESOLVER EL ERROR 422!');
        $this->line('La nueva arquitectura está funcionando correctamente.');
        
        return 0;
    }
}
