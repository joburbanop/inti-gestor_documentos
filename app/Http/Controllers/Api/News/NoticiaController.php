<?php

namespace App\Http\Controllers\Api\News;

use App\Http\Controllers\Controller;
use App\Models\Noticia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class NoticiaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->get('per_page', 10), 1), 50);
        $query = Noticia::query()->where('is_active', true)->orderByDesc('published_at')->orderByDesc('created_at');
        $noticias = $query->paginate($perPage);

        $data = $noticias->getCollection()->map(function (Noticia $n) {
            $documentUrl = null;
            if ($n->document_path) {
                if (str_starts_with($n->document_path, 'remote:')) {
                    $documentUrl = substr($n->document_path, 7);
                } else {
                    $documentUrl = url('/storage/' . ltrim($n->document_path, '/'));
                }
            }
            return [
                'id' => $n->id,
                'title' => $n->title,
                'subtitle' => $n->subtitle,
                'published_at' => optional($n->published_at)->toIso8601String(),
                'document_url' => $documentUrl,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'noticias' => $data,
                'pagination' => [
                    'current_page' => $noticias->currentPage(),
                    'last_page' => $noticias->lastPage(),
                    'per_page' => $noticias->perPage(),
                    'total' => $noticias->total(),
                ],
            ],
        ]);
    }

    /**
     * Listado para administración: incluye todas (activas e inactivas)
     */
    public function indexAdmin(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->get('per_page', 10), 1), 50);
        $query = Noticia::query()->orderByDesc('published_at')->orderByDesc('created_at');
        $noticias = $query->paginate($perPage);

        $data = $noticias->getCollection()->map(function (Noticia $n) {
            $documentUrl = null;
            if ($n->document_path) {
                if (str_starts_with($n->document_path, 'remote:')) {
                    $documentUrl = substr($n->document_path, 7);
                } else {
                    $documentUrl = url('/storage/' . ltrim($n->document_path, '/'));
                }
            }
            return [
                'id' => $n->id,
                'title' => $n->title,
                'subtitle' => $n->subtitle,
                'published_at' => optional($n->published_at)->toIso8601String(),
                'document_url' => $documentUrl,
                'is_active' => (bool) $n->is_active,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'noticias' => $data,
                'pagination' => [
                    'current_page' => $noticias->currentPage(),
                    'last_page' => $noticias->lastPage(),
                    'per_page' => $noticias->perPage(),
                    'total' => $noticias->total(),
                ],
            ],
        ]);
    }

    /**
     * Últimas noticias sin paginación (optimizado, sin COUNT)
     */
    public function latest(Request $request): JsonResponse
    {
        $limit = min(max((int) $request->get('limit', 5), 1), 10);
        $noticias = Noticia::query()
            ->where('is_active', true)
            ->orderByDesc('published_at')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get(['id', 'title', 'subtitle', 'published_at', 'document_path']);

        $data = $noticias->map(function (Noticia $n) {
            $documentUrl = null;
            if ($n->document_path) {
                if (str_starts_with($n->document_path, 'remote:')) {
                    $documentUrl = substr($n->document_path, 7);
                } else {
                    $documentUrl = url('/storage/' . ltrim($n->document_path, '/'));
                }
            }
            return [
                'id' => $n->id,
                'title' => $n->title,
                'subtitle' => $n->subtitle,
                'published_at' => optional($n->published_at)->toIso8601String(),
                'document_url' => $documentUrl,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        // Log de datos recibidos
        \Log::info('📝 [NoticiaController] Datos recibidos en store:', [
            'all_data' => $request->all(),
            'files' => $request->allFiles(),
            'has_document' => $request->hasFile('document'),
            'document_size' => $request->file('document') ? $request->file('document')->getSize() : 'no file',
            'content_type' => $request->header('Content-Type'),
            'method' => $request->method(),
            'url' => $request->url(),
            'raw_input' => $request->getContent(),
            'request_size' => $request->header('Content-Length')
        ]);

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string',
            'published_at' => 'nullable|date',
            'document' => 'nullable|file|max:51200', // 50MB
            'document_url' => 'nullable|url',
            'is_active' => 'sometimes|boolean',
        ]);
        
        if ($validator->fails()) {
            \Log::info('❌ [NoticiaController] Validación falló:', [
                'errors' => $validator->errors()->toArray()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors(),
            ], 422);
        }

        $path = null; $original = null; $mime = null;
        if ($request->hasFile('document')) {
            $file = $request->file('document');
            $original = $file->getClientOriginalName();
            $mime = $file->getClientMimeType();
            $path = $file->store('news', 'public');
        } elseif ($request->filled('document_url')) {
            $path = 'remote:' . trim($request->input('document_url'));
        }

        $noticia = Noticia::create([
            'title' => $request->input('title'),
            'subtitle' => $request->input('subtitle'),
            'published_at' => $request->input('published_at'),
            'document_path' => $path,
            'document_original_name' => $original,
            'document_mime' => $mime,
            'created_by' => auth()->id(),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return response()->json([
            'success' => true,
            'data' => $noticia,
            'message' => 'Noticia creada correctamente',
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $noticia = Noticia::find($id);
        if (!$noticia) {
            return response()->json([
                'success' => false,
                'message' => 'Noticia no encontrada',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string',
            'published_at' => 'nullable|date',
            'document' => 'nullable|file|max:51200', // 50MB
            'document_url' => 'nullable|url',
            'is_active' => 'sometimes|boolean',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors(),
            ], 422);
        }

        $updateData = [
            'title' => $request->input('title', $noticia->title),
            'subtitle' => $request->input('subtitle', $noticia->subtitle),
            'published_at' => $request->input('published_at', $noticia->published_at),
        ];

        if ($request->has('is_active')) {
            $updateData['is_active'] = $request->boolean('is_active');
        }

        // Manejar archivo nuevo
        if ($request->hasFile('document')) {
            if ($noticia->document_path && !str_starts_with($noticia->document_path, 'remote:') && 
                \Illuminate\Support\Facades\Storage::disk('public')->exists($noticia->document_path)) {
            
                \Illuminate\Support\Facades\Storage::disk('public')->delete($noticia->document_path);
            }
            $file = $request->file('document');
            $updateData['document_path'] = $file->store('news', 'public');
            $updateData['document_original_name'] = $file->getClientOriginalName();
            $updateData['document_mime'] = $file->getClientMimeType();
        } elseif ($request->filled('document_url')) {
            // Guardar enlace remoto
            $updateData['document_path'] = 'remote:' . trim($request->input('document_url'));
            $updateData['document_original_name'] = null;
            $updateData['document_mime'] = null;
        }

        $noticia->update($updateData);

        return response()->json([
            'success' => true,
            'data' => $noticia->fresh(),
            'message' => 'Noticia actualizada correctamente',
        ]);
    }

    /**
     * Alternar estado activo de una noticia
     */
    public function toggle(Request $request, int $id): JsonResponse
    {
        $noticia = Noticia::find($id);
        if (!$noticia) {
            return response()->json([
                'success' => false,
                'message' => 'Noticia no encontrada',
            ], 404);
        }

        // Si se envía explícitamente is_active, usarlo; si no, alternar
        if ($request->has('is_active')) {
            $noticia->is_active = $request->boolean('is_active');
        } else {
            $noticia->is_active = !$noticia->is_active;
        }
        $noticia->save();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $noticia->id,
                'is_active' => (bool) $noticia->is_active,
            ],
            'message' => 'Estado de la noticia actualizado',
        ]);
    }

    /**
     * Mostrar una noticia específica
     */
    public function show(string $id): JsonResponse
    {
        $noticia = Noticia::find((int) $id);
        if (!$noticia) {
            return response()->json([
                'success' => false,
                'message' => 'Noticia no encontrada',
            ], 404);
        }

        $documentUrl = null;
        if ($noticia->document_path) {
            if (str_starts_with($noticia->document_path, 'remote:')) {
                $documentUrl = substr($noticia->document_path, 7);
            } else {
                $documentUrl = url('/storage/' . ltrim($noticia->document_path, '/'));
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $noticia->id,
                'title' => $noticia->title,
                'subtitle' => $noticia->subtitle,
                'published_at' => optional($noticia->published_at)->toIso8601String(),
                'document_url' => $documentUrl,
                'document_original_name' => $noticia->document_original_name,
                'document_mime' => $noticia->document_mime,
                'is_active' => (bool) $noticia->is_active,
                'created_at' => $noticia->created_at->toIso8601String(),
                'updated_at' => $noticia->updated_at->toIso8601String(),
            ],
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $noticia = Noticia::findOrFail($id);
        if ($noticia->document_path && Storage::disk('public')->exists($noticia->document_path)) {
            Storage::disk('public')->delete($noticia->document_path);
        }
        $noticia->delete();
        return response()->json([
            'success' => true,
            'message' => 'Noticia eliminada correctamente',
        ]);
    }
}
