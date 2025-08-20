<?php

namespace App\Services\FileUpload;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class FileUploadService
{
    /**
     * Subir archivo de documento
     */
    public function uploadDocument(UploadedFile $file, $directory = 'documentos')
    {
        try {
            // Validar archivo
            $this->validateFile($file);

            // Generar nombre único
            $fileName = $this->generateUniqueFileName($file);

            // Almacenar archivo
            $path = $file->storeAs($directory, $fileName, 'public');

            // Obtener información del archivo
            $fileInfo = $this->getFileInfo($file, $fileName, $path);

            Log::info('✅ [FileUploadService] Archivo subido exitosamente:', [
                'original_name' => $file->getClientOriginalName(),
                'stored_name' => $fileName,
                'path' => $path,
                'size' => $fileInfo['tamaño_archivo'],
                'mime_type' => $fileInfo['tipo_archivo']
            ]);

            return $fileInfo;

        } catch (\Exception $e) {
            Log::error('❌ [FileUploadService] Error al subir archivo:', [
                'error' => $e->getMessage(),
                'original_name' => $file->getClientOriginalName()
            ]);
            throw $e;
        }
    }

    /**
     * Validar archivo
     */
    private function validateFile(UploadedFile $file)
    {
        // Verificar que el archivo se subió correctamente
        if (!$file->isValid()) {
            throw new \Exception('El archivo no se subió correctamente');
        }

        // Verificar extensión permitida
        $allowedExtensions = [
            'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
            'jpg', 'jpeg', 'png', 'gif', 'txt', 'zip', 'rar'
        ];

        $extension = strtolower($file->getClientOriginalExtension());
        if (!in_array($extension, $allowedExtensions)) {
            throw new \Exception("Extensión de archivo no permitida: {$extension}");
        }

        // Verificar tamaño máximo (50MB)
        $maxSize = 50 * 1024 * 1024; // 50MB en bytes
        if ($file->getSize() > $maxSize) {
            throw new \Exception('El archivo excede el tamaño máximo permitido (50MB)');
        }
    }

    /**
     * Generar nombre único para el archivo
     */
    private function generateUniqueFileName(UploadedFile $file)
    {
        $extension = $file->getClientOriginalExtension();
        $timestamp = time();
        $randomString = Str::random(10);
        
        return "{$timestamp}_{$randomString}.{$extension}";
    }

    /**
     * Obtener información del archivo
     */
    private function getFileInfo(UploadedFile $file, $fileName, $path)
    {
        return [
            'nombre_archivo' => $fileName,
            'nombre_original' => $file->getClientOriginalName(),
            'ruta_archivo' => $path,
            'tipo_archivo' => $file->getClientMimeType(),
            'tamaño_archivo' => $file->getSize(),
            'extension' => strtolower($file->getClientOriginalExtension())
        ];
    }

    /**
     * Eliminar archivo
     */
    public function deleteFile($path)
    {
        try {
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
                
                Log::info('✅ [FileUploadService] Archivo eliminado:', [
                    'path' => $path
                ]);
                
                return true;
            }
            
            Log::warning('⚠️ [FileUploadService] Archivo no encontrado para eliminar:', [
                'path' => $path
            ]);
            
            return false;

        } catch (\Exception $e) {
            Log::error('❌ [FileUploadService] Error al eliminar archivo:', [
                'path' => $path,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Verificar si el archivo existe
     */
    public function fileExists($path)
    {
        return Storage::disk('public')->exists($path);
    }

    /**
     * Obtener URL pública del archivo
     */
    public function getPublicUrl($path)
    {
        return Storage::disk('public')->url($path);
    }

    /**
     * Obtener tamaño del archivo
     */
    public function getFileSize($path)
    {
        if ($this->fileExists($path)) {
            return Storage::disk('public')->size($path);
        }
        return 0;
    }

    /**
     * Obtener información del archivo almacenado
     */
    public function getStoredFileInfo($path)
    {
        if (!$this->fileExists($path)) {
            return null;
        }

        return [
            'path' => $path,
            'url' => $this->getPublicUrl($path),
            'size' => $this->getFileSize($path),
            'last_modified' => Storage::disk('public')->lastModified($path)
        ];
    }

    /**
     * Limpiar archivos temporales
     */
    public function cleanTempFiles($olderThanHours = 24)
    {
        try {
            $tempPath = 'temp';
            $files = Storage::disk('public')->files($tempPath);
            $cutoffTime = time() - ($olderThanHours * 3600);
            $deletedCount = 0;

            foreach ($files as $file) {
                $lastModified = Storage::disk('public')->lastModified($file);
                if ($lastModified < $cutoffTime) {
                    Storage::disk('public')->delete($file);
                    $deletedCount++;
                }
            }

            Log::info('🧹 [FileUploadService] Archivos temporales limpiados:', [
                'deleted_count' => $deletedCount,
                'older_than_hours' => $olderThanHours
            ]);

            return $deletedCount;

        } catch (\Exception $e) {
            Log::error('❌ [FileUploadService] Error al limpiar archivos temporales:', [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
}
