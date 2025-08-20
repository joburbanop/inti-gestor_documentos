<?php

namespace App\Services\Document;

use App\Models\Documento;
use App\Services\FileUpload\FileUploadService;
use App\Services\Process\ProcessService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class DocumentService
{
    protected $fileUploadService;
    protected $processService;

    public function __construct(FileUploadService $fileUploadService, ProcessService $processService)
    {
        $this->fileUploadService = $fileUploadService;
        $this->processService = $processService;
    }

    /**
     * Crear un nuevo documento
     */
    public function createDocument(array $data, UploadedFile $file)
    {
        try {
            Log::info('📝 [DocumentService] Creando documento:', [
                'titulo' => $data['titulo'],
                'tipo_proceso_id' => $data['tipo_proceso_id'],
                'proceso_general_id' => $data['proceso_general_id'],
                'proceso_interno_id' => $data['proceso_interno_id'],
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize()
            ]);

            // Validar jerarquía de procesos
            $this->processService->validateHierarchy(
                $data['tipo_proceso_id'],
                $data['proceso_general_id'],
                $data['proceso_interno_id']
            );

            // Subir archivo
            $fileInfo = $this->fileUploadService->uploadDocument($file);

            // Crear documento en base de datos
            $documento = Documento::create([
                'titulo' => $data['titulo'],
                'descripcion' => $data['descripcion'] ?? null,
                'tipo_proceso_id' => $data['tipo_proceso_id'],
                'proceso_general_id' => $data['proceso_general_id'],
                'proceso_interno_id' => $data['proceso_interno_id'],
                'confidencialidad' => $data['confidencialidad'] ?? 'Publico',
                'nombre_archivo' => $fileInfo['nombre_archivo'],
                'nombre_original' => $fileInfo['nombre_original'],
                'ruta_archivo' => $fileInfo['ruta_archivo'],
                'tipo_archivo' => $fileInfo['tipo_archivo'],
                'tamaño_archivo' => $fileInfo['tamaño_archivo'],
                'extension' => $fileInfo['extension'],
                'subido_por' => auth()->id() ?? 1, // Usar ID 1 como fallback para comandos
                'contador_descargas' => 0
            ]);

            // Limpiar cache
            $this->clearCache($data);

            Log::info('✅ [DocumentService] Documento creado exitosamente:', [
                'documento_id' => $documento->id,
                'titulo' => $documento->titulo
            ]);

            return $documento->load(['tipoProceso', 'procesoGeneral', 'procesoInterno', 'user']);

        } catch (\Exception $e) {
            Log::error('❌ [DocumentService] Error al crear documento:', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Obtener documentos con filtros
     */
    public function getDocuments(array $filters = [], $perPage = 15)
    {
        $query = Documento::with(['tipoProceso', 'procesoGeneral', 'procesoInterno', 'user']);

        // Aplicar filtros
        if (!empty($filters['tipo_proceso_id'])) {
            $query->where('tipo_proceso_id', $filters['tipo_proceso_id']);
        }

        if (!empty($filters['proceso_general_id'])) {
            $query->where('proceso_general_id', $filters['proceso_general_id']);
        }

        if (!empty($filters['proceso_interno_id'])) {
            $query->where('proceso_interno_id', $filters['proceso_interno_id']);
        }

        if (!empty($filters['confidencialidad'])) {
            $query->where('confidencialidad', $filters['confidencialidad']);
        }

            if (!empty($filters['search'])) {
                $search = $filters['search'];
                // MySQL-safe search usando scopeBuscar
                $query->buscar($search);
            }

        // Ordenamiento
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($perPage);
    }

    /**
     * Obtener documento por ID
     */
    public function getDocument($id)
    {
        return Documento::with(['tipoProceso', 'procesoGeneral', 'procesoInterno', 'user'])
            ->findOrFail($id);
    }

    /**
     * Actualizar documento
     */
    public function updateDocument($id, array $data, UploadedFile $file = null)
    {
        $documento = Documento::findOrFail($id);

        try {
            // Si hay un nuevo archivo, subirlo
            if ($file) {
                // Eliminar archivo anterior
                if ($documento->ruta_archivo) {
                    $this->fileUploadService->deleteFile($documento->ruta_archivo);
                }

                // Subir nuevo archivo
                $fileInfo = $this->fileUploadService->uploadDocument($file);
                
                $data = array_merge($data, [
                    'nombre_archivo' => $fileInfo['nombre_archivo'],
                    'nombre_original' => $fileInfo['nombre_original'],
                    'ruta_archivo' => $fileInfo['ruta_archivo'],
                    'tipo_archivo' => $fileInfo['tipo_archivo'],
                    'tamaño_archivo' => $fileInfo['tamaño_archivo'],
                    'extension' => $fileInfo['extension']
                ]);
            }

            // Validar jerarquía si se cambian los procesos
            if (isset($data['tipo_proceso_id']) || isset($data['proceso_general_id']) || isset($data['proceso_interno_id'])) {
                $tipoId = $data['tipo_proceso_id'] ?? $documento->tipo_proceso_id;
                $generalId = $data['proceso_general_id'] ?? $documento->proceso_general_id;
                $internalId = $data['proceso_interno_id'] ?? $documento->proceso_interno_id;

                $this->processService->validateHierarchy($tipoId, $generalId, $internalId);
            }

            // Actualizar documento
            $documento->update($data);

            // Limpiar cache
            $this->clearCache($data);

            Log::info('✅ [DocumentService] Documento actualizado:', [
                'documento_id' => $documento->id,
                'titulo' => $documento->titulo
            ]);

            return $documento->load(['tipoProceso', 'procesoGeneral', 'procesoInterno', 'user']);

        } catch (\Exception $e) {
            Log::error('❌ [DocumentService] Error al actualizar documento:', [
                'documento_id' => $id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Eliminar documento
     */
    public function deleteDocument($id)
    {
        $documento = Documento::findOrFail($id);

        try {
            // Eliminar archivo físico
            if ($documento->ruta_archivo) {
                $this->fileUploadService->deleteFile($documento->ruta_archivo);
            }

            // Eliminar registro de base de datos
            $documento->delete();

            // Limpiar cache
            $this->clearCache([
                'tipo_proceso_id' => $documento->tipo_proceso_id,
                'proceso_general_id' => $documento->proceso_general_id,
                'proceso_interno_id' => $documento->proceso_interno_id
            ]);

            Log::info('✅ [DocumentService] Documento eliminado:', [
                'documento_id' => $id,
                'titulo' => $documento->titulo
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('❌ [DocumentService] Error al eliminar documento:', [
                'documento_id' => $id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Incrementar contador de descargas
     */
    public function incrementDownloadCount($id)
    {
        $documento = Documento::findOrFail($id);
        $documento->increment('contador_descargas');
        
        Log::info('📥 [DocumentService] Descarga registrada:', [
            'documento_id' => $id,
            'contador_descargas' => $documento->contador_descargas
        ]);

        return $documento;
    }

    /**
     * Obtener documentos recientes
     */
    public function getRecentDocuments($limit = 10)
    {
        return Documento::with(['tipoProceso', 'procesoGeneral', 'procesoInterno', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Obtener estadísticas de documentos
     */
    public function getDocumentStats()
    {
        return Cache::remember('document_stats', 3600, function () {
            return [
                'total' => Documento::count(),
                'por_confidencialidad' => Documento::selectRaw('confidencialidad, count(*) as total')
                    ->groupBy('confidencialidad')
                    ->get(),
                'por_tipo_proceso' => Documento::join('tipos_procesos', 'documentos.tipo_proceso_id', '=', 'tipos_procesos.id')
                    ->selectRaw('tipos_procesos.nombre, count(*) as total')
                    ->groupBy('tipos_procesos.id', 'tipos_procesos.nombre')
                    ->get(),
                'por_extension' => Documento::selectRaw('extension, count(*) as total')
                    ->groupBy('extension')
                    ->orderBy('total', 'desc')
                    ->limit(10)
                    ->get()
            ];
        });
    }

    /**
     * Limpiar cache relacionado
     */
    private function clearCache(array $data)
    {
        if (isset($data['tipo_proceso_id'])) {
            Cache::forget("tipos_procesos_{$data['tipo_proceso_id']}_procesos_generales");
        }

        if (isset($data['proceso_general_id'])) {
            Cache::forget("proceso_general_{$data['proceso_general_id']}");
        }

        Cache::forget('document_stats');
        Cache::forget('recent_documents');
    }

    /**
     * Obtener estadísticas de documentos
     */
    public function getStats()
    {
        return Cache::remember('document_stats', 3600, function () {
            return [
                'total_documentos' => Documento::count(),
                'por_confidencialidad' => Documento::selectRaw('confidencialidad, count(*) as total')
                    ->groupBy('confidencialidad')
                    ->get(),
                'por_tipo_proceso' => Documento::join('tipos_procesos', 'documentos.tipo_proceso_id', '=', 'tipos_procesos.id')
                    ->selectRaw('tipos_procesos.nombre, count(*) as total')
                    ->groupBy('tipos_procesos.id', 'tipos_procesos.nombre')
                    ->get(),
                'por_extension' => Documento::selectRaw('extension, count(*) as total')
                    ->groupBy('extension')
                    ->orderBy('total', 'desc')
                    ->limit(10)
                    ->get()
            ];
        });
    }

    /**
     * Obtener etiquetas disponibles
     */
    public function getTags()
    {
        return Cache::remember('document_tags', 3600, function () {
            return Documento::query()
                ->whereNotNull('etiquetas')
                ->select('etiquetas')
                ->limit(500)
                ->get()
                ->flatMap(function ($doc) { 
                    return collect($doc->etiquetas ?? []); 
                })
                ->filter()
                ->map(fn($t) => (string) $t)
                ->unique()
                ->values()
                ->toArray();
        });
    }

    /**
     * Obtener tipos de documentos disponibles
     */
    public function getTypes()
    {
        return Cache::remember('document_types', 3600, function () {
            return [
                'pdf' => 'PDF',
                'doc' => 'Documento Word',
                'docx' => 'Documento Word',
                'xls' => 'Hoja de Cálculo Excel',
                'xlsx' => 'Hoja de Cálculo Excel',
                'ppt' => 'Presentación PowerPoint',
                'pptx' => 'Presentación PowerPoint',
                'txt' => 'Archivo de Texto',
                'jpg' => 'Imagen JPG',
                'jpeg' => 'Imagen JPEG',
                'png' => 'Imagen PNG',
                'gif' => 'Imagen GIF',
                'zip' => 'Archivo Comprimido ZIP',
                'rar' => 'Archivo Comprimido RAR'
            ];
        });
    }

    /**
     * Obtener información de descarga de documento
     */
    public function downloadDocument($id)
    {
        $documento = Documento::findOrFail($id);
        
        // Incrementar contador de descargas
        $this->incrementDownloadCount($id);

        return [
            'url' => $documento->getUrlDescargaAttribute(),
            'nombre_original' => $documento->nombre_original,
            'tamaño_archivo' => $documento->tamaño_archivo,
            'tamaño_formateado' => $documento->getTamañoFormateadoAttribute()
        ];
    }

    /**
     * Obtener información de vista previa de documento
     */
    public function previewDocument($id)
    {
        $documento = Documento::findOrFail($id);

        return [
            'url' => $documento->getUrlVistaPreviaAttribute(),
            'nombre_original' => $documento->nombre_original,
            'tamaño_archivo' => $documento->tamaño_archivo,
            'tamaño_formateado' => $documento->getTamañoFormateadoAttribute(),
            'tipo_archivo' => $documento->tipo_archivo
        ];
    }
}
