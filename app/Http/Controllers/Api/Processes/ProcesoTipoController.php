<?php

namespace App\Http\Controllers\Api\Processes;

use App\Http\Controllers\Controller;
use App\Models\ProcesoTipo;
use App\Models\ProcesoGeneral;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class ProcesoTipoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $tipos = Cache::remember('tipos_procesos', 3600, function () {
                return ProcesoTipo::activos()->ordenados()->get();
            });

            return response()->json([
                'success' => true,
                'data' => $tipos
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener tipos de procesos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $tipo = ProcesoTipo::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $tipo
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener tipo de proceso: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get procesos generales for a specific tipo
     */
    public function procesosGenerales($tipoId)
    {
        try {
            $procesos = Cache::remember("tipos_procesos_{$tipoId}_procesos_generales", 3600, function () use ($tipoId) {
                return ProcesoGeneral::where('tipo_proceso_id', $tipoId)
                    ->activos()
                    ->ordenados()
                    ->with('tipoProceso')
                    ->get();
            });

            return response()->json([
                'success' => true,
                'data' => $procesos
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener procesos generales: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255|unique:tipos_procesos,nombre',
                'descripcion' => 'nullable|string|max:500',
                'icono' => 'nullable|string|max:50'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $tipo = ProcesoTipo::create($request->all());
            
            // Limpiar cache
            Cache::forget('tipos_procesos');
            Cache::forget('acciones_rapidas');
            Cache::forget('dashboard_data');

            return response()->json([
                'success' => true,
                'message' => 'Tipo de proceso creado exitosamente',
                'data' => $tipo
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear tipo de proceso: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $tipo = ProcesoTipo::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255|unique:tipos_procesos,nombre,' . $id,
                'descripcion' => 'nullable|string|max:500',
                'icono' => 'nullable|string|max:50'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $tipo->update($request->all());
            
            // Limpiar cache
            Cache::forget('tipos_procesos');
            Cache::forget("tipos_procesos_{$id}_procesos_generales");
            Cache::forget('acciones_rapidas');
            Cache::forget('dashboard_data');

            return response()->json([
                'success' => true,
                'message' => 'Tipo de proceso actualizado exitosamente',
                'data' => $tipo
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar tipo de proceso: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $tipo = ProcesoTipo::findOrFail($id);
            
            // Verificar si tiene procesos generales asociados
            $procesosCount = ProcesoGeneral::where('tipo_proceso_id', $id)->count();
            if ($procesosCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "No se puede eliminar el tipo de proceso porque tiene {$procesosCount} procesos generales asociados"
                ], 422);
            }

            $tipo->delete();
            
            // Limpiar cache
            Cache::forget('tipos_procesos');
            Cache::forget("tipos_procesos_{$id}_procesos_generales");
            Cache::forget('acciones_rapidas');
            Cache::forget('dashboard_data');

            return response()->json([
                'success' => true,
                'message' => 'Tipo de proceso eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar tipo de proceso: ' . $e->getMessage()
            ], 500);
        }
    }
}
