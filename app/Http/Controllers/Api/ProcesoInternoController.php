<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProcesoInterno;
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
            $procesosInternos = Cache::remember('procesos_internos_activos', 3600, function () {
                return ProcesoInterno::where('activo', true)
                    ->orderBy('orden', 'asc')
                    ->orderBy('titulo', 'asc')
                    ->get();
            });

            return response()->json([
                'success' => true,
                'data' => $procesosInternos
            ]);
        } catch (\Exception $e) {
            \Log::error('Error al obtener procesos internos: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los procesos internos'
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            \Log::info('🔍 [ProcesoInternoController::store] Datos recibidos:', $request->all());

            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255|unique:procesos_internos,nombre',
                'titulo' => 'required|string|max:255',
                'descripcion' => 'required|string',
                'icono' => 'required|string|max:255',
                'activo' => 'boolean',
                'orden' => 'integer|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de validación incorrectos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();
            $data['orden'] = $data['orden'] ?? 0;

            \Log::info('📝 [ProcesoInternoController::store] Datos a crear:', $data);

            $procesoInterno = ProcesoInterno::create($data);

            // Limpiar cachés relacionados
            Cache::forget('procesos_internos_activos');
            Cache::forget('acciones_rapidas');
            Cache::forget('dashboard_data');

            \Log::info('✅ [ProcesoInternoController::store] Proceso interno creado:', $procesoInterno->toArray());

            return response()->json([
                'success' => true,
                'message' => 'Proceso interno creado exitosamente',
                'data' => $procesoInterno
            ], 201);

        } catch (\Exception $e) {
            \Log::error('❌ [ProcesoInternoController::store] Error:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al crear el proceso interno: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(ProcesoInterno $procesoInterno)
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $procesoInterno
            ]);
        } catch (\Exception $e) {
            \Log::error('Error al obtener proceso interno: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el proceso interno'
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProcesoInterno $procesoInterno)
    {
        try {
            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255|unique:procesos_internos,nombre,' . $procesoInterno->id,
                'titulo' => 'required|string|max:255',
                'descripcion' => 'required|string',
                'icono' => 'required|string|max:255',
                'activo' => 'boolean',
                'orden' => 'integer|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de validación incorrectos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();
            $procesoInterno->update($data);

            // Limpiar cachés relacionados
            Cache::forget('procesos_internos_activos');
            Cache::forget('acciones_rapidas');
            Cache::forget('dashboard_data');

            return response()->json([
                'success' => true,
                'message' => 'Proceso interno actualizado exitosamente',
                'data' => $procesoInterno
            ]);

        } catch (\Exception $e) {
            \Log::error('Error al actualizar proceso interno: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el proceso interno'
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProcesoInterno $procesoInterno)
    {
        try {
            // Verificar si tiene documentos asociados
            $documentosCount = $procesoInterno->documentos()->count();
            
            if ($documentosCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "No se puede eliminar el proceso interno porque tiene {$documentosCount} documento(s) asociado(s)"
                ], 422);
            }

            $procesoInterno->delete();

            // Limpiar cachés relacionados
            Cache::forget('procesos_internos_activos');
            Cache::forget('acciones_rapidas');
            Cache::forget('dashboard_data');

            return response()->json([
                'success' => true,
                'message' => 'Proceso interno eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error al eliminar proceso interno: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el proceso interno'
            ], 500);
        }
    }
}
