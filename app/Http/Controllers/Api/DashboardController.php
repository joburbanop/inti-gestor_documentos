<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProcesoTipo;
use App\Models\Documento;
use App\Models\ProcesoGeneral;
use App\Models\ProcesoInterno;
// Eliminado uso de Categoria
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    /**
     * Obtener datos optimizados para el dashboard
     */
    public function index(): JsonResponse
    {
        try {
            // Usar cache para datos del dashboard
            $dashboardData = Cache::remember('dashboard_data', 300, function () {
                return [
                    'acciones_rapidas' => $this->getAccionesRapidas(),
                    'estadisticas_generales' => $this->getEstadisticasGenerales(),
                    'documentos_recientes' => $this->getDocumentosRecientes(),
                    'procesos_populares' => $this->getProcesosPopulares()
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $dashboardData,
                'message' => 'Datos del dashboard obtenidos exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los datos del dashboard',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener acciones rápidas (Tipos de Procesos)
     */
    private function getAccionesRapidas(): array
    {
        return Cache::remember('acciones_rapidas', 300, function () {
            $tiposProcesos = ProcesoTipo::activos()
                ->ordenados()
                ->withCount(['procesosGenerales' => function ($query) {
                    $query->where('activo', true);
                }])
                ->get();

            return $tiposProcesos->map(function ($tipo) {
                return [
                    'id' => $tipo->id,
                    'titulo' => $tipo->titulo,
                    'descripcion' => $tipo->descripcion,
                    'icono' => $tipo->icono,
                    'key' => $tipo->nombre,
                    'total_procesos' => $tipo->procesos_generales_count,
                    'color' => $this->getColorForTipo($tipo->nombre),
                    'url' => "/procesos?tipo={$tipo->nombre}"
                ];
            })->toArray();
        });
    }

    /**
     * Obtener estadísticas generales
     */
    private function getEstadisticasGenerales(): array
    {
        return Cache::remember('estadisticas_generales', 300, function () {
            return [
                'total_documentos' => Documento::count(),
                'total_procesos_generales' => ProcesoGeneral::activos()->count(),
                'total_procesos_internos' => ProcesoInterno::activos()->count(),
                // 'total_categorias' eliminado: ya no se usa categorías
                'tipos_procesos' => ProcesoTipo::activos()->count()
            ];
        });
    }

    /**
     * Obtener documentos recientes
     */
    private function getDocumentosRecientes(): array
    {
        return Cache::remember('documentos_recientes', 120, function () {
            return Documento::with(['procesoInterno.procesoGeneral.tipoProceso', 'subidoPor'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($documento) {
                    return [
                        'id' => $documento->id,
                        'titulo' => $documento->titulo,
                        'nombre_archivo' => $documento->nombre_archivo,
                        'tipo_archivo' => $documento->tipo_archivo,
                        'extension' => $documento->extension,
                        'created_at' => $documento->created_at,
                        'subido_por' => $documento->subidoPor ? [
                            'id' => $documento->subidoPor->id,
                            'name' => $documento->subidoPor->name
                        ] : null,
                        'proceso_interno' => $documento->procesoInterno ? [
                            'id' => $documento->procesoInterno->id,
                            'nombre' => $documento->procesoInterno->nombre,
                            'proceso_general' => $documento->procesoInterno->procesoGeneral ? [
                                'id' => $documento->procesoInterno->procesoGeneral->id,
                                'nombre' => $documento->procesoInterno->procesoGeneral->nombre,
                                'tipo_proceso' => $documento->procesoInterno->procesoGeneral->tipoProceso ? [
                                    'id' => $documento->procesoInterno->procesoGeneral->tipoProceso->id,
                                    'nombre' => $documento->procesoInterno->procesoGeneral->tipoProceso->nombre,
                                    'titulo' => $documento->procesoInterno->procesoGeneral->tipoProceso->titulo,
                                ] : null
                            ] : null
                        ] : null
                    ];
                })
                ->toArray();
        });
    }

    /**
     * Obtener procesos más populares (con más documentos)
     */
    private function getProcesosPopulares(): array
    {
        return Cache::remember('procesos_populares', 300, function () {
            return ProcesoGeneral::activos()
                ->withCount(['documentos'])
                ->with(['tipoProceso'])
                ->orderBy('documentos_count', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($proceso) {
                    return [
                        'id' => $proceso->id,
                        'nombre' => $proceso->nombre,
                        'descripcion' => $proceso->descripcion,
                        'icono' => $proceso->icono,
                        'total_documentos' => $proceso->documentos_count,
                        'tipo_proceso' => [
                            'id' => $proceso->tipoProceso->id,
                            'nombre' => $proceso->tipoProceso->nombre,
                            'titulo' => $proceso->tipoProceso->titulo,
                            'color' => $this->getColorForTipo($proceso->tipoProceso->nombre)
                        ]
                    ];
                })
                ->toArray();
        });
    }

    /**
     * Obtener color para cada tipo de proceso
     */
    private function getColorForTipo(string $tipo): string
    {
        $colores = [
            'estrategico' => '#1E40AF', // Azul
            'misional' => '#059669',    // Verde
            'apoyo' => '#7C3AED',       // Púrpura
            'evaluacion' => '#DC2626'   // Rojo
        ];

        return $colores[$tipo] ?? '#6B7280';
    }

    /**
     * Obtener solo las acciones rápidas (para componentes específicos)
     */
    public function accionesRapidas(): JsonResponse
    {
        try {
            $accionesRapidas = $this->getAccionesRapidas();

            return response()->json([
                'success' => true,
                'data' => $accionesRapidas,
                'message' => 'Acciones rápidas obtenidas exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las acciones rápidas',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener estadísticas para widgets
     */
    public function estadisticas(): JsonResponse
    {
        try {
            $estadisticas = $this->getEstadisticasGenerales();

            return response()->json([
                'success' => true,
                'data' => $estadisticas,
                'message' => 'Estadísticas obtenidas exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las estadísticas',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener documentos recientes (para componentes específicos)
     */
    public function recentDocuments(): JsonResponse
    {
        try {
            $documentosRecientes = $this->getDocumentosRecientes();

            return response()->json([
                'success' => true,
                'data' => $documentosRecientes,
                'message' => 'Documentos recientes obtenidos exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los documentos recientes',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
