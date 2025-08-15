<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProcesoGeneral;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class ProcesoGeneralController extends Controller
{
    /**
     * Obtener todos los procesos generales activos con estadísticas
     */
    public function index(): JsonResponse
    {
        try {
            $procesosGenerales = ProcesoGeneral::getActivos();

            return response()->json([
                'success' => true,
                'data' => $procesosGenerales->map(function ($procesoGeneral) {
                    return [
                        'id' => $procesoGeneral->id,
                        'nombre' => $procesoGeneral->nombre,
                        'descripcion' => $procesoGeneral->descripcion,
                        'codigo' => $procesoGeneral->codigo,
                        'color' => $procesoGeneral->color,
                        'estadisticas' => $procesoGeneral->estadisticas,
                        'procesos_internos' => $procesoGeneral->procesosInternos->map(function ($procesoInterno) {
                            return [
                                'id' => $procesoInterno->id,
                                'nombre' => $procesoInterno->nombre,
                                'descripcion' => $procesoInterno->descripcion,
                                'codigo' => $procesoInterno->codigo,
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
                ->with(['procesosInternos' => function ($query) {
                    $query->activos()->orderBy('nombre');
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
                'codigo' => $procesoGeneral->codigo,
                'color' => $procesoGeneral->color,
                'estadisticas' => $procesoGeneral->estadisticas,
                'procesos_internos' => $procesoGeneral->procesosInternos->map(function ($procesoInterno) {
                    return [
                        'id' => $procesoInterno->id,
                        'nombre' => $procesoInterno->nombre,
                        'descripcion' => $procesoInterno->descripcion,
                        'codigo' => $procesoInterno->codigo,
                        'color' => $procesoInterno->color,
                        'total_documentos' => $procesoInterno->documentos()->count()
                    ];
                }),
                'documentos_recientes' => $procesoGeneral->documentos->map(function ($documento) {
                    return [
                        'id' => $documento->id,
                        'titulo' => $documento->titulo,
                        'archivo' => $documento->archivo,
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
            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'codigo' => 'required|string|max:50|unique:procesos_generales,codigo',
                'color' => 'nullable|string|max:20',
                'orden' => 'nullable|integer|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de validación incorrectos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $procesoGeneral = ProcesoGeneral::create([
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
                'codigo' => strtoupper($request->codigo),
                'color' => $request->color ?? '#1F448B',
                'orden' => $request->orden ?? 0,
                'activo' => true
            ]);

            return response()->json([
                'success' => true,
                'data' => $procesoGeneral,
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
                'nombre' => 'sometimes|required|string|max:255',
                'descripcion' => 'nullable|string',
                'codigo' => 'sometimes|required|string|max:50|unique:procesos_generales,codigo,' . $id,
                'color' => 'nullable|string|max:20',
                'orden' => 'nullable|integer|min:0',
                'activo' => 'sometimes|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de validación incorrectos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $procesoGeneral->update($request->only(['nombre', 'descripcion', 'codigo', 'color', 'orden', 'activo']));

            return response()->json([
                'success' => true,
                'data' => $procesoGeneral,
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
     * Eliminar un proceso general
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $procesoGeneral = ProcesoGeneral::findOrFail($id);
            $procesoGeneral->delete();

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
}
