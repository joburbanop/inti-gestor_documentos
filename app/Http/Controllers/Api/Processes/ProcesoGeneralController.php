<?php

namespace App\Http\Controllers\Api\Processes;

use App\Http\Controllers\Controller;
use App\Models\ProcesoGeneral;
use App\Models\ProcesoTipo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class ProcesoGeneralController extends Controller
{
    /**
     * Obtener todos los procesos generales activos con estadísticas
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = ProcesoGeneral::activos()->ordenados();
            
            // Filtrar por tipo si se proporciona
            if ($request->has('tipo')) {
                $tipo = $request->get('tipo');
                $query->porTipo($tipo);
            }

            $procesosGenerales = $query->with(['tipoProceso', 'procesosInternos' => function ($query) {
                $query->activos()->ordenados();
            }])->get();

            return response()->json([
                'success' => true,
                'data' => $procesosGenerales->map(function ($procesoGeneral) {
                    return [
                        'id' => $procesoGeneral->id,
                        'nombre' => $procesoGeneral->nombre,
                        'descripcion' => $procesoGeneral->descripcion,
                        'icono' => $procesoGeneral->icono,
                        'estadisticas' => $procesoGeneral->estadisticas,
                        'tipo_proceso' => [
                            'id' => $procesoGeneral->tipoProceso->id,
                            'nombre' => $procesoGeneral->tipoProceso->nombre,
                            'titulo' => $procesoGeneral->tipoProceso->titulo,
                            'icono' => $procesoGeneral->tipoProceso->icono,
                        ],
                        'procesos_internos' => $procesoGeneral->procesosInternos->map(function ($procesoInterno) {
                            return [
                                'id' => $procesoInterno->id,
                                'nombre' => $procesoInterno->nombre,
                                'descripcion' => $procesoInterno->descripcion,
                                'icono' => $procesoInterno->icono,
                                'total_documentos' => $procesoInterno->documentos()->count()
                            ];
                        })
                    ];
                }),
                'message' => 'Procesos generales obtenidos exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los procesos generales',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener un proceso general específico con sus procesos internos
     */
    public function show(int $id): JsonResponse
    {
        try {
            $procesoGeneral = ProcesoGeneral::activos()
                ->with(['tipoProceso', 'procesosInternos' => function ($query) {
                    $query->activos()->ordenados();
                }])
                ->withCount(['procesosInternos' => function ($query) {
                    $query->where('activo', true);
                }])
                ->with(['documentos' => function ($query) {
                    $query->with(['procesoInterno', 'subidoPor'])
                          ->orderBy('created_at', 'desc')
                          ->limit(10);
                }])
                ->findOrFail($id);

            $data = [
                'id' => $procesoGeneral->id,
                'nombre' => $procesoGeneral->nombre,
                'descripcion' => $procesoGeneral->descripcion,
                'icono' => $procesoGeneral->icono,
                'estadisticas' => $procesoGeneral->estadisticas,
                'tipo_proceso' => [
                    'id' => $procesoGeneral->tipoProceso->id,
                    'nombre' => $procesoGeneral->tipoProceso->nombre,
                    'titulo' => $procesoGeneral->tipoProceso->titulo,
                    'icono' => $procesoGeneral->tipoProceso->icono,
                ],
                'procesos_internos' => $procesoGeneral->procesosInternos->map(function ($procesoInterno) {
                    return [
                        'id' => $procesoInterno->id,
                        'nombre' => $procesoInterno->nombre,
                        'descripcion' => $procesoInterno->descripcion,
                        'icono' => $procesoInterno->icono,
                        'total_documentos' => $procesoInterno->documentos()->count()
                    ];
                }),
                'documentos_recientes' => $procesoGeneral->documentos->map(function ($documento) {
                    return [
                        'id' => $documento->id,
                        'titulo' => $documento->titulo,
                        'nombre_archivo' => $documento->nombre_archivo,
                        'created_at' => $documento->created_at,
                        'proceso_interno' => $documento->procesoInterno ? [
                            'id' => $documento->procesoInterno->id,
                            'nombre' => $documento->procesoInterno->nombre
                        ] : null,
                        'subido_por' => $documento->subidoPor ? [
                            'id' => $documento->subidoPor->id,
                            'name' => $documento->subidoPor->name
                        ] : null
                    ];
                })
            ];

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Proceso general obtenido exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el proceso general',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Crear un nuevo proceso general
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Log para debugging
            \Log::info('🔍 [ProcesoGeneralController::store] Datos recibidos:', $request->all());
            
            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255|unique:procesos_generales,nombre',
                'descripcion' => 'nullable|string',
                'icono' => 'nullable|string|max:50',
                'tipo_proceso_id' => 'required|exists:tipos_procesos,id'
            ]);

            if ($validator->fails()) {
                \Log::error('❌ [ProcesoGeneralController::store] Error de validación:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de validación incorrectos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $procesoGeneral = ProcesoGeneral::create([
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
                'icono' => $request->icono,
                'tipo_proceso_id' => $request->tipo_proceso_id,
                'activo' => true
            ]);

            // Cargar relaciones para la respuesta
            $procesoGeneral->load(['tipoProceso', 'procesosInternos']);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $procesoGeneral->id,
                    'nombre' => $procesoGeneral->nombre,
                    'descripcion' => $procesoGeneral->descripcion,
                    'icono' => $procesoGeneral->icono,
                    'tipo_proceso' => [
                        'id' => $procesoGeneral->tipoProceso->id,
                        'nombre' => $procesoGeneral->tipoProceso->nombre,
                        'titulo' => $procesoGeneral->tipoProceso->titulo,
                        'icono' => $procesoGeneral->tipoProceso->icono,
                    ],
                    'procesos_internos' => []
                ],
                'message' => 'Proceso general creado exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el proceso general',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Actualizar un proceso general
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $procesoGeneral = ProcesoGeneral::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'nombre' => 'sometimes|required|string|max:255|unique:procesos_generales,nombre,' . $id,
                'descripcion' => 'nullable|string',
                'icono' => 'nullable|string|max:50',
                'tipo_proceso_id' => 'sometimes|required|exists:tipos_procesos,id',
                'activo' => 'sometimes|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de validación incorrectos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $procesoGeneral->update($request->only(['nombre', 'descripcion', 'icono', 'tipo_proceso_id', 'activo']));

            // Cargar relaciones para la respuesta
            $procesoGeneral->load(['tipoProceso', 'procesosInternos' => function ($query) {
                $query->activos()->ordenados();
            }]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $procesoGeneral->id,
                    'nombre' => $procesoGeneral->nombre,
                    'descripcion' => $procesoGeneral->descripcion,
                    'icono' => $procesoGeneral->icono,
                    'activo' => $procesoGeneral->activo,
                    'tipo_proceso' => [
                        'id' => $procesoGeneral->tipoProceso->id,
                        'nombre' => $procesoGeneral->tipoProceso->nombre,
                        'titulo' => $procesoGeneral->tipoProceso->titulo,
                        'icono' => $procesoGeneral->tipoProceso->icono,
                    ],
                    'procesos_internos' => $procesoGeneral->procesosInternos->map(function ($procesoInterno) {
                        return [
                            'id' => $procesoInterno->id,
                            'nombre' => $procesoInterno->nombre,
                            'descripcion' => $procesoInterno->descripcion,
                            'icono' => $procesoInterno->icono,
                        ];
                    })
                ],
                'message' => 'Proceso general actualizado exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el proceso general',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Eliminar un proceso general (soft delete)
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            // Log para debugging
            \Log::info('🔍 [ProcesoGeneralController::destroy] Intentando eliminar proceso general ID:', ['id' => $id]);
            
            $procesoGeneral = ProcesoGeneral::findOrFail($id);
            
            // Verificar si tiene procesos internos activos
            $procesosInternosActivos = $procesoGeneral->procesosInternos()->where('activo', true)->count();
            \Log::info('🔍 [ProcesoGeneralController::destroy] Procesos internos activos:', ['count' => $procesosInternosActivos]);
            
            if ($procesosInternosActivos > 0) {
                \Log::warning('❌ [ProcesoGeneralController::destroy] No se puede eliminar - tiene procesos internos activos');
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el proceso general porque tiene procesos internos activos',
                    'data' => [
                        'procesos_internos_activos' => $procesosInternosActivos
                    ]
                ], 422);
            }

            // Verificar si tiene documentos
            $documentosCount = $procesoGeneral->documentos()->count();
            \Log::info('🔍 [ProcesoGeneralController::destroy] Documentos asociados:', ['count' => $documentosCount]);
            
            if ($documentosCount > 0) {
                \Log::warning('❌ [ProcesoGeneralController::destroy] No se puede eliminar - tiene documentos asociados');
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el proceso general porque tiene documentos asociados',
                    'data' => [
                        'documentos_count' => $documentosCount
                    ]
                ], 422);
            }

            $procesoGeneral->update(['activo' => false]);

            return response()->json([
                'success' => true,
                'message' => 'Proceso general eliminado exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el proceso general',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener documentos de un proceso general
     */
    public function documentos(int $id): JsonResponse
    {
        try {
            $procesoGeneral = ProcesoGeneral::activos()->findOrFail($id);
            
            $documentos = $procesoGeneral->documentos()
                ->with(['procesoInterno', 'subidoPor'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => [
                    'proceso_general' => [
                        'id' => $procesoGeneral->id,
                        'nombre' => $procesoGeneral->nombre,
                        'descripcion' => $procesoGeneral->descripcion
                    ],
                    'documentos' => $documentos->items(),
                    'pagination' => [
                        'current_page' => $documentos->currentPage(),
                        'last_page' => $documentos->lastPage(),
                        'per_page' => $documentos->perPage(),
                        'total' => $documentos->total(),
                    ]
                ],
                'message' => 'Documentos del proceso general obtenidos exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los documentos del proceso general',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener tipos de procesos disponibles para el formulario
     */
    public function tiposDisponibles(): JsonResponse
    {
        try {
            $tipos = ProcesoTipo::activos()->ordenados()->get();

            return response()->json([
                'success' => true,
                'data' => $tipos->map(function ($tipo) {
                    return [
                        'id' => $tipo->id,
                        'nombre' => $tipo->nombre,
                        'titulo' => $tipo->titulo,
                        'descripcion' => $tipo->descripcion,
                        'icono' => $tipo->icono
                    ];
                }),
                'message' => 'Tipos de procesos obtenidos exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los tipos de procesos',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener acciones rápidas (Tipos de Procesos) - Temporal
     */
    public function accionesRapidas(): JsonResponse
    {
        try {
            $tiposProcesos = ProcesoTipo::activos()
                ->ordenados()
                ->withCount(['procesosGenerales' => function ($query) {
                    $query->where('activo', true);
                }])
                ->get();

            $accionesRapidas = $tiposProcesos->map(function ($tipo) {
                return [
                    'id' => $tipo->id,
                    'titulo' => $tipo->titulo,
                    'descripcion' => $tipo->descripcion,
                    'icono' => $tipo->icono,
                    'key' => $tipo->nombre,
                    'total_procesos' => $tipo->procesos_generales_count,
                    'color' => $this->getColorForTipo($tipo->nombre),
                    'url' => "/procesos?tipo={$tipo->nombre}"
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $accionesRapidas,
                'message' => 'Acciones rápidas obtenidas exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las acciones rápidas',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener color para cada tipo de proceso
     */
    private function getColorForTipo(string $tipo): string
    {
        $colores = [
            'estrategico' => '#1E40AF', // Azul
            'misional' => '#059669',    // Verde
            'apoyo' => '#7C3AED',       // Púrpura
            'evaluacion' => '#DC2626'   // Rojo
        ];

        return $colores[$tipo] ?? '#6B7280';
    }
}
