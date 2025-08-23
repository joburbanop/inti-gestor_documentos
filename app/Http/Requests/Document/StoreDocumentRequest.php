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
            'archivo' => [
                'required',
                'file',
                'max:51200', // 50MB
                'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,gif,txt,zip,rar'
            ],
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
            'archivo.mimes' => 'El archivo debe ser de tipo: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, JPEG, PNG, GIF, TXT, ZIP, RAR',
            'tipo_proceso_id.required' => 'El tipo de proceso es obligatorio',
            'tipo_proceso_id.exists' => 'El tipo de proceso seleccionado no existe',
            'proceso_general_id.required' => 'El proceso general es obligatorio',
            'proceso_general_id.exists' => 'El proceso general seleccionado no existe',
            'proceso_interno_id.required' => 'El proceso interno es obligatorio',
            'proceso_interno_id.exists' => 'El proceso interno seleccionado no existe',
            'confidencialidad.in' => 'El nivel de confidencialidad debe ser Público o Interno'
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
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Validación de jerarquía tipo proceso -> proceso general
            if ($this->has('proceso_general_id') && $this->has('tipo_proceso_id')) {
                $procesoGeneral = \App\Models\ProcesoGeneral::find($this->proceso_general_id);
                if ($procesoGeneral && $procesoGeneral->tipo_proceso_id != $this->tipo_proceso_id) {
                    $validator->errors()->add('proceso_general_id', 'El proceso general no pertenece al tipo de proceso seleccionado');
                }
            }
            
            // Validación de que el proceso interno sea estándar (no específico a un proceso general)
            if ($this->has('proceso_interno_id')) {
                $procesoInterno = \App\Models\ProcesoInterno::find($this->proceso_interno_id);
                if ($procesoInterno && $procesoInterno->proceso_general_id !== null) {
                    $validator->errors()->add('proceso_interno_id', 'El proceso interno debe ser una carpeta estándar');
                }
            }

            // Validación adicional del archivo
            if ($this->hasFile('archivo')) {
                $archivo = $this->file('archivo');
                
                if (!$archivo->isValid()) {
                    $validator->errors()->add('archivo', 'El archivo subido no es válido: ' . $archivo->getErrorMessage());
                }

                // Validación de tamaño adicional
                if ($archivo->getSize() > 50 * 1024 * 1024) {
                    $validator->errors()->add('archivo', 'El archivo es demasiado grande. Máximo 50MB.');
                }

                // Validación de tipos MIME adicional
                $allowedMimes = [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/vnd.ms-powerpoint',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'image/jpeg',
                    'image/jpg',
                    'image/png',
                    'image/gif',
                    'text/plain',
                    'application/zip',
                    'application/x-rar-compressed'
                ];

                if (!in_array($archivo->getMimeType(), $allowedMimes)) {
                    $validator->errors()->add('archivo', 'Tipo de archivo no permitido. Tipos permitidos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, GIF, TXT, ZIP, RAR');
                }
            }
        });
    }
}

