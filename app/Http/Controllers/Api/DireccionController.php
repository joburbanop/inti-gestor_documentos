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
                    ->withCount(['documentos', 'procesosApoyo'])
                    ->get()
                    ->map(function ($direccion) {
                        return [
                            'id' => $direccion->id,
                            'nombre' => $direccion->nombre,
                            'descripcion' => $direccion->descripcion,
                            'codigo' => $direccion->codigo,
                            'color' => $direccion->color,
                            'orden' => $direccion->orden,
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
                'color' => $direccion->color,
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
            // Verificar permisos de administrador
            if (!auth()->user()->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para crear direcciones'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255|unique:direcciones,nombre',
                'descripcion' => 'nullable|string',
                'codigo' => 'required|string|max:10|unique:direcciones,codigo',
                'color' => 'required|string|max:7',
                'orden' => 'nullable|integer|min:0'
            ], [
                'nombre.required' => 'El nombre es obligatorio',
                'nombre.unique' => 'Ya existe una dirección con ese nombre',
                'codigo.required' => 'El código es obligatorio',
                'codigo.unique' => 'Ya existe una dirección con ese código',
                'color.required' => 'El color es obligatorio'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $direccion = Direccion::create($request->all());

            // Limpiar cache
            Cache::forget('direcciones_activas');

            return response()->json([
                'success' => true,
                'data' => $direccion,
                'message' => 'Dirección creada exitosamente'
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Error al crear dirección: ' . $e->getMessage());
            
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
                'color' => 'required|string|max:7',
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

            $direccion->update($request->all());

            // Limpiar cache
            Cache::forget('direcciones_activas');
            Cache::forget("direccion_{$id}");

            return response()->json([
                'success' => true,
                'data' => $direccion,
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