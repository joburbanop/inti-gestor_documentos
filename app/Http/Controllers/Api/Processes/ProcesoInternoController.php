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
     * Retorna procesos internos estándar (carpetas que son iguales para todos)
     */
    public function index()
    {
        try {
            $procesos = Cache::remember('procesos_internos_estandar', 3600, function () {
                return ProcesoInterno::whereNull('proceso_general_id') // Solo procesos internos estándar
                    ->activos()
                    ->orderBy('nombre')
                    ->get()
                    ->map(function($proceso) {
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
                'message' => 'Procesos internos estándar obtenidos exitosamente'
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
     * Obtener documentos de un proceso interno estándar
     */
    public function documentos(int $id): JsonResponse
    {
        try {
            $procesoInterno = ProcesoInterno::whereNull('proceso_general_id')
                ->activos()
                ->findOrFail($id);
            
            $documentos = $procesoInterno->documentos()
                ->with(['tipoProceso', 'procesoGeneral', 'subidoPor'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => [
                    'proceso_interno' => [
                        'id' => $procesoInterno->id,
                        'nombre' => $procesoInterno->nombre,
                        'descripcion' => $procesoInterno->descripcion,
                        'icono' => $procesoInterno->icono
                    ],
                    'documentos' => $documentos->items(),
                    'pagination' => [
                        'current_page' => $documentos->currentPage(),
                        'last_page' => $documentos->lastPage(),
                        'per_page' => $documentos->perPage(),
                        'total' => $documentos->total(),
                    ]
                ],
                'message' => 'Documentos del proceso interno obtenidos exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los documentos del proceso interno',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Crear un nuevo proceso interno estándar
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'icono' => 'nullable|string|max:50'
            ], [
                'nombre.required' => 'El nombre es obligatorio'
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
                'proceso_general_id' => null, // NULL = proceso interno estándar
                'icono' => $request->icono ?? 'folder',
                'activo' => true
            ]);

            // Limpiar cache
            Cache::forget('procesos_internos_estandar');
            Cache::forget('procesos_internos');

            return response()->json([
                'success' => true,
                'data' => $proceso,
                'message' => 'Proceso interno estándar creado exitosamente'
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
