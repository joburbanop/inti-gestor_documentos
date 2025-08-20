<?php

namespace App\Http\Requests\Document;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreDocumentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string|max:1000',
            // Alinear con límites de subida (hasta 50MB)
            'archivo' => 'required|file|max:51200', // 50MB
            'tipo_proceso_id' => 'required|exists:tipos_procesos,id',
            'proceso_general_id' => 'required|exists:procesos_generales,id',
            'proceso_interno_id' => 'required|exists:procesos_internos,id',
            'confidencialidad' => 'nullable|string|in:Publico,Interno'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'titulo.required' => 'El título es obligatorio',
            'titulo.max' => 'El título no puede tener más de 255 caracteres',
            'descripcion.max' => 'La descripción no puede tener más de 1000 caracteres',
            'archivo.required' => 'El archivo es obligatorio',
            'archivo.file' => 'El archivo debe ser un archivo válido',
            'archivo.max' => 'El archivo no puede ser mayor a 50MB',
            'tipo_proceso_id.required' => 'El tipo de proceso es obligatorio',
            'tipo_proceso_id.exists' => 'El tipo de proceso seleccionado no existe',
            'proceso_general_id.required' => 'El proceso general es obligatorio',
            'proceso_general_id.exists' => 'El proceso general seleccionado no existe',
            'proceso_interno_id.required' => 'El proceso interno es obligatorio',
            'proceso_interno_id.exists' => 'El proceso interno seleccionado no existe',
            'confidencialidad.in' => 'La confidencialidad debe ser Público o Interno'
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422)
        );
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Log de datos originales recibidos
        \Log::info('📝 [StoreDocumentRequest] Datos originales recibidos:', [
            'all_data' => $this->all(),
            'files' => $this->allFiles(),
            'has_archivo' => $this->hasFile('archivo'),
            'archivo_size' => $this->file('archivo') ? $this->file('archivo')->getSize() : 'no file',
            'content_type' => $this->header('Content-Type'),
            'method' => $this->method(),
            'url' => $this->url(),
            'raw_input' => $this->getContent(),
            'request_size' => $this->header('Content-Length'),
            'request_headers' => $this->headers->all(),
            'request_body' => $this->getContent(),
            'request_method' => $this->method(),
            'request_url' => $this->url(),
            'request_path' => $this->path(),
            'request_query' => $this->query(),
            'request_post' => $this->post(),
            'request_input' => $this->input(),
            'request_all' => $this->all(),
            'request_files' => $this->allFiles(),
            'request_has_file' => $this->hasFile('archivo'),
            'request_file' => $this->file('archivo'),
            'request_file_size' => $this->file('archivo') ? $this->file('archivo')->getSize() : 'no file',
            'request_file_name' => $this->file('archivo') ? $this->file('archivo')->getClientOriginalName() : 'no file',
            'request_file_mime' => $this->file('archivo') ? $this->file('archivo')->getMimeType() : 'no file'
        ]);

        // Normalizar campos legacy a la jerarquía actual
        $input = $this->all();
        
        // Solo normalizar campos específicos si es necesario
        if (!$this->filled('proceso_general_id') && $this->filled('direccion_id')) {
            $input['proceso_general_id'] = $this->get('direccion_id');
        }
        if (!$this->filled('proceso_interno_id') && $this->filled('proceso_apoyo_id')) {
            $input['proceso_interno_id'] = $this->get('proceso_apoyo_id');
        }
        
        // Inferir tipo_proceso_id a partir de proceso_general_id si falta
        if (empty($input['tipo_proceso_id']) && !empty($input['proceso_general_id'])) {
            try {
                $procesoGeneral = \App\Models\ProcesoGeneral::find($input['proceso_general_id']);
                if ($procesoGeneral) {
                    $input['tipo_proceso_id'] = $procesoGeneral->tipo_proceso_id;
                }
            } catch (\Exception $e) {
                \Log::warning('No se pudo inferir tipo_proceso_id:', ['error' => $e->getMessage()]);
            }
        }
        
        // Log de datos normalizados
        \Log::info('📝 [StoreDocumentRequest] Datos normalizados:', [
            'all_data' => $input,
            'files' => $this->allFiles(),
            'has_archivo' => $this->hasFile('archivo'),
            'archivo_size' => $this->file('archivo') ? $this->file('archivo')->getSize() : 'no file'
        ]);
        
        // Reemplazar los datos con los normalizados
        $this->replace($input);
    }
}

