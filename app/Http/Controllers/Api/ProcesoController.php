<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proceso;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ProcesoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tipo = $request->get('tipo');
        $perPage = min((int) $request->get('per_page', 50), 100);

        $query = Proceso::activos()->ordenados();
        if ($tipo) {
            $query->where('tipo', $tipo);
        }

        $procesos = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $procesos->items(),
            'pagination' => [
                'current_page' => $procesos->currentPage(),
                'last_page' => $procesos->lastPage(),
                'per_page' => $procesos->perPage(),
                'total' => $procesos->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        if (!auth()->user()->is_admin) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255|unique:procesos,nombre',
            'tipo' => 'required|string|in:estrategico,misional,interno,apoyo',
            'descripcion' => 'nullable|string|max:1000',
            'codigo' => 'nullable|string|max:50|unique:procesos,codigo',
            'color' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Error de validación', 'errors' => $validator->errors()], 422);
        }

        $proceso = Proceso::create($request->only('nombre', 'tipo', 'descripcion', 'codigo', 'color') + ['activo' => true]);

        Cache::forget('procesos_stats');

        return response()->json(['success' => true, 'data' => $proceso, 'message' => 'Proceso creado'], 201);
    }

    public function show(int $id): JsonResponse
    {
        $proceso = Proceso::findOrFail($id);
        return response()->json(['success' => true, 'data' => $proceso]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        if (!auth()->user()->is_admin) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $proceso = Proceso::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nombre' => 'sometimes|required|string|max:255|unique:procesos,nombre,' . $proceso->id,
            'tipo' => 'sometimes|required|string|in:estrategico,misional,interno,apoyo',
            'descripcion' => 'nullable|string|max:1000',
            'codigo' => 'nullable|string|max:50|unique:procesos,codigo,' . $proceso->id,
            'color' => 'nullable|string|max:20',
            'activo' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Error de validación', 'errors' => $validator->errors()], 422);
        }

        $proceso->update($request->all());
        Cache::forget('procesos_stats');

        return response()->json(['success' => true, 'data' => $proceso, 'message' => 'Proceso actualizado']);
    }

    public function destroy(int $id): JsonResponse
    {
        if (!auth()->user()->is_admin) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $proceso = Proceso::findOrFail($id);
        // TODO: Validar relaciones antes de borrar
        $proceso->delete();
        Cache::forget('procesos_stats');

        return response()->json(['success' => true, 'message' => 'Proceso eliminado']);
    }

    /**
     * Estadísticas de tipos de proceso (rápido y cacheado)
     */
    public function tiposStats(): JsonResponse
    {
        $stats = Cache::remember('procesos_tipos_stats', 300, function () {
            return Proceso::select('tipo', DB::raw('COUNT(*) as total'))
                ->where('activo', true)
                ->groupBy('tipo')
                ->pluck('total', 'tipo');
        });

        return response()->json([
            'success' => true,
            'data' => $stats,
        ], 200);
    }
}
