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
            'archivo' => 'required|file|max:8192', // 8MB máximo
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
            'archivo.max' => 'El archivo no puede ser mayor a 8MB',
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
        // Log de datos recibidos para debugging
        \Log::info('📝 [StoreDocumentRequest] Datos recibidos:', [
            'all_data' => $this->all(),
            'files' => $this->allFiles(),
            'has_archivo' => $this->hasFile('archivo'),
            'archivo_size' => $this->file('archivo') ? $this->file('archivo')->getSize() : 'no file'
        ]);
    }
}

