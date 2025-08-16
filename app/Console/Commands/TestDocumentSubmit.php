<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ProcesoTipo;
use App\Models\ProcesoGeneral;
use App\Models\ProcesoInterno;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TestDocumentSubmit extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:document-submit';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Simular el envío de datos del formulario de documentos';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('📝 Simulando Envío de Formulario...');
        $this->newLine();

        // 1. Obtener datos de ejemplo
        $tipoProceso = ProcesoTipo::first();
        $procesoGeneral = ProcesoGeneral::where('tipo_proceso_id', $tipoProceso->id)->first();
        $procesoInterno = ProcesoInterno::where('proceso_general_id', $procesoGeneral->id)->first();

        $this->info('📊 Datos de Ejemplo:');
        $this->line("📁 Tipo de Proceso: {$tipoProceso->nombre} (ID: {$tipoProceso->id})");
        $this->line("🏢 Proceso General: {$procesoGeneral->nombre} (ID: {$procesoGeneral->id})");
        $this->line("📂 Proceso Interno: {$procesoInterno->nombre} (ID: {$procesoInterno->id})");

        $this->newLine();

        // 2. Simular datos del formulario
        $formData = [
            'titulo' => 'Documento de Prueba',
            'descripcion' => 'Descripción de prueba',
            'tipo_proceso_id' => $tipoProceso->id,
            'proceso_general_id' => $procesoGeneral->id,
            'proceso_interno_id' => $procesoInterno->id,
            'confidencialidad' => 'Publico'
        ];

        $this->info('📋 Datos del Formulario:');
        foreach ($formData as $key => $value) {
            $this->line("  ├── {$key}: {$value}");
        }

        $this->newLine();

        // 3. Probar validación
        $this->info('🔍 Probando Validación:');
        
        $validator = Validator::make($formData, [
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'archivo' => 'required|file|max:8192',
            'tipo_proceso_id' => 'required|exists:tipos_procesos,id',
            'proceso_general_id' => 'required|exists:procesos_generales,id',
            'proceso_interno_id' => 'required|exists:procesos_internos,id',
            'confidencialidad' => 'nullable|string|in:Publico,Interno'
        ], [
            'titulo.required' => 'El título es obligatorio',
            'archivo.required' => 'El archivo es obligatorio',
            'archivo.max' => 'El archivo no puede ser mayor a 8MB (temporalmente)',
            'tipo_proceso_id.required' => 'El tipo de proceso es obligatorio',
            'proceso_general_id.required' => 'El proceso general es obligatorio',
            'proceso_interno_id.required' => 'El proceso interno es obligatorio'
        ]);

        if ($validator->fails()) {
            $this->error('❌ Errores de validación:');
            foreach ($validator->errors()->toArray() as $field => $errors) {
                $this->line("  ├── {$field}: " . implode(', ', $errors));
            }
        } else {
            $this->info('✅ Validación exitosa');
        }

        $this->newLine();

        // 4. Probar validación sin archivo
        $this->info('🔍 Probando Validación SIN archivo:');
        
        $formDataSinArchivo = $formData;
        unset($formDataSinArchivo['archivo']);
        
        $validatorSinArchivo = Validator::make($formDataSinArchivo, [
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'archivo' => 'required|file|max:8192',
            'tipo_proceso_id' => 'required|exists:tipos_procesos,id',
            'proceso_general_id' => 'required|exists:procesos_generales,id',
            'proceso_interno_id' => 'required|exists:procesos_internos,id',
            'confidencialidad' => 'nullable|string|in:Publico,Interno'
        ], [
            'titulo.required' => 'El título es obligatorio',
            'archivo.required' => 'El archivo es obligatorio',
            'archivo.max' => 'El archivo no puede ser mayor a 8MB (temporalmente)',
            'tipo_proceso_id.required' => 'El tipo de proceso es obligatorio',
            'proceso_general_id.required' => 'El proceso general es obligatorio',
            'proceso_interno_id.required' => 'El proceso interno es obligatorio'
        ]);

        if ($validatorSinArchivo->fails()) {
            $this->error('❌ Errores de validación (sin archivo):');
            foreach ($validatorSinArchivo->errors()->toArray() as $field => $errors) {
                $this->line("  ├── {$field}: " . implode(', ', $errors));
            }
        } else {
            $this->info('✅ Validación exitosa (sin archivo)');
        }

        $this->newLine();

        // 5. Verificar jerarquía
        $this->info('🔗 Verificando Jerarquía:');
        
        // Verificar que el proceso interno pertenece al proceso general
        $procesoInternoCheck = ProcesoInterno::find($procesoInterno->id);
        if ($procesoInternoCheck->proceso_general_id == $procesoGeneral->id) {
            $this->line("✅ Proceso interno pertenece al proceso general");
        } else {
            $this->error("❌ Proceso interno NO pertenece al proceso general");
        }

        // Verificar que el proceso general pertenece al tipo de proceso
        $procesoGeneralCheck = ProcesoGeneral::find($procesoGeneral->id);
        if ($procesoGeneralCheck->tipo_proceso_id == $tipoProceso->id) {
            $this->line("✅ Proceso general pertenece al tipo de proceso");
        } else {
            $this->error("❌ Proceso general NO pertenece al tipo de proceso");
        }

        $this->newLine();

        // 6. Conclusión
        $this->info('📋 Conclusión:');
        $this->line('✅ Los datos de jerarquía son válidos');
        $this->line('❌ El problema es que falta el archivo en la validación');
        $this->line('💡 El frontend debe enviar el archivo como FormData');
        $this->line('💡 El backend espera un archivo real, no solo los datos del formulario');

        $this->newLine();
        $this->info('🎯 Solución:');
        $this->info('El formulario debe enviar los datos como FormData con el archivo incluido');
        $this->info('El frontend debe usar FormData para enviar archivos + datos del formulario');
    }
}
