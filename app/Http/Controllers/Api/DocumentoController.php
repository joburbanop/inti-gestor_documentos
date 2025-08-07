<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Documento;
use App\Models\Direccion;
use App\Models\ProcesoApoyo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class DocumentoController extends Controller
{
    /**
     * Obtener todos los documentos con paginación
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Documento::with(['direccion', 'procesoApoyo', 'subidoPor'])
                ->orderBy('created_at', 'desc');

            // Filtros
            if ($request->has('direccion_id')) {
                $query->porDireccion($request->direccion_id);
            }

            if ($request->has('proceso_apoyo_id')) {
                $query->porProceso($request->proceso_apoyo_id);
            }



            $documentos = $query->paginate(15);

            $data = $documentos->getCollection()->map(function ($documento) {
                return [
                    'id' => $documento->id,
                    'titulo' => $documento->titulo,
                    'descripcion' => $documento->descripcion,
                    'tipo_archivo' => $documento->tipo_archivo,
                    'tamaño_formateado' => $documento->tamaño_formateado,
                    'contador_descargas' => $documento->contador_descargas,

                    'fecha_creacion' => $documento->created_at->format('Y-m-d H:i:s'),
                    'direccion' => [
                        'id' => $documento->direccion->id,
                        'nombre' => $documento->direccion->nombre,
                        'codigo' => $documento->direccion->codigo,
                    ],
                    'proceso_apoyo' => [
                        'id' => $documento->procesoApoyo->id,
                        'nombre' => $documento->procesoApoyo->nombre,
                        'codigo' => $documento->procesoApoyo->codigo,
                    ],
                    'subido_por' => [
                        'id' => $documento->subidoPor->id,
                        'name' => $documento->subidoPor->name,
                    ]
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'documentos' => $data,
                    'pagination' => [
                        'current_page' => $documentos->currentPage(),
                        'last_page' => $documentos->lastPage(),
                        'per_page' => $documentos->perPage(),
                        'total' => $documentos->total(),
                    ]
                ],
                'message' => 'Documentos obtenidos exitosamente'
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Error al obtener documentos: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los documentos',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener un documento específico
     */
    public function show(int $id): JsonResponse
    {
        try {
            $documento = Documento::with(['direccion', 'procesoApoyo', 'subidoPor'])
                ->findOrFail($id);

            // Verificar permisos
            if (!$documento->esDescargablePor(auth()->user())) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para ver este documento'
                ], 403);
            }

            $data = [
                'id' => $documento->id,
                'titulo' => $documento->titulo,
                'descripcion' => $documento->descripcion,
                'nombre_original' => $documento->nombre_original,
                'tipo_archivo' => $documento->tipo_archivo,
                'tamaño_formateado' => $documento->tamaño_formateado,
                'contador_descargas' => $documento->contador_descargas,

                'fecha_creacion' => $documento->created_at->format('Y-m-d H:i:s'),
                'direccion' => [
                    'id' => $documento->direccion->id,
                    'nombre' => $documento->direccion->nombre,
                    'codigo' => $documento->direccion->codigo,
                ],
                'proceso_apoyo' => [
                    'id' => $documento->procesoApoyo->id,
                    'nombre' => $documento->procesoApoyo->nombre,
                    'codigo' => $documento->procesoApoyo->codigo,
                ],
                'subido_por' => [
                    'id' => $documento->subidoPor->id,
                    'name' => $documento->subidoPor->name,
                ],
                'documentos_relacionados' => $documento->documentosRelacionados()->map(function ($relacionado) {
                    return [
                        'id' => $relacionado->id,
                        'titulo' => $relacionado->titulo,
                        'tipo_archivo' => $relacionado->tipo_archivo,
                        'fecha_creacion' => $relacionado->created_at->format('Y-m-d H:i:s'),
                    ];
                })
            ];

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Documento obtenido exitosamente'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Documento no encontrado'
            ], 404);

        } catch (\Exception $e) {
            \Log::error('Error al obtener documento: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el documento',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Crear un nuevo documento
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'titulo' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'archivo' => 'required|file|max:10240', // 10MB máximo
                'direccion_id' => 'required|exists:direcciones,id',
                'proceso_apoyo_id' => 'required|exists:procesos_apoyo,id',

            ], [
                'titulo.required' => 'El título es obligatorio',
                'archivo.required' => 'El archivo es obligatorio',
                'archivo.max' => 'El archivo no puede ser mayor a 10MB',
                'direccion_id.required' => 'La dirección es obligatoria',
                'proceso_apoyo_id.required' => 'El proceso de apoyo es obligatorio'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $archivo = $request->file('archivo');
            $nombreArchivo = time() . '_' . Str::random(10) . '.' . $archivo->getClientOriginalExtension();
            $rutaArchivo = $archivo->storeAs('documentos', $nombreArchivo, 'public');

            $documento = Documento::create([
                'titulo' => $request->titulo,
                'descripcion' => $request->descripcion,
                'nombre_archivo' => $nombreArchivo,
                'nombre_original' => $archivo->getClientOriginalName(),
                'ruta_archivo' => $rutaArchivo,
                'tipo_archivo' => $archivo->getClientMimeType(),
                'tamaño_archivo' => $archivo->getSize(),
                'direccion_id' => $request->direccion_id,
                'proceso_apoyo_id' => $request->proceso_apoyo_id,
                'subido_por' => auth()->id(),

            ]);

            return response()->json([
                'success' => true,
                'data' => $documento,
                'message' => 'Documento subido exitosamente'
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Error al subir documento: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al subir el documento',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Actualizar un documento
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $documento = Documento::findOrFail($id);

            // Verificar permisos
            if (auth()->id() !== $documento->subido_por && !auth()->user()->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para actualizar este documento'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'titulo' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'direccion_id' => 'required|exists:direcciones,id',
                'proceso_apoyo_id' => 'required|exists:procesos_apoyo,id',

            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $documento->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $documento,
                'message' => 'Documento actualizado exitosamente'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Documento no encontrado'
            ], 404);

        } catch (\Exception $e) {
            \Log::error('Error al actualizar documento: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el documento',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Eliminar un documento
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $documento = Documento::findOrFail($id);

            // Verificar permisos
            if (auth()->id() !== $documento->subido_por && !auth()->user()->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para eliminar este documento'
                ], 403);
            }

            // Eliminar archivo físico
            if (Storage::disk('public')->exists($documento->ruta_archivo)) {
                Storage::disk('public')->delete($documento->ruta_archivo);
            }

            $documento->delete();

            return response()->json([
                'success' => true,
                'message' => 'Documento eliminado exitosamente'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Documento no encontrado'
            ], 404);

        } catch (\Exception $e) {
            \Log::error('Error al eliminar documento: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el documento',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Descargar un documento
     */
    public function descargar(int $id): JsonResponse
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

            // Generar URL de descarga temporal
            $url = Storage::disk('public')->temporaryUrl(
                $documento->ruta_archivo,
                now()->addMinutes(5),
                [
                    'ResponseContentDisposition' => 'attachment; filename="' . $documento->nombre_original . '"'
                ]
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'url' => $url,
                    'nombre_original' => $documento->nombre_original
                ],
                'message' => 'URL de descarga generada exitosamente'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Documento no encontrado'
            ], 404);

        } catch (\Exception $e) {
            \Log::error('Error al descargar documento: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al generar la descarga',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Buscar documentos
     */
    public function buscar(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'termino' => 'required|string|min:3'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'El término de búsqueda debe tener al menos 3 caracteres'
                ], 422);
            }

            $query = Documento::buscar($request->termino)
                ->with(['direccion', 'procesoApoyo', 'subidoPor'])
                ->orderBy('created_at', 'desc');

            $documentos = $query->paginate(15);

            $data = $documentos->getCollection()->map(function ($documento) {
                return [
                    'id' => $documento->id,
                    'titulo' => $documento->titulo,
                    'descripcion' => $documento->descripcion,
                    'tipo_archivo' => $documento->tipo_archivo,
                    'tamaño_formateado' => $documento->tamaño_formateado,
                    'contador_descargas' => $documento->contador_descargas,

                    'fecha_creacion' => $documento->created_at->format('Y-m-d H:i:s'),
                    'direccion' => [
                        'id' => $documento->direccion->id,
                        'nombre' => $documento->direccion->nombre,
                        'codigo' => $documento->direccion->codigo,
                    ],
                    'proceso_apoyo' => [
                        'id' => $documento->procesoApoyo->id,
                        'nombre' => $documento->procesoApoyo->nombre,
                        'codigo' => $documento->procesoApoyo->codigo,
                    ],
                    'subido_por' => [
                        'id' => $documento->subidoPor->id,
                        'name' => $documento->subidoPor->name,
                    ]
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'documentos' => $data,
                    'pagination' => [
                        'current_page' => $documentos->currentPage(),
                        'last_page' => $documentos->lastPage(),
                        'per_page' => $documentos->perPage(),
                        'total' => $documentos->total(),
                    ]
                ],
                'message' => 'Búsqueda completada exitosamente'
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Error en búsqueda de documentos: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error en la búsqueda',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener documentos recientes
     */
    public function recientes(): JsonResponse
    {
        try {
            $query = Documento::with(['direccion', 'procesoApoyo', 'subidoPor'])
                ->orderBy('created_at', 'desc')
                ->limit(10);

            $documentos = $query->get()->map(function ($documento) {
                return [
                    'id' => $documento->id,
                    'titulo' => $documento->titulo,
                    'tipo_archivo' => $documento->tipo_archivo,
                    'tamaño_formateado' => $documento->tamaño_formateado,
                    'fecha_creacion' => $documento->created_at->format('Y-m-d H:i:s'),
                    'direccion' => [
                        'nombre' => $documento->direccion->nombre,
                    ],
                    'proceso_apoyo' => [
                        'nombre' => $documento->procesoApoyo->nombre,
                    ]
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $documentos,
                'message' => 'Documentos recientes obtenidos exitosamente'
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Error al obtener documentos recientes: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener documentos recientes',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener estadísticas optimizadas para el dashboard
     */
    public function estadisticas(): JsonResponse
    {
        try {
            // Cache ultra rápido - 2 minutos para datos más frescos
            $estadisticas = Cache::remember('dashboard_estadisticas', 120, function () {
                // Consultas optimizadas con índices - cache más corto para datos que cambian
                $totalDocumentos = Cache::remember('total_documentos', 60, function () {
                    return Documento::count();
                });
                
                $totalDirecciones = Cache::remember('total_direcciones', 60, function () {
                    return Direccion::where('activo', true)->count();
                });
                
                $totalProcesos = Cache::remember('total_procesos', 60, function () {
                    return ProcesoApoyo::where('activo', true)->count();
                });

                return [
                    'total_documentos' => $totalDocumentos,
                    'total_direcciones' => $totalDirecciones,
                    'total_procesos' => $totalProcesos
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $estadisticas,
                'message' => 'Estadísticas obtenidas exitosamente'
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Error al obtener estadísticas: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
} 