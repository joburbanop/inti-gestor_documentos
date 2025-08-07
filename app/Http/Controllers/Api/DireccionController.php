<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Direccion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class DireccionController extends Controller
{
    /**
     * Obtener todas las direcciones activas con estadísticas
     */
    public function index(): JsonResponse
    {
        try {
            // Cache por 5 minutos para mejorar rendimiento
            $direcciones = Cache::remember('direcciones_activas', 300, function () {
                return Direccion::activas()
                    ->ordenadas()
                    ->with(['procesosApoyo' => function ($query) {
                        $query->activos()->ordenados();
                    }])
                    ->withCount(['documentos'])
                    ->withCount(['procesosApoyo' => function ($query) {
                        $query->where('activo', true);
                    }])
                    ->get()
                    ->map(function ($direccion) {
                        \Log::info("Dirección {$direccion->nombre} tiene {$direccion->procesosApoyo->count()} procesos");
                        
                        return [
                            'id' => $direccion->id,
                            'nombre' => $direccion->nombre,
                            'descripcion' => $direccion->descripcion,
                            'codigo' => $direccion->codigo,
                            'orden' => $direccion->orden,
                            'color' => $direccion->color,
                            'estadisticas' => [
                                'total_procesos' => $direccion->procesos_apoyo_count,
                                'total_documentos' => $direccion->documentos_count,
                            ],
                            'procesos_apoyo' => $direccion->procesosApoyo->map(function ($proceso) {
                                return [
                                    'id' => $proceso->id,
                                    'nombre' => $proceso->nombre,
                                    'descripcion' => $proceso->descripcion,
                                    'codigo' => $proceso->codigo,
                                    'orden' => $proceso->orden,
                                ];
                            })
                        ];
                    });
            });

            return response()->json([
                'success' => true,
                'data' => $direcciones,
                'message' => 'Direcciones obtenidas exitosamente'
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Error al obtener direcciones: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las direcciones',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener una dirección específica con sus procesos y documentos
     */
    public function show(int $id): JsonResponse
    {
        try {
            $direccion = Cache::remember("direccion_{$id}", 300, function () use ($id) {
                return Direccion::activas()
                    ->with(['procesosApoyo' => function ($query) {
                        $query->activos()->ordenados();
                    }])
                    ->withCount(['procesosApoyo' => function ($query) {
                        $query->where('activo', true);
                    }])
                    ->with(['documentos' => function ($query) {
                        $query->with(['procesoApoyo', 'subidoPor'])
                              ->orderBy('created_at', 'desc')
                              ->limit(10);
                    }])
                    ->findOrFail($id);
            });

            $data = [
                'id' => $direccion->id,
                'nombre' => $direccion->nombre,
                'descripcion' => $direccion->descripcion,
                'codigo' => $direccion->codigo,
                'orden' => $direccion->orden,
                'estadisticas' => $direccion->estadisticas,
                'procesos_apoyo' => $direccion->procesosApoyo->map(function ($proceso) {
                    return [
                        'id' => $proceso->id,
                        'nombre' => $proceso->nombre,
                        'descripcion' => $proceso->descripcion,
                        'codigo' => $proceso->codigo,
                        'orden' => $proceso->orden,
                        'estadisticas' => $proceso->estadisticas,
                    ];
                }),
                'documentos_recientes' => $direccion->documentos->map(function ($documento) {
                    return [
                        'id' => $documento->id,
                        'titulo' => $documento->titulo,
                        'descripcion' => $documento->descripcion,
                        'tipo_archivo' => $documento->tipo_archivo,
                        'tamaño_formateado' => $documento->tamaño_formateado,
                        'contador_descargas' => $documento->contador_descargas,

                        'fecha_creacion' => $documento->created_at->format('Y-m-d H:i:s'),
                        'proceso_apoyo' => [
                            'id' => $documento->procesoApoyo->id,
                            'nombre' => $documento->procesoApoyo->nombre,
                        ],
                        'subido_por' => [
                            'id' => $documento->subidoPor->id,
                            'name' => $documento->subidoPor->name,
                        ]
                    ];
                })
            ];

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Dirección obtenida exitosamente'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dirección no encontrada'
            ], 404);

        } catch (\Exception $e) {
            \Log::error('Error al obtener dirección: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la dirección',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Crear una nueva dirección (solo admin)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            \Log::info('Iniciando creación de dirección', $request->all());
            
            // Verificar permisos de administrador
            if (!auth()->user()->is_admin) {
                \Log::warning('Usuario no autorizado intentando crear dirección', ['user_id' => auth()->id()]);
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para crear direcciones'
                ], 403);
            }

            // Validación optimizada
            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255|unique:direcciones,nombre',
                'descripcion' => 'nullable|string|max:1000',
                'codigo' => 'required|string|max:10|unique:direcciones,codigo',
                'procesos_apoyo' => 'nullable|array',
                'procesos_apoyo.*' => 'integer|exists:procesos_apoyo,id',
                'orden' => 'nullable|integer|min:0'
            ], [
                'nombre.required' => 'El nombre es obligatorio',
                'nombre.unique' => 'Ya existe una dirección con ese nombre',
                'codigo.required' => 'El código es obligatorio',
                'codigo.unique' => 'Ya existe una dirección con ese código',
                'procesos_apoyo.array' => 'Los procesos de apoyo deben ser una lista',
                'procesos_apoyo.*.integer' => 'Cada proceso de apoyo debe ser un ID válido',
                'procesos_apoyo.*.exists' => 'Uno o más procesos de apoyo no existen'
            ]);

            if ($validator->fails()) {
                \Log::warning('Validación fallida al crear dirección', ['errors' => $validator->errors()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Preparar datos para inserción
            $data = $request->only(['nombre', 'descripcion', 'codigo', 'orden']);
            $data['activo'] = true;
            $data['orden'] = $data['orden'] ?? 0;
            $procesosApoyoIds = $request->input('procesos_apoyo', []);

            \Log::info('Datos validados correctamente, creando dirección', $data);
            \Log::info('Procesos de apoyo seleccionados:', $procesosApoyoIds);
            
            // Crear dirección con transacción para consistencia
            $direccion = \DB::transaction(function () use ($data, $procesosApoyoIds) {
                // Crear la dirección
                $direccion = Direccion::create($data);
                
                // Actualizar los procesos de apoyo seleccionados
                if (!empty($procesosApoyoIds)) {
                    \App\Models\ProcesoApoyo::whereIn('id', $procesosApoyoIds)
                        ->update(['direccion_id' => $direccion->id]);
                    
                    // Actualizar el campo JSON en la dirección
                    $direccion->update(['procesos_apoyo' => $procesosApoyoIds]);
                }
                
                return $direccion;
            });
            
            \Log::info('Dirección creada exitosamente', ['direccion_id' => $direccion->id]);

            // Limpiar cache de manera eficiente
            Cache::forget('direcciones_activas');
            Cache::forget('procesos_apoyo_todos');
            Cache::forget('dashboard_estadisticas');
            Cache::forget('total_direcciones');

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $direccion->id,
                    'nombre' => $direccion->nombre,
                    'descripcion' => $direccion->descripcion,
                    'codigo' => $direccion->codigo,
                    'procesos_apoyo' => $direccion->procesos_apoyo,
                    'orden' => $direccion->orden,
                    'activo' => $direccion->activo
                ],
                'message' => 'Dirección creada exitosamente'
            ], 201);

        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error('Error de base de datos al crear dirección: ' . $e->getMessage(), [
                'sql' => $e->getSql(),
                'bindings' => $e->getBindings(),
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error de base de datos al crear la dirección',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
            
        } catch (\Exception $e) {
            \Log::error('Error inesperado al crear dirección: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la dirección',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Actualizar una dirección (solo admin)
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            // Verificar permisos de administrador
            if (!auth()->user()->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para actualizar direcciones'
                ], 403);
            }

            $direccion = Direccion::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255|unique:direcciones,nombre,' . $id,
                'descripcion' => 'nullable|string',
                'codigo' => 'required|string|max:10|unique:direcciones,codigo,' . $id,
                'procesos_apoyo' => 'nullable|array',
                'procesos_apoyo.*' => 'integer|exists:procesos_apoyo,id',
                'orden' => 'nullable|integer|min:0',
                'activo' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $procesosApoyoIds = $request->input('procesos_apoyo', []);
            
            \Log::info('Actualizando dirección con procesos:', $procesosApoyoIds);

            // Actualizar en transacción
            \DB::transaction(function () use ($direccion, $request, $procesosApoyoIds) {
                // Actualizar datos básicos de la dirección
                $direccion->update($request->except(['procesos_apoyo']));
                
                // Limpiar relaciones anteriores (poner direccion_id = null)
                \App\Models\ProcesoApoyo::where('direccion_id', $direccion->id)
                    ->update(['direccion_id' => null]);
                
                // Actualizar los procesos de apoyo seleccionados
                if (!empty($procesosApoyoIds)) {
                    \App\Models\ProcesoApoyo::whereIn('id', $procesosApoyoIds)
                        ->update(['direccion_id' => $direccion->id]);
                }
                
                // Actualizar el campo JSON en la dirección
                $direccion->update(['procesos_apoyo' => $procesosApoyoIds]);
            });

            // Limpiar cache
            Cache::forget('direcciones_activas');
            Cache::forget("direccion_{$id}");
            Cache::forget('dashboard_estadisticas');
            Cache::forget('total_direcciones');
            Cache::forget('procesos_apoyo_todos_optimized');

            return response()->json([
                'success' => true,
                'data' => $direccion->fresh(),
                'message' => 'Dirección actualizada exitosamente'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dirección no encontrada'
            ], 404);

        } catch (\Exception $e) {
            \Log::error('Error al actualizar dirección: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la dirección',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Eliminar una dirección (solo admin)
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            // Verificar permisos de administrador
            if (!auth()->user()->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para eliminar direcciones'
                ], 403);
            }

            $direccion = Direccion::findOrFail($id);

            // Verificar si tiene documentos asociados
            if ($direccion->documentos()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar la dirección porque tiene documentos asociados'
                ], 422);
            }

            $direccion->delete();

            // Limpiar cache
            Cache::forget('direcciones_activas');
            Cache::forget("direccion_{$id}");
            Cache::forget('dashboard_estadisticas');
            Cache::forget('total_direcciones');

            return response()->json([
                'success' => true,
                'message' => 'Dirección eliminada exitosamente'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dirección no encontrada'
            ], 404);

        } catch (\Exception $e) {
            \Log::error('Error al eliminar dirección: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la dirección',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
} 