<?php

namespace App\Http\Controllers\Api\Processes;

use App\Http\Controllers\Controller;
use App\Models\ProcesoInterno;
use App\Models\ProcesoGeneral;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class ProcesoInternoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $procesos = Cache::remember('procesos_internos_unicos', 3600, function () {
                return ProcesoInterno::select('nombre', 'descripcion', 'icono')
                    ->activos()
                    ->groupBy('nombre', 'descripcion', 'icono')
                    ->orderBy('nombre')
                    ->get()
                    ->map(function($item, $index) {
                        return [
                            'id' => $index + 1,
                            'nombre' => $item->nombre,
                            'descripcion' => $item->descripcion,
                            'icono' => $item->icono
                        ];
                    });
            });

            return response()->json([
                'success' => true,
                'data' => $procesos
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener procesos internos: ' . $e->getMessage()
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
                            'icono' => $proceso->icono
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
            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'proceso_general_id' => 'required|exists:procesos_generales,id',
                'icono' => 'nullable|string|max:50'
            ], [
                'nombre.required' => 'El nombre es obligatorio',
                'proceso_general_id.required' => 'El proceso general es obligatorio',
                'proceso_general_id.exists' => 'El proceso general seleccionado no existe'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $proceso = ProcesoInterno::create([
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
                'proceso_general_id' => $request->proceso_general_id,
                'icono' => $request->icono ?? 'folder',
                'activo' => true
            ]);

            // Limpiar cache
            Cache::forget('procesos_internos');
            Cache::forget("procesos_internos_proceso_general_{$request->proceso_general_id}");

            return response()->json([
                'success' => true,
                'data' => $proceso->load('procesoGeneral:id,nombre'),
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
