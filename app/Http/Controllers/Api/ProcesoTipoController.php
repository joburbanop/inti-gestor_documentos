<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProcesoTipo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProcesoTipoController extends Controller
{
    /**
     * Obtener todos los tipos de proceso
     */
    public function index(): JsonResponse
    {
        try {
            $tipos = ProcesoTipo::activos()
                ->ordenados()
                ->get();

            return response()->json([
                'success' => true,
                'data' => $tipos,
                'message' => 'Tipos de proceso obtenidos exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los tipos de proceso',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener un tipo de proceso específico
     */
    public function show(int $id): JsonResponse
    {
        try {
            $tipo = ProcesoTipo::find($id);

            if (!$tipo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tipo de proceso no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $tipo,
                'message' => 'Tipo de proceso obtenido exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el tipo de proceso',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Crear un nuevo tipo de proceso
     */
    public function store(Request $request): JsonResponse
    {
        \Log::info('🔍 ProcesoTipoController::store - Iniciando', [
            'request_data' => $request->all(),
            'headers' => $request->headers->all()
        ]);
        
        try {
                                $validator = Validator::make($request->all(), [
                        'nombre' => 'required|string|max:50|unique:tipos_procesos,nombre',
                        'titulo' => 'required|string|max:100',
                        'descripcion' => 'required|string|max:500',
                        'icono' => 'required|string|max:50',
                        'activo' => 'boolean'
                    ], [
                        'nombre.required' => 'El nombre es requerido',
                        'nombre.unique' => 'Ya existe un tipo de proceso con este nombre',
                        'titulo.required' => 'El título es requerido',
                        'descripcion.required' => 'La descripción es requerida',
                        'icono.required' => 'El icono es requerido'
                    ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            \Log::info('🔍 ProcesoTipoController::store - Creando tipo de proceso', [
                'data' => [
                    'nombre' => $request->nombre,
                    'titulo' => $request->titulo,
                    'descripcion' => $request->descripcion,
                    'icono' => $request->icono,
                    'activo' => $request->boolean('activo', true),
                    'orden' => ProcesoTipo::max('orden') + 1
                ]
            ]);
            
                                $tipo = ProcesoTipo::create([
                        'nombre' => $request->nombre,
                        'titulo' => $request->titulo,
                        'descripcion' => $request->descripcion,
                        'icono' => $request->icono,
                        'activo' => $request->boolean('activo', true),
                        'orden' => ProcesoTipo::max('orden') + 1
                    ]);

                    // Limpiar caché del dashboard
                    \Cache::forget('acciones_rapidas');
                    \Cache::forget('dashboard_data');

                    return response()->json([
                        'success' => true,
                        'data' => $tipo,
                        'message' => 'Tipo de proceso creado exitosamente'
                    ], 201);

        } catch (\Exception $e) {
            \Log::error('🔍 ProcesoTipoController::store - Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el tipo de proceso',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Actualizar un tipo de proceso
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $tipo = ProcesoTipo::find($id);

            if (!$tipo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tipo de proceso no encontrado'
                ], 404);
            }

                                $validator = Validator::make($request->all(), [
                        'nombre' => 'required|string|max:50|unique:tipos_procesos,nombre,' . $id,
                        'titulo' => 'required|string|max:100',
                        'descripcion' => 'required|string|max:500',
                        'icono' => 'required|string|max:50',
                        'activo' => 'boolean'
                    ], [
                        'nombre.required' => 'El nombre es requerido',
                        'nombre.unique' => 'Ya existe un tipo de proceso con este nombre',
                        'titulo.required' => 'El título es requerido',
                        'descripcion.required' => 'La descripción es requerida',
                        'icono.required' => 'El icono es requerido'
                    ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

                                $tipo->update([
                        'nombre' => $request->nombre,
                        'titulo' => $request->titulo,
                        'descripcion' => $request->descripcion,
                        'icono' => $request->icono,
                        'activo' => $request->boolean('activo', true)
                    ]);

                    // Limpiar caché del dashboard
                    \Cache::forget('acciones_rapidas');
                    \Cache::forget('dashboard_data');

                    return response()->json([
                        'success' => true,
                        'data' => $tipo,
                        'message' => 'Tipo de proceso actualizado exitosamente'
                    ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el tipo de proceso',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Eliminar un tipo de proceso
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $tipo = ProcesoTipo::find($id);

            if (!$tipo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tipo de proceso no encontrado'
                ], 404);
            }

            // Verificar si tiene procesos asociados
            if ($tipo->procesosGenerales()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el tipo de proceso porque tiene procesos asociados'
                ], 422);
            }

                                $tipo->delete();

                    // Limpiar caché del dashboard
                    \Cache::forget('acciones_rapidas');
                    \Cache::forget('dashboard_data');

                    return response()->json([
                        'success' => true,
                        'message' => 'Tipo de proceso eliminado exitosamente'
                    ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el tipo de proceso',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
