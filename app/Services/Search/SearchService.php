<?php

namespace App\Services\Search;

use App\Models\Documento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SearchService
{
    /**
     * Buscar documentos con filtros avanzados
     */
    public function searchDocuments(Request $request)
    {
        $query = Documento::with(['tipoProceso', 'procesoGeneral', 'procesoInterno', 'user']);

        // Aplicar filtros básicos
        $this->applyBasicFilters($query, $request);

        // Aplicar búsqueda de texto
        $this->applyTextSearch($query, $request);

        // Aplicar filtros de fecha
        $this->applyDateFilters($query, $request);

        // Aplicar filtros de tamaño
        $this->applySizeFilters($query, $request);

        // Aplicar ordenamiento
        $this->applySorting($query, $request);

        return $query;
    }

    /**
     * Aplicar filtros básicos
     */
    private function applyBasicFilters($query, Request $request)
    {
        if ($request->filled('tipo_proceso_id')) {
            $query->where('tipo_proceso_id', $request->tipo_proceso_id);
        }

        if ($request->filled('proceso_general_id')) {
            $query->where('proceso_general_id', $request->proceso_general_id);
        }

        if ($request->filled('proceso_interno_id')) {
            $query->where('proceso_interno_id', $request->proceso_interno_id);
        }

        if ($request->filled('confidencialidad')) {
            $query->where('confidencialidad', $request->confidencialidad);
        }

        if ($request->filled('subido_por')) {
            $query->where('subido_por', $request->subido_por);
        }

        if ($request->filled('tipo_archivo')) {
            $query->where('tipo_archivo', 'like', '%' . $request->tipo_archivo . '%');
        }
    }

    /**
     * Aplicar búsqueda de texto
     */
    private function applyTextSearch($query, Request $request)
    {
        $searchTerm = trim($request->get('q', $request->get('termino', '')));
        
        if ($searchTerm !== '' && mb_strlen($searchTerm) >= 2) {
            $query->where(function($q) use ($searchTerm) {
                // Búsqueda en título
                $q->where('titulo', 'ilike', "%{$searchTerm}%")
                  // Búsqueda en descripción
                  ->orWhere('descripcion', 'ilike', "%{$searchTerm}%")
                  // Búsqueda en nombre original del archivo
                  ->orWhere('nombre_original', 'ilike', "%{$searchTerm}%")
                  // Búsqueda de texto completo (si está disponible)
                                    ->orWhereRaw("to_tsvector('spanish, titulo || '  || COALESCE(descripcion, ')) @@ plainto_tsquery(
                  'spanish, ?)", [$searchTerm]);
            });
        }
    }

    /**
     * Aplicar filtros de fecha
     */
    private function applyDateFilters($query, Request $request)
    {
        if ($request->filled('fechaDesde')) {
            $query->whereDate('created_at', '>=', $request->fechaDesde);
        }

        if ($request->filled('fechaHasta')) {
            $query->whereDate('created_at', '<=', $request->fechaHasta);
        }

        if ($request->filled('fecha_actualizacion_desde')) {
            $query->whereDate('updated_at', '>=', $request->fecha_actualizacion_desde);
        }

        if ($request->filled('fecha_actualizacion_hasta')) {
            $query->whereDate('updated_at', '<=', $request->fecha_actualizacion_hasta);
        }
    }

    /**
     * Aplicar filtros de tamaño
     */
    private function applySizeFilters($query, Request $request)
    {
        if ($request->filled('tamanoMin')) {
            $query->where('tamaño_archivo', '>=', (int) $request->tamanoMin);
        }

        if ($request->filled('tamanoMax')) {
            $query->where('tamaño_archivo', '<=', (int) $request->tamanoMax);
        }

        if ($request->filled('descargasMin')) {
            $query->where('contador_descargas', '>=', (int) $request->descargasMin);
        }

        if ($request->filled('descargasMax')) {
            $query->where('contador_descargas', '<=', (int) $request->descargasMax);
        }
    }

    /**
     * Aplicar ordenamiento
     */
    private function applySorting($query, Request $request)
    {
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        // Validar campos de ordenamiento permitidos
        $allowedSortFields = [
            'titulo', 'created_at', 'updated_at', 'tamaño_archivo', 
            'contador_descargas', 'nombre_original', 'confidencialidad'
        ];

        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }
    }

    /**
     * Buscar documentos recientes
     */
    public function getRecentDocuments($limit = 10)
    {
        return Documento::with(['tipoProceso', 'procesoGeneral', 'procesoInterno', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Obtener estadísticas de búsqueda
     */
    public function getSearchStats(Request $request)
    {
        $query = Documento::query();

        // Aplicar los mismos filtros que la búsqueda principal
        $this->applyBasicFilters($query, $request);
        $this->applyDateFilters($query, $request);
        $this->applySizeFilters($query, $request);

        return [
            'total' => $query->count(),
            'por_confidencialidad' => $query->selectRaw('confidencialidad, count(*) as total')
                ->groupBy('confidencialidad')
                ->get(),
            'por_tipo_proceso' => $query->join('tipos_procesos', 'documentos.tipo_proceso_id', '=', 'tipos_procesos.id')
                ->selectRaw('tipos_procesos.nombre, count(*) as total')
                ->groupBy('tipos_procesos.id', 'tipos_procesos.nombre')
                ->get(),
            'por_extension' => $query->selectRaw('SUBSTRING_INDEX(nombre_original, ".", -1) as extension, count(*) as total')
                ->groupBy('extension')
                ->orderBy('total', 'desc')
                ->limit(10)
                ->get()
        ];
    }

    /**
     * Buscar sugerencias de autocompletado
     */
    public function getSearchSuggestions($term, $limit = 10)
    {
        $term = trim($term);
        
        if (mb_strlen($term) < 2) {
            return collect([]);
        }

        return Documento::select('titulo')
            ->where('titulo', 'ilike', "%{$term}%")
            ->distinct()
            ->limit($limit)
            ->pluck('titulo');
    }
}
