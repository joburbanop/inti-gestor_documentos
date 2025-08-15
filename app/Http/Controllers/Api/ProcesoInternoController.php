<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proceso;
use App\Models\Direccion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ProcesoInternoController extends Controller
{
    /**
     * Obtener todos los procesos internos
     */
    public function index(): JsonResponse
    {
        try {
            $procesos = Cache::remember('procesos_internos', 300, function () {
                return Proceso::where('tipo', 'interno')
                    ->where('activo', true)
                    ->with('direcciones')
                    ->orderBy('nombre')
                    ->get()
                    ->map(function ($proceso) {
                        return [
                            'id' => $proceso->id,
                            'nombre' => $proceso->nombre,
                            'descripcion' => $proceso->descripcion,
                            'codigo' => $proceso->codigo,
                            'color' => $proceso->color,
                            'direcciones' => $proceso->direcciones->map(function ($direccion) {
                                return [
                                    'id' => $direccion->id,
                                    'nombre' => $direccion->nombre,
                                    'codigo' => $direccion->codigo
                                ];
                            })
                        ];
                    });
            });

            return response()->json([
                'success' => true,
                'data' => $procesos,
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

    /**
     * Obtener procesos internos por proceso general
     */
    public function porProcesoGeneral(int $procesoGeneralId): JsonResponse
    {
        try {
                    $procesos = Cache::remember("procesos_internos_proceso_general_{$procesoGeneralId}", 300, function () use ($procesoGeneralId) {
            return ProcesoInterno::activos()
                ->porProcesoGeneral($procesoGeneralId)
                ->ordenados()
                ->get()
                ->map(function ($proceso) {
                    return [
                        'id' => $proceso->id,
                        'nombre' => $proceso->nombre,
                        'descripcion' => $proceso->descripcion,
                        'codigo' => $proceso->codigo,
                        'color' => $proceso->color
                    ];
                });
        });

            return response()->json([
                'success' => true,
                'data' => $procesos,
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

    /**
     * Crear un nuevo proceso interno
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'nombre' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'codigo' => 'nullable|string|max:50|unique:procesos,codigo',
                'color' => 'nullable|string|max:20',
                'proceso_general_id' => 'required|exists:procesos_generales,id'
            ]);

            $proceso = ProcesoInterno::create([
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
                'codigo' => $request->codigo,
                'color' => $request->color ?? '#1F448B',
                'proceso_general_id' => $request->proceso_general_id,
                'activo' => true
            ]);

            // Limpiar cache
            Cache::forget('procesos_internos_todos');
            Cache::forget("procesos_internos_proceso_general_{$request->proceso_general_id}");

            return response()->json([
                'success' => true,
                'data' => $proceso,
                'message' => 'Proceso interno creado exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el proceso interno',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
