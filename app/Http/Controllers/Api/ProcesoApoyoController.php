<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProcesoApoyo;
use App\Models\Direccion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class ProcesoApoyoController extends Controller
{
    /**
     * Obtener todos los procesos de apoyo para select
     */
    public function todos(): JsonResponse
    {
        try {
            
            
            // Verificar si hay datos en la tabla
            $totalProcesos = ProcesoApoyo::count();
            
            
            // Cache optimizado para grandes volúmenes (5 minutos)
            $procesos = Cache::remember('procesos_apoyo_todos_optimized', 300, function () {
                
                
                $procesosRaw = ProcesoApoyo::activos()
                    ->ordenados()
                    ->select('id', 'nombre', 'codigo', 'direccion_id')
                    ->with(['direccion:id,nombre,codigo'])
                    ->get();
                
                
                
                return $procesosRaw->map(function ($proceso) {
                    $direccionNombre = $proceso->direccion ? $proceso->direccion->nombre : 'Sin dirección';
                    return [
                        'value' => $proceso->id,
                        'label' => $proceso->nombre . ' (' . $proceso->codigo . ') - ' . $direccionNombre
                    ];
                });
            });

            

            return response()->json([
                'success' => true,
                'data' => $procesos,
                'message' => 'Procesos de apoyo obtenidos exitosamente',
                'total' => count($procesos),
                'debug' => [
                    'total_en_bd' => $totalProcesos,
                    'procesos_activos' => count($procesos)
                ]
            ], 200);

        } catch (\Exception $e) {
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los procesos de apoyo',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener todos los procesos de apoyo activos con paginación optimizada
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = min($request->get('per_page', 50), 100); // Máximo 100 por página
            $page = $request->get('page', 1);
            $search = $request->get('search', '');
            $direccionId = $request->get('direccion_id');

            // Usar versión de caché para invalidar listados al crear/actualizar/eliminar
            $version = Cache::get('procesos_apoyo_cache_version', 1);
            $cacheKey = "procesos_apoyo_paginated_{$perPage}_{$page}_{$search}_{$direccionId}_v{$version}";
            
            $procesos = Cache::remember($cacheKey, 300, function () use ($perPage, $search, $direccionId) {
                $query = ProcesoApoyo::activos()
                    ->ordenados()
                    ->with(['direccion:id,nombre,codigo,color'])
                    ->withCount('documentos');

                // Filtro por búsqueda
                if ($search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('nombre', 'like', "%{$search}%")
                          ->orWhere('codigo', 'like', "%{$search}%")
                          ->orWhere('descripcion', 'like', "%{$search}%");
                    });
                }

                // Filtro por dirección
                if ($direccionId) {
                    $query->where('direccion_id', $direccionId);
                }

                return $query->paginate($perPage);
            });

            $data = $procesos->getCollection()->map(function ($proceso) {
                return [
                    'id' => $proceso->id,
                    'nombre' => $proceso->nombre,
                    'descripcion' => $proceso->descripcion,
                    'codigo' => $proceso->codigo,
                    // 'orden' eliminado
                    'direccion' => $proceso->direccion ? [
                        'id' => $proceso->direccion->id,
                        'nombre' => $proceso->direccion->nombre,
                        'codigo' => $proceso->direccion->codigo,
                        'color' => $proceso->direccion->color,
                    ] : null,
                    'estadisticas' => [
                        'total_documentos' => $proceso->documentos_count,
                    ]
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data,
                'pagination' => [
                    'current_page' => $procesos->currentPage(),
                    'last_page' => $procesos->lastPage(),
                    'per_page' => $procesos->perPage(),
                    'total' => $procesos->total(),
                    'from' => $procesos->firstItem(),
                    'to' => $procesos->lastItem(),
                ],
                'message' => 'Procesos de apoyo obtenidos exitosamente'
            ], 200);

        } catch (\Exception $e) {
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los procesos de apoyo',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener procesos de apoyo por dirección
     */
    public function porDireccion(int $direccionId): JsonResponse
    {
        try {
            $procesos = Cache::remember("procesos_apoyo_direccion_{$direccionId}", 300, function () use ($direccionId) {
                return ProcesoApoyo::activos()
                    ->porDireccion($direccionId)
                    ->ordenados()
                    ->withCount('documentos')
                    ->get()
                    ->map(function ($proceso) {
                        return [
                            'id' => $proceso->id,
                            'nombre' => $proceso->nombre,
                            'descripcion' => $proceso->descripcion,
                            'codigo' => $proceso->codigo,
                            // 'orden' eliminado
                            'estadisticas' => [
                                'total_documentos' => $proceso->documentos_count,
                            ]
                        ];
                    });
            });

            return response()->json([
                'success' => true,
                'data' => $procesos,
                'message' => 'Procesos de apoyo obtenidos exitosamente'
            ], 200);

        } catch (\Exception $e) {
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los procesos de apoyo',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener un proceso de apoyo específico
     */
    public function show(int $id): JsonResponse
    {
        try {
            $proceso = Cache::remember("proceso_apoyo_{$id}", 300, function () use ($id) {
                return ProcesoApoyo::activos()
                    ->with(['direccion'])
                    ->with(['documentos' => function ($query) {
                        $query->with(['subidoPor'])
                              ->orderBy('created_at', 'desc')
                              ->limit(10);
                    }])
                    ->findOrFail($id);
            });

            $data = [
                'id' => $proceso->id,
                'nombre' => $proceso->nombre,
                'descripcion' => $proceso->descripcion,
                'codigo' => $proceso->codigo,
                // 'orden' eliminado
                'direccion' => [
                    'id' => $proceso->direccion->id,
                    'nombre' => $proceso->direccion->nombre,
                    'codigo' => $proceso->direccion->codigo,
                    'color' => $proceso->direccion->color,
                ],
                'estadisticas' => $proceso->estadisticas,
                'documentos_recientes' => $proceso->documentos->map(function ($documento) {
                    return [
                        'id' => $documento->id,
                        'titulo' => $documento->titulo,
                        'descripcion' => $documento->descripcion,
                        'tipo_archivo' => $documento->tipo_archivo,
                        'tamaño_formateado' => $documento->tamaño_formateado,
                        'contador_descargas' => $documento->contador_descargas,

                        'fecha_creacion' => $documento->created_at->format('Y-m-d H:i:s'),
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
                'message' => 'Proceso de apoyo obtenido exitosamente'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Proceso de apoyo no encontrado'
            ], 404);

        } catch (\Exception $e) {
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el proceso de apoyo',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Crear un nuevo proceso de apoyo (solo admin)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            
            
            // Verificar permisos de administrador
            if (!auth()->user()->is_admin) {
                
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para crear procesos de apoyo'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255|unique:procesos_apoyo,nombre',
                'descripcion' => 'nullable|string|max:1000',
                'direccion_id' => 'required|exists:direcciones,id',
                'codigo' => 'nullable|string|max:20|unique:procesos_apoyo,codigo',
                    // 'orden' eliminado completamente
            ], [
                'nombre.required' => 'El nombre es obligatorio',
                'nombre.unique' => 'Ya existe un proceso con ese nombre',
                'codigo.unique' => 'Ya existe un proceso con ese código',
                'direccion_id.required' => 'La dirección es obligatoria',
                'direccion_id.exists' => 'La dirección seleccionada no existe'
            ]);

            if ($validator->fails()) {
                
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Preparar datos para inserción
            $data = $request->only(['nombre', 'descripcion', 'direccion_id', 'codigo']);
            $data['activo'] = true;
            

            
            
            // Crear proceso de apoyo con transacción para consistencia
            $proceso = \DB::transaction(function () use ($data) {
                return ProcesoApoyo::create($data);
            });
            
            

            // Limpiar cache de manera eficiente
            Cache::forget('procesos_apoyo_activos');
            Cache::forget("procesos_apoyo_direccion_{$data['direccion_id']}");
            Cache::forget('procesos_apoyo_todos_optimized');
            Cache::forget('dashboard_estadisticas');
            Cache::forget('total_procesos');
            // Invalidar caches de la dirección afectada
            Cache::forget('direcciones_activas');
            Cache::forget("direccion_{$proceso->direccion_id}");
            Cache::forget("direccion_estadisticas_{$proceso->direccion_id}");
            Cache::forget("direccion_procesos_{$proceso->direccion_id}");
            Cache::increment('procesos_apoyo_cache_version');

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $proceso->id,
                    'nombre' => $proceso->nombre,
                    'descripcion' => $proceso->descripcion,
                    'codigo' => $proceso->codigo,
                    'direccion_id' => $proceso->direccion_id,
                // 'orden' eliminado
                    'activo' => $proceso->activo
                ],
                'message' => 'Proceso de apoyo creado exitosamente'
            ], 201);

        } catch (\Illuminate\Database\QueryException $e) {
            
            return response()->json([
                'success' => false,
                'message' => 'Error de base de datos al crear el proceso de apoyo',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
            
        } catch (\Exception $e) {
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el proceso de apoyo',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Actualizar un proceso de apoyo (solo admin)
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            // Verificar permisos de administrador
            if (!auth()->user()->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para actualizar procesos de apoyo'
                ], 403);
            }

            $proceso = ProcesoApoyo::findOrFail($id);
            $oldDireccionId = $proceso->direccion_id;

            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'direccion_id' => 'required|exists:direcciones,id',
                'codigo' => 'nullable|string|max:20',
                'activo' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $proceso->update($request->all());
            $newDireccionId = $proceso->direccion_id;

            // Limpiar cache (listados y dashboard)
            Cache::forget('procesos_apoyo_activos');
            // procesos por dirección (nueva y anterior si cambió)
            Cache::forget("procesos_apoyo_direccion_{$newDireccionId}");
            if ($oldDireccionId && $oldDireccionId !== $newDireccionId) {
                Cache::forget("procesos_apoyo_direccion_{$oldDireccionId}");
            }
            Cache::forget("proceso_apoyo_{$id}");
            Cache::forget('dashboard_estadisticas');
            Cache::forget('total_procesos');
            // caches de direcciones (nueva y anterior)
            Cache::forget('direcciones_activas');
            Cache::forget("direccion_{$newDireccionId}");
            Cache::forget("direccion_estadisticas_{$newDireccionId}");
            Cache::forget("direccion_procesos_{$newDireccionId}");
            if ($oldDireccionId && $oldDireccionId !== $newDireccionId) {
                Cache::forget("direccion_{$oldDireccionId}");
                Cache::forget("direccion_estadisticas_{$oldDireccionId}");
                Cache::forget("direccion_procesos_{$oldDireccionId}");
            }
            Cache::increment('procesos_apoyo_cache_version');

            return response()->json([
                'success' => true,
                'data' => $proceso,
                'message' => 'Proceso de apoyo actualizado exitosamente'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Proceso de apoyo no encontrado'
            ], 404);

        } catch (\Exception $e) {
            
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el proceso de apoyo',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Eliminar un proceso de apoyo (solo admin)
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            // Verificar permisos de administrador
            if (!auth()->user()->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para eliminar procesos de apoyo'
                ], 403);
            }

            $proceso = ProcesoApoyo::findOrFail($id);

            // Verificar si tiene documentos asociados
            if ($proceso->documentos()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el proceso porque tiene documentos asociados'
                ], 422);
            }

            $direccionId = $proceso->direccion_id;
            $proceso->delete();

            // Limpiar cache
            Cache::forget('procesos_apoyo_activos');
            Cache::forget("procesos_apoyo_direccion_{$direccionId}");
            Cache::forget("proceso_apoyo_{$id}");
            Cache::forget('dashboard_estadisticas');
            Cache::forget('total_procesos');
            Cache::increment('procesos_apoyo_cache_version');

            return response()->json([
                'success' => true,
                'message' => 'Proceso de apoyo eliminado exitosamente'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Proceso de apoyo no encontrado'
            ], 404);

        } catch (\Exception $e) {
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el proceso de apoyo',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener documentos de un proceso de apoyo
     */
    public function documentos(int $id): JsonResponse
    {
        try {
            $proceso = ProcesoApoyo::activos()->findOrFail($id);
            $documentos = $proceso->documentosConPaginacion();

            return response()->json([
                'success' => true,
                'data' => $documentos,
                'message' => 'Documentos del proceso obtenidos exitosamente'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Proceso de apoyo no encontrado'
            ], 404);

        } catch (\Exception $e) {
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los documentos',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
} 