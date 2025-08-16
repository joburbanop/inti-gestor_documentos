<?php

namespace App\Http\Controllers\Api\Documents;

use App\Http\Controllers\Controller;
use App\Http\Requests\Document\StoreDocumentRequest;
use App\Services\Document\DocumentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

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
            $documentos = $this->documentService->getDocuments($request);

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

            // Obtener datos validados
            $data = $request->validated();
            $file = $request->file('archivo');

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
            $data = $request->all();
            $file = $request->file('archivo');

            $documento = $this->documentService->updateDocument($id, $data, $file);

            return response()->json([
                'success' => true,
                'data' => $documento,
                'message' => 'Documento actualizado exitosamente'
            ]);

        } catch (\Exception $e) {
            Log::error('❌ [DocumentController] Error al actualizar documento:', [
                'id' => $id,
                'error' => $e->getMessage()
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
}

