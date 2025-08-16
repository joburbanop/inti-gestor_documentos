<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Documento;
use App\Models\ProcesoTipo;
use App\Models\ProcesoGeneral;
use App\Models\ProcesoInterno;

class TestFormDataCreation extends Command
{
    protected $signature = 'test:formdata-creation';
    protected $description = 'Prueba la creación de FormData y validación del backend para el error 422';

    public function handle()
    {
        $this->info('🔍 Analizando el problema del error 422 en creación de documentos...');
        
        // Simular datos que llegan del frontend (sin archivo)
        $this->info('📋 Simulando datos del frontend SIN archivo:');
        $requestData = [
            'titulo' => 'Documento de prueba',
            'descripcion' => 'Descripción de prueba',
            'tipo_proceso_id' => '1',
            'proceso_general_id' => '1',
            'proceso_interno_id' => '1',
            'confidencialidad' => 'Publico'
        ];
        
        $this->line('Datos simulados: ' . json_encode($requestData, JSON_PRETTY_PRINT));
        
        // Crear un Request simulado
        $request = new Request($requestData);
        
        // Simular la validación del DocumentoController
        $this->info('🔍 Probando validación del DocumentoController:');
        
        $validator = Validator::make($request->all(), [
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'archivo' => 'required|file|max:8192',
            'tipo_proceso_id' => 'required|exists:tipos_procesos,id',
            'proceso_general_id' => 'required|exists:procesos_generales,id',
            'proceso_interno_id' => 'required|exists:procesos_internos,id',
            'confidencialidad' => 'nullable|string|in:Publico,Interno'
        ]);
        
        if ($validator->fails()) {
            $this->error('❌ Validación falló (esperado):');
            foreach ($validator->errors()->all() as $error) {
                $this->line("  - {$error}");
            }
        } else {
            $this->info('✅ Validación pasó (inesperado)');
        }
        
        // Ahora simular con FormData que incluye archivo
        $this->info('📁 Simulando FormData CON archivo:');
        
        // Crear un archivo temporal para la prueba
        $tempFile = tempnam(sys_get_temp_dir(), 'test_doc_');
        file_put_contents($tempFile, 'Contenido de prueba');
        
        // Crear un UploadedFile simulado
        $uploadedFile = new \Illuminate\Http\UploadedFile(
            $tempFile,
            'documento_prueba.pdf',
            'application/pdf',
            null,
            true
        );
        
        $requestWithFile = new Request();
        $requestWithFile->files->set('archivo', $uploadedFile);
        $requestWithFile->merge($requestData);
        
        $this->line('FormData con archivo creado');
        $this->line('Archivo: ' . $uploadedFile->getClientOriginalName());
        $this->line('Tamaño: ' . $uploadedFile->getSize() . ' bytes');
        
        // Probar validación con archivo
        $validatorWithFile = Validator::make($requestWithFile->all(), [
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'archivo' => 'required|file|max:8192',
            'tipo_proceso_id' => 'required|exists:tipos_procesos,id',
            'proceso_general_id' => 'required|exists:procesos_generales,id',
            'proceso_interno_id' => 'required|exists:procesos_internos,id',
            'confidencialidad' => 'nullable|string|in:Publico,Interno'
        ]);
        
        if ($validatorWithFile->fails()) {
            $this->error('❌ Validación con archivo falló:');
            foreach ($validatorWithFile->errors()->all() as $error) {
                $this->line("  - {$error}");
            }
        } else {
            $this->info('✅ Validación con archivo pasó correctamente');
        }
        
        // Verificar datos recibidos
        $this->info('📊 Datos recibidos en el backend:');
        $this->line('all_data: ' . json_encode($requestWithFile->all()));
        $this->line('files: ' . json_encode($requestWithFile->allFiles()));
        $this->line('has_archivo: ' . ($requestWithFile->hasFile('archivo') ? 'true' : 'false'));
        $this->line('archivo_size: ' . ($requestWithFile->file('archivo') ? $requestWithFile->file('archivo')->getSize() : 'no file'));
        
        // Limpiar archivo temporal
        unlink($tempFile);
        
        $this->info('🔍 Análisis del problema:');
        $this->line('1. El frontend debe enviar FormData cuando hay archivos');
        $this->line('2. El FormData debe incluir el archivo como File object');
        $this->line('3. Laravel debe recibir el archivo como UploadedFile');
        $this->line('4. La validación debe pasar cuando el archivo está presente');
        
        $this->info('💡 Posibles causas del error 422:');
        $this->line('1. CreateForm no detecta correctamente los archivos');
        $this->line('2. FormData no se crea correctamente');
        $this->line('3. El archivo no se envía en el FormData');
        $this->line('4. Laravel no recibe el archivo correctamente');
        
        return 0;
    }
}
