<?php

namespace App\Http\Controllers\Api\Documents;

use App\Http\Controllers\Controller;
use App\Http\Requests\Document\StoreDocumentRequest;
use App\Services\Document\DocumentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\Documento;

class DocumentController extends Controller
{
    protected $documentService;

    public function __construct(DocumentService $documentService)
    {
        $this->documentService = $documentService;
    }

    /**
     * Obtener lista de documentos
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Convertir parámetros del request a array de filtros
            $filters = $request->only([
                'tipo_proceso_id',
                'proceso_general_id', 
                'proceso_interno_id',
                'tipo',
                'confidencialidad',
                'search',
                'etiquetas'
            ]);
            
            $perPage = $request->get('per_page', 15);
            
            $documentos = $this->documentService->getDocuments($filters, $perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'documentos' => $documentos->items(),
                    'pagination' => [
                        'current_page' => $documentos->currentPage(),
                        'last_page' => $documentos->lastPage(),
                        'per_page' => $documentos->perPage(),
                        'total' => $documentos->total(),
                    ]
                ],
                'message' => 'Documentos obtenidos exitosamente'
            ]);

        } catch (\Exception $e) {
            Log::error('❌ [DocumentController] Error al obtener documentos:', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener documentos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener documento específico
     */
    public function show($id): JsonResponse
    {
        try {
            $documento = $this->documentService->getDocument($id);

            return response()->json([
                'success' => true,
                'data' => $documento,
                'message' => 'Documento obtenido exitosamente'
            ]);

        } catch (\Exception $e) {
            Log::error('❌ [DocumentController] Error al obtener documento:', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener documento: ' . $e->getMessage()
            ], 404);
        }
    }

    /**
     * Crear nuevo documento
     */
    public function store(StoreDocumentRequest $request): JsonResponse
    {
        try {
            Log::info('🔄 [DocumentController] Iniciando creación de documento');
            Log::info('📝 [DocumentController] Datos recibidos en store:', [
                'all_data' => $request->all(),
                'files' => $request->allFiles(),
                'has_archivo' => $request->hasFile('archivo'),
                'archivo_size' => $request->file('archivo') ? $request->file('archivo')->getSize() : 'no file',
                'content_type' => $request->header('Content-Type'),
                'method' => $request->method(),
                'url' => $request->url(),
                'raw_input' => $request->getContent(),
                'request_size' => $request->header('Content-Length')
            ]);

            // Obtener datos validados
            $data = $request->validated();
            $file = $request->file('archivo');
            
            Log::info('📝 [DocumentController] Datos validados:', [
                'data' => $data,
                'file' => $file ? $file->getClientOriginalName() : 'no file'
            ]);

            // Crear documento usando el servicio
            $documento = $this->documentService->createDocument($data, $file);

            // Cargar relaciones para la respuesta
            $documento->load(['tipoProceso', 'procesoGeneral', 'procesoInterno', 'user']);

            Log::info('✅ [DocumentController] Documento creado exitosamente', [
                'documento_id' => $documento->id,
                'titulo' => $documento->titulo
            ]);

            return response()->json([
                'success' => true,
                'data' => $documento,
                'message' => 'Documento creado exitosamente'
            ], 201);

        } catch (\Exception $e) {
            Log::error('❌ [DocumentController] Error al crear documento:', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al crear documento: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar documento
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            Log::info('🔄 [DocumentController] Iniciando actualización de documento', [
                'id' => $id,
                'method' => $request->method(),
                'url' => $request->url(),
                'all_data' => $request->all(),
                'files' => $request->allFiles(),
                'content_type' => $request->header('Content-Type')
            ]);
            
            $data = $request->all();
            $file = $request->file('archivo');

            $documento = $this->documentService->updateDocument($id, $data, $file);

            Log::info('✅ [DocumentController] Documento actualizado exitosamente', [
                'id' => $id,
                'titulo' => $documento->titulo
            ]);

            return response()->json([
                'success' => true,
                'data' => $documento,
                'message' => 'Documento actualizado exitosamente'
            ]);

        } catch (\Exception $e) {
            Log::error('❌ [DocumentController] Error al actualizar documento:', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar documento: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar documento
     */
    public function destroy($id): JsonResponse
    {
        try {
            $this->documentService->deleteDocument($id);

            return response()->json([
                'success' => true,
                'message' => 'Documento eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            Log::error('❌ [DocumentController] Error al eliminar documento:', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar documento: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de documentos
     */
    public function stats(): JsonResponse
    {
        try {
            $stats = $this->documentService->getStats();

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Estadísticas obtenidas exitosamente'
            ]);

        } catch (\Exception $e) {
            Log::error('❌ [DocumentController] Error al obtener estadísticas:', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener etiquetas disponibles
     */
    public function tags(): JsonResponse
    {
        try {
            $tags = $this->documentService->getTags();

            return response()->json([
                'success' => true,
                'data' => $tags,
                'message' => 'Etiquetas obtenidas exitosamente'
            ]);

        } catch (\Exception $e) {
            Log::error('❌ [DocumentController] Error al obtener etiquetas:', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener etiquetas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener tipos de documentos disponibles
     */
    public function types(): JsonResponse
    {
        try {
            $types = $this->documentService->getTypes();

            return response()->json([
                'success' => true,
                'data' => $types,
                'message' => 'Tipos obtenidos exitosamente'
            ]);

        } catch (\Exception $e) {
            Log::error('❌ [DocumentController] Error al obtener tipos:', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener tipos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Descargar documento
     */
    public function download($id): JsonResponse
    {
        try {
            $documento = Documento::findOrFail($id);

            // Verificar permisos
            if (!$documento->esDescargablePor(auth()->user())) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para descargar este documento'
                ], 403);
            }

            // Verificar que el archivo existe
            if (!Storage::disk('public')->exists($documento->ruta_archivo)) {
                return response()->json([
                    'success' => false,
                    'message' => 'El archivo no existe en el servidor'
                ], 404);
            }

            // Incrementar contador de descargas
            $documento->incrementarDescargas();

            // Generar URL de descarga
            $disk = Storage::disk('public');
            $url = null;
            
            try {
                // Algunos drivers (S3) soportan temporaryUrl
                if (method_exists($disk, 'temporaryUrl')) {
                    $url = $disk->temporaryUrl(
                        $documento->ruta_archivo,
                        now()->addMinutes(5),
                        [
                            'ResponseContentDisposition' => 'attachment; filename="' . $documento->nombre_original . '"'
                        ]
                    );
                }
            } catch (\Throwable $e) {
                // Ignorar y continuar con fallback
            }

            if (!$url) {
                // Fallback para disco local: devolver ruta relativa
                $url = '/storage/' . ltrim($documento->ruta_archivo, '/');
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'url' => $url,
                    'nombre_original' => $documento->nombre_original,
                    'tamaño_archivo' => $documento->tamaño_archivo,
                    'tamaño_formateado' => $documento->getTamañoFormateadoAttribute(),
                    'extension' => $documento->extension,
                    'tipo_archivo' => $documento->tipo_archivo
                ],
                'message' => 'URL de descarga generada exitosamente'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Documento no encontrado'
            ], 404);

        } catch (\Exception $e) {
            Log::error('❌ [DocumentController] Error al generar descarga:', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al generar la descarga',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Vista previa de documento
     */
    public function preview($id): JsonResponse
    {
        try {
            $documento = Documento::findOrFail($id);

            // Verificar permisos
            if (!$documento->esDescargablePor(auth()->user())) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para ver este documento'
                ], 403);
            }

            // Verificar que el archivo existe
            if (!Storage::disk('public')->exists($documento->ruta_archivo)) {
                return response()->json([
                    'success' => false,
                    'message' => 'El archivo no existe en el servidor'
                ], 404);
            }

            // Obtener el tipo MIME del archivo
            $disk = Storage::disk('public');
            $mimeType = $disk->mimeType($documento->ruta_archivo);

            // Definir tipos de archivo visualizables en el navegador
            $viewableTypes = [
                'application/pdf',
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'image/bmp',
                'image/svg+xml',
                'text/plain',
                'text/html',
                'text/csv',
                'text/css',
                'text/javascript',
                'application/json',
                'application/xml'
            ];

            // Generar URL
            $url = null;
            try {
                if (method_exists($disk, 'temporaryUrl')) {
                    $url = $disk->temporaryUrl($documento->ruta_archivo, now()->addMinutes(5), [
                        'ResponseContentDisposition' => 'inline; filename="' . $documento->nombre_original . '"'
                    ]);
                }
            } catch (\Throwable $e) {
                // Ignorar y continuar con fallback
            }

            if (!$url) {
                $url = '/storage/' . ltrim($documento->ruta_archivo, '/');
            }

            $isViewable = in_array($mimeType, $viewableTypes);
            
            // Determinar el tipo de contenido para mejor UX
            $contentType = 'documento';
            if (str_starts_with($mimeType, 'image/')) {
                $contentType = 'imagen';
            } elseif ($mimeType === 'application/pdf') {
                $contentType = 'pdf';
            } elseif (str_starts_with($mimeType, 'text/')) {
                $contentType = 'texto';
            } elseif (in_array($documento->extension, ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'])) {
                $contentType = 'ofimatica';
            } elseif (in_array($documento->extension, ['zip', 'rar', '7z', 'tar', 'gz'])) {
                $contentType = 'comprimido';
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'url' => $url,
                    'nombre_original' => $documento->nombre_original,
                    'tamaño_archivo' => $documento->tamaño_archivo,
                    'tamaño_formateado' => $documento->getTamañoFormateadoAttribute(),
                    'tipo_archivo' => $documento->tipo_archivo,
                    'extension' => $documento->extension,
                    'mime_type' => $mimeType,
                    'content_type' => $contentType,
                    'viewable' => $isViewable,
                    'message' => $isViewable 
                        ? 'Este archivo se puede visualizar en el navegador' 
                        : 'Este tipo de archivo no es compatible con la visualización en el navegador. Se recomienda descargarlo.'
                ],
                'message' => $isViewable ? 'Vista previa disponible' : 'Archivo no visualizable'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Documento no encontrado'
            ], 404);

        } catch (\Exception $e) {
            Log::error('❌ [DocumentController] Error al generar vista previa:', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al generar la vista previa',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}

