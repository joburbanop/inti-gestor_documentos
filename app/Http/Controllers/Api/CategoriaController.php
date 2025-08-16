<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\ProcesoInterno;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class CategoriaController extends Controller
{
    /**
     * Obtener todas las categorías activas
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Categoria::activas()->ordenadas();
            
            // Filtrar por proceso interno si se proporciona
            if ($request->has('proceso_interno_id')) {
                $procesoInternoId = $request->get('proceso_interno_id');
                $query->porProcesoInterno($procesoInternoId);
            }

            $categorias = $query->with(['procesoInterno.procesoGeneral.tipoProceso'])->get();

            return response()->json([
                'success' => true,
                'data' => $categorias->map(function ($categoria) {
                    return [
                        'id' => $categoria->id,
                        'nombre' => $categoria->nombre,
                        'descripcion' => $categoria->descripcion,
                        'icono' => $categoria->icono,
                        'estadisticas' => $categoria->estadisticas,
                        'proceso_interno' => [
                            'id' => $categoria->procesoInterno->id,
                            'nombre' => $categoria->procesoInterno->nombre,
                            'descripcion' => $categoria->procesoInterno->descripcion,
                            'proceso_general' => [
                                'id' => $categoria->procesoInterno->procesoGeneral->id,
                                'nombre' => $categoria->procesoInterno->procesoGeneral->nombre,
                                'tipo_proceso' => [
                                    'id' => $categoria->procesoInterno->procesoGeneral->tipoProceso->id,
                                    'nombre' => $categoria->procesoInterno->procesoGeneral->tipoProceso->nombre,
                                    'titulo' => $categoria->procesoInterno->procesoGeneral->tipoProceso->titulo,
                                ]
                            ]
                        ]
                    ];
                }),
                'message' => 'Categorías obtenidas exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las categorías',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener una categoría específica
     */
    public function show(int $id): JsonResponse
    {
        try {
            $categoria = Categoria::activas()
                ->with(['procesoInterno.procesoGeneral.tipoProceso', 'documentos' => function ($query) {
                    $query->with(['subidoPor'])->orderBy('created_at', 'desc');
                }])
                ->findOrFail($id);

            $data = [
                'id' => $categoria->id,
                'nombre' => $categoria->nombre,
                'descripcion' => $categoria->descripcion,
                'icono' => $categoria->icono,
                'estadisticas' => $categoria->estadisticas,
                'proceso_interno' => [
                    'id' => $categoria->procesoInterno->id,
                    'nombre' => $categoria->procesoInterno->nombre,
                    'descripcion' => $categoria->procesoInterno->descripcion,
                    'proceso_general' => [
                        'id' => $categoria->procesoInterno->procesoGeneral->id,
                        'nombre' => $categoria->procesoInterno->procesoGeneral->nombre,
                        'tipo_proceso' => [
                            'id' => $categoria->procesoInterno->procesoGeneral->tipoProceso->id,
                            'nombre' => $categoria->procesoInterno->procesoGeneral->tipoProceso->nombre,
                            'titulo' => $categoria->procesoInterno->procesoGeneral->tipoProceso->titulo,
                        ]
                    ]
                ],
                'documentos' => $categoria->documentos->map(function ($documento) {
                    return [
                        'id' => $documento->id,
                        'titulo' => $documento->titulo,
                        'nombre_archivo' => $documento->nombre_archivo,
                        'tipo_archivo' => $documento->tipo_archivo,
                        'extension' => $documento->extension,
                        'tamaño_archivo' => $documento->tamaño_archivo,
                        'created_at' => $documento->created_at,
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
                'message' => 'Categoría obtenida exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la categoría',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Crear una nueva categoría
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'icono' => 'nullable|string|max:50',
                'proceso_interno_id' => 'required|exists:procesos_internos,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de validación incorrectos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verificar que no exista una categoría con el mismo nombre en el mismo proceso interno
            $existeCategoria = Categoria::where('nombre', $request->nombre)
                ->where('proceso_interno_id', $request->proceso_interno_id)
                ->exists();

            if ($existeCategoria) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya existe una categoría con ese nombre en este proceso interno'
                ], 422);
            }

            $categoria = Categoria::create([
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
                'icono' => $request->icono,
                'proceso_interno_id' => $request->proceso_interno_id,
                'activo' => true
            ]);

            // Cargar relaciones para la respuesta
            $categoria->load(['procesoInterno.procesoGeneral.tipoProceso']);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $categoria->id,
                    'nombre' => $categoria->nombre,
                    'descripcion' => $categoria->descripcion,
                    'icono' => $categoria->icono,
                    'proceso_interno' => [
                        'id' => $categoria->procesoInterno->id,
                        'nombre' => $categoria->procesoInterno->nombre,
                        'proceso_general' => [
                            'id' => $categoria->procesoInterno->procesoGeneral->id,
                            'nombre' => $categoria->procesoInterno->procesoGeneral->nombre,
                            'tipo_proceso' => [
                                'id' => $categoria->procesoInterno->procesoGeneral->tipoProceso->id,
                                'nombre' => $categoria->procesoInterno->procesoGeneral->tipoProceso->nombre,
                                'titulo' => $categoria->procesoInterno->procesoGeneral->tipoProceso->titulo,
                            ]
                        ]
                    ]
                ],
                'message' => 'Categoría creada exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la categoría',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Actualizar una categoría
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $categoria = Categoria::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'nombre' => 'sometimes|required|string|max:255',
                'descripcion' => 'nullable|string',
                'icono' => 'nullable|string|max:50',
                'activo' => 'sometimes|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de validación incorrectos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verificar que no exista otra categoría con el mismo nombre en el mismo proceso interno
            if ($request->has('nombre') && $request->nombre !== $categoria->nombre) {
                $existeCategoria = Categoria::where('nombre', $request->nombre)
                    ->where('proceso_interno_id', $categoria->proceso_interno_id)
                    ->where('id', '!=', $id)
                    ->exists();

                if ($existeCategoria) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ya existe una categoría con ese nombre en este proceso interno'
                    ], 422);
                }
            }

            $categoria->update($request->only(['nombre', 'descripcion', 'icono', 'activo']));

            // Cargar relaciones para la respuesta
            $categoria->load(['procesoInterno.procesoGeneral.tipoProceso']);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $categoria->id,
                    'nombre' => $categoria->nombre,
                    'descripcion' => $categoria->descripcion,
                    'icono' => $categoria->icono,
                    'activo' => $categoria->activo,
                    'proceso_interno' => [
                        'id' => $categoria->procesoInterno->id,
                        'nombre' => $categoria->procesoInterno->nombre,
                        'proceso_general' => [
                            'id' => $categoria->procesoInterno->procesoGeneral->id,
                            'nombre' => $categoria->procesoInterno->procesoGeneral->nombre,
                            'tipo_proceso' => [
                                'id' => $categoria->procesoInterno->procesoGeneral->tipoProceso->id,
                                'nombre' => $categoria->procesoInterno->procesoGeneral->tipoProceso->nombre,
                                'titulo' => $categoria->procesoInterno->procesoGeneral->tipoProceso->titulo,
                            ]
                        ]
                    ]
                ],
                'message' => 'Categoría actualizada exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la categoría',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Eliminar una categoría (soft delete)
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $categoria = Categoria::findOrFail($id);
            
            // Verificar si tiene documentos
            $documentosCount = $categoria->documentos()->count();
            
            if ($documentosCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar la categoría porque tiene documentos asociados',
                    'data' => [
                        'documentos_count' => $documentosCount
                    ]
                ], 422);
            }

            $categoria->update(['activo' => false]);

            return response()->json([
                'success' => true,
                'message' => 'Categoría eliminada exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la categoría',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener procesos internos disponibles para el formulario
     */
    public function procesosInternosDisponibles(): JsonResponse
    {
        try {
            $procesosInternos = ProcesoInterno::activos()
                ->ordenados()
                ->with(['procesoGeneral.tipoProceso'])
                ->get();

            return response()->json([
                'success' => true,
                'data' => $procesosInternos->map(function ($procesoInterno) {
                    return [
                        'id' => $procesoInterno->id,
                        'nombre' => $procesoInterno->nombre,
                        'descripcion' => $procesoInterno->descripcion,
                        'proceso_general' => [
                            'id' => $procesoInterno->procesoGeneral->id,
                            'nombre' => $procesoInterno->procesoGeneral->nombre,
                            'tipo_proceso' => [
                                'id' => $procesoInterno->procesoGeneral->tipoProceso->id,
                                'nombre' => $procesoInterno->procesoGeneral->tipoProceso->nombre,
                                'titulo' => $procesoInterno->procesoGeneral->tipoProceso->titulo,
                            ]
                        ]
                    ];
                }),
                'message' => 'Procesos internos obtenidos exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los procesos internos',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
