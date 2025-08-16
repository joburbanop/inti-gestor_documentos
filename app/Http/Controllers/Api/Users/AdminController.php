<?php

namespace App\Http\Controllers\Api\Users;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\Direccion;
use App\Models\ProcesoApoyo;
use App\Models\Documento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminController extends Controller
{
    /**
     * Obtener estadísticas generales del sistema
     */
    public function stats()
    {
        try {
            $stats = [
                'users' => [
                    'total' => User::count(),
                    'active' => User::where('is_active', true)->count(),
                    'inactive' => User::where('is_active', false)->count(),
                    'recent_registrations' => User::where('created_at', '>=', Carbon::now()->subDays(30))->count()
                ],
                'roles' => [
                    'total' => Role::count(),
                    'with_users' => Role::has('users')->count(),
                    'without_users' => Role::doesntHave('users')->count()
                ],
                'direcciones' => [
                    'total' => Direccion::count(),
                    'active' => Direccion::where('activo', true)->count(),
                    'with_procesos' => Direccion::has('procesosApoyo')->count()
                ],
                'procesos' => [
                    'total' => ProcesoApoyo::count(),
                    'active' => ProcesoApoyo::where('activo', true)->count(),
                    'with_documents' => ProcesoApoyo::has('documentos')->count()
                ],
                'documentos' => [
                    'total' => Documento::count(),
                    'recent_uploads' => Documento::where('created_at', '>=', Carbon::now()->subDays(7))->count(),
                    'total_downloads' => Documento::sum('contador_descargas') ?? 0,
                    'by_type' => $this->getDocumentStatsByType()
                ],
                'system' => [
                    'disk_usage' => $this->getDiskUsage(),
                    'last_activity' => $this->getLastActivity()
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Estadísticas obtenidas exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener actividad reciente del sistema
     */
    public function recentActivity()
    {
        try {
            $activities = collect();

            // Actividad de usuarios (registros recientes)
            $recentUsers = User::with('role')
                ->select('id', 'name', 'email', 'role_id', 'created_at')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function($user) {
                    return [
                        'type' => 'user',
                        'action' => 'register',
                        'description' => "Nuevo usuario registrado: {$user->name} ({$user->email})",
                        'user' => $user->name,
                        'created_at' => $user->created_at,
                        'icon' => '👤'
                    ];
                });

            $activities = $activities->merge($recentUsers);

            // Actividad de documentos (subidas recientes)
            $recentDocuments = Documento::with(['direccion', 'procesoApoyo', 'subidoPor'])
                ->select('id', 'titulo', 'direccion_id', 'proceso_apoyo_id', 'subido_por', 'created_at')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function($documento) {
                    return [
                        'type' => 'document',
                        'action' => 'upload',
                        'description' => "Documento subido: {$documento->titulo}",
                        'user' => $documento->subidoPor->name ?? 'Sistema',
                        'created_at' => $documento->created_at,
                        'icon' => '📄',
                        'details' => [
                            'direccion' => $documento->direccion->nombre ?? 'Sin dirección',
                            'proceso' => $documento->procesoApoyo->nombre ?? 'Sin proceso'
                        ]
                    ];
                });

            $activities = $activities->merge($recentDocuments);

            // Actividad de direcciones (creaciones recientes)
            $recentDirecciones = Direccion::select('id', 'nombre', 'created_at')
                ->orderBy('created_at', 'desc')
                ->limit(3)
                ->get()
                ->map(function($direccion) {
                    return [
                        'type' => 'direccion',
                        'action' => 'create',
                        'description' => "Nueva dirección creada: {$direccion->nombre}",
                        'user' => 'Administrador',
                        'created_at' => $direccion->created_at,
                        'icon' => '🏢'
                    ];
                });

            $activities = $activities->merge($recentDirecciones);

            // Ordenar por fecha de creación (más reciente primero)
            $activities = $activities->sortByDesc('created_at')->take(10)->values();

            return response()->json([
                'success' => true,
                'data' => $activities,
                'message' => 'Actividad reciente obtenida exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener actividad reciente: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener reporte de uso del sistema
     */
    public function systemReport()
    {
        try {
            $report = [
                'period' => [
                    'start' => Carbon::now()->startOfMonth()->format('Y-m-d'),
                    'end' => Carbon::now()->format('Y-m-d')
                ],
                'users' => [
                    'new_this_month' => User::where('created_at', '>=', Carbon::now()->startOfMonth())->count(),
                    'active_this_month' => User::where('last_login_at', '>=', Carbon::now()->startOfMonth())->count(),
                    'login_frequency' => $this->getLoginFrequency()
                ],
                'documents' => [
                    'uploaded_this_month' => Documento::where('created_at', '>=', Carbon::now()->startOfMonth())->count(),
                    
                    'downloaded_this_month' => $this->getDownloadsThisMonth(),
                    'popular_documents' => $this->getPopularDocuments()
                ],
                'direcciones' => [
                    'most_active' => $this->getMostActiveDirecciones(),
                    'document_distribution' => $this->getDocumentDistribution()
                ],
                'performance' => [
                    'avg_response_time' => $this->getAverageResponseTime(),
                    'storage_usage' => $this->getStorageUsage()
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $report,
                'message' => 'Reporte del sistema obtenido exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener reporte: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de documentos por tipo
     */
    private function getDocumentStatsByType()
    {
        return Documento::select('tipo_archivo', DB::raw('COUNT(*) as count'))
            ->groupBy('tipo_archivo')
            ->orderBy('count', 'desc')
            ->get()
            ->mapWithKeys(function($item) {
                return [$item->tipo_archivo => $item->count];
            });
    }

    /**
     * Obtener uso de disco
     */
    private function getDiskUsage()
    {
        $storagePath = storage_path('app/public');
        $totalSpace = disk_total_space($storagePath);
        $freeSpace = disk_free_space($storagePath);
        $usedSpace = $totalSpace - $freeSpace;

        return [
            'total' => $this->formatBytes($totalSpace),
            'used' => $this->formatBytes($usedSpace),
            'free' => $this->formatBytes($freeSpace),
            'percentage' => $totalSpace > 0 ? round(($usedSpace / $totalSpace) * 100, 1) : 0
        ];
    }

    /**
     * Obtener última actividad del sistema
     */
    private function getLastActivity()
    {
        $lastUserActivity = User::whereNotNull('last_login_at')
            ->orderBy('last_login_at', 'desc')
            ->first();

        $lastDocumentActivity = Documento::orderBy('created_at', 'desc')
            ->first();

        return [
            'last_user_login' => $lastUserActivity ? $lastUserActivity->last_login_at : null,
            'last_document_upload' => $lastDocumentActivity ? $lastDocumentActivity->created_at : null
        ];
    }

    /**
     * Obtener frecuencia de login
     */
    private function getLoginFrequency()
    {
        $loginsThisMonth = User::where('last_login_at', '>=', Carbon::now()->startOfMonth())->count();
        $totalUsers = User::count();
        
        return $totalUsers > 0 ? round(($loginsThisMonth / $totalUsers) * 100, 1) : 0;
    }

    /**
     * Obtener descargas del mes
     */
    private function getDownloadsThisMonth()
    {
        // Como no tenemos tracking de fechas de descarga, usamos el contador total
        return Documento::sum('contador_descargas') ?? 0;
    }

    /**
     * Obtener documentos más populares
     */
    private function getPopularDocuments()
    {
        return Documento::with(['direccion', 'procesoApoyo'])
            ->select('id', 'titulo', 'contador_descargas', 'direccion_id', 'proceso_apoyo_id')
            ->orderBy('contador_descargas', 'desc')
            ->limit(5)
            ->get()
            ->map(function($doc) {
                return [
                    'titulo' => $doc->titulo,
                    'descargas' => $doc->contador_descargas,
                    'direccion' => $doc->direccion->nombre ?? 'Sin dirección',
                    'proceso' => $doc->procesoApoyo->nombre ?? 'Sin proceso'
                ];
            });
    }

    /**
     * Obtener direcciones más activas
     */
    private function getMostActiveDirecciones()
    {
        return Direccion::withCount('documentos')
            ->orderBy('documentos_count', 'desc')
            ->limit(5)
            ->get()
            ->map(function($direccion) {
                return [
                    'nombre' => $direccion->nombre,
                    'documentos' => $direccion->documentos_count,
                    'procesos' => $direccion->procesosApoyo()->count()
                ];
            });
    }

    /**
     * Obtener distribución de documentos
     */
    private function getDocumentDistribution()
    {
        return Direccion::withCount('documentos')
            ->get()
            ->map(function($direccion) {
                return [
                    'direccion' => $direccion->nombre,
                    'documentos' => $direccion->documentos_count,
                    'percentage' => Documento::count() > 0 ? 
                        round(($direccion->documentos_count / Documento::count()) * 100, 1) : 0
                ];
            });
    }

    /**
     * Obtener tiempo promedio de respuesta (simulado)
     */
    private function getAverageResponseTime()
    {
        // En un sistema real, esto vendría de logs o métricas
        return rand(100, 300); // ms
    }

    /**
     * Obtener uso de almacenamiento
     */
    private function getStorageUsage()
    {
        $documentsSize = Documento::sum('tamaño_archivo') ?? 0;
        
        return [
            'documents_size' => $this->formatBytes($documentsSize),
            'documents_count' => Documento::count(),
            'avg_document_size' => Documento::count() > 0 ? 
                $this->formatBytes($documentsSize / Documento::count()) : '0 B'
        ];
    }

    /**
     * Formatear bytes a formato legible
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
} 