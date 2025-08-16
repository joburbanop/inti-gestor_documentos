<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;

class ProcesoTipo extends Model
{
    use HasFactory;

    protected $table = 'tipos_procesos';

    protected $fillable = [
        'nombre',
        'titulo',
        'descripcion',
        'icono',
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    /**
     * Boot del modelo para eventos
     */
    protected static function boot()
    {
        parent::boot();

        // Limpiar cache cuando se crea, actualiza o elimina un tipo de proceso
        static::created(function ($procesoTipo) {
            Cache::forget('tipos_procesos_activos');
        });

        static::updated(function ($procesoTipo) {
            Cache::forget('tipos_procesos_activos');
        });

        static::deleted(function ($procesoTipo) {
            Cache::forget('tipos_procesos_activos');
        });
    }

    /**
     * Relación con procesos generales
     */
    public function procesosGenerales(): HasMany
    {
        return $this->hasMany(ProcesoGeneral::class, 'tipo_proceso_id')
                    ->where('activo', true)
                    ->orderBy('nombre');
    }

    /**
     * Scope para tipos de procesos activos
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }

    /**
     * Scope para ordenar por nombre
     */
    public function scopeOrdenados(Builder $query): Builder
    {
        return $query->orderBy('nombre');
    }

    /**
     * Obtener estadísticas del tipo de proceso
     */
    public function getEstadisticasAttribute(): array
    {
        return Cache::remember("tipo_proceso_stats_{$this->id}", 300, function () {
            return [
                'total_procesos_generales' => $this->procesosGenerales()->count(),
                'total_procesos_internos' => $this->procesosGenerales()
                    ->withCount(['procesosInternos' => function ($query) {
                        $query->where('activo', true);
                    }])
                    ->get()
                    ->sum('procesos_internos_count'),
                'total_documentos' => $this->procesosGenerales()
                    ->withCount(['documentos'])
                    ->get()
                    ->sum('documentos_count')
            ];
        });
    }

    /**
     * Obtener todos los tipos de procesos activos con cache
     */
    public static function getActivos(): \Illuminate\Database\Eloquent\Collection
    {
        return Cache::remember('tipos_procesos_activos', 300, function () {
            return static::activos()
                ->ordenados()
                ->with(['procesosGenerales' => function ($query) {
                    $query->activos()->ordenados()->withCount(['procesosInternos' => function ($q) {
                        $q->where('activo', true);
                    }]);
                }])
                ->get();
        });
    }

    /**
     * Obtener configuración para el frontend
     */
    public function getConfigAttribute(): array
    {
        return [
            'key' => $this->nombre,
            'title' => $this->titulo,
            'subtitle' => $this->descripcion,
            'emptyText' => "No hay {$this->titulo} registrados aún.",
            'icon' => $this->icono
        ];
    }
}
