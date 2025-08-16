<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;

class ProcesoGeneral extends Model
{
    use HasFactory;

    protected $table = 'procesos_generales';

    protected $fillable = [
        'nombre',
        'descripcion',
        'icono',
        'tipo_proceso_id',
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

        // Limpiar cache cuando se crea, actualiza o elimina un proceso general
        static::created(function ($procesoGeneral) {
            Cache::forget('procesos_generales_activos');
        });

        static::updated(function ($procesoGeneral) {
            Cache::forget('procesos_generales_activos');
        });

        static::deleted(function ($procesoGeneral) {
            Cache::forget('procesos_generales_activos');
        });
    }

    /**
     * Relación con tipo de proceso
     */
    public function tipoProceso(): BelongsTo
    {
        return $this->belongsTo(ProcesoTipo::class, 'tipo_proceso_id');
    }

    /**
     * Relación con procesos internos
     */
    public function procesosInternos(): HasMany
    {
        return $this->hasMany(ProcesoInterno::class, 'proceso_general_id')
                    ->where('activo', true)
                    ->orderBy('nombre');
    }

    /**
     * Relación con documentos (a través de procesos internos)
     */
    public function documentos(): \Illuminate\Database\Eloquent\Relations\HasManyThrough
    {
        return $this->hasManyThrough(Documento::class, ProcesoInterno::class, 'proceso_general_id', 'proceso_interno_id');
    }

    /**
     * Scope para procesos generales activos
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
     * Scope para filtrar por tipo de proceso
     */
    public function scopePorTipo(Builder $query, string $tipo): Builder
    {
        return $query->whereHas('tipoProceso', function ($q) use ($tipo) {
            $q->where('nombre', $tipo);
        });
    }

    /**
     * Obtener estadísticas del proceso general
     */
    public function getEstadisticasAttribute(): array
    {
        return Cache::remember("proceso_general_stats_{$this->id}", 300, function () {
            return [
                'total_procesos_internos' => $this->procesosInternos()->count(),
                'total_documentos' => $this->documentos()->count(),
            ];
        });
    }

    /**
     * Obtener todos los procesos generales activos con cache
     */
    public static function getActivos(): \Illuminate\Database\Eloquent\Collection
    {
        return Cache::remember('procesos_generales_activos', 300, function () {
            return static::activos()
                ->ordenados()
                ->with(['tipoProceso', 'procesosInternos' => function ($query) {
                    $query->activos()->ordenados();
                }])
                ->get();
        });
    }

    /**
     * Obtener procesos generales por tipo
     */
    public static function getPorTipo(string $tipo): \Illuminate\Database\Eloquent\Collection
    {
        return static::activos()
            ->porTipo($tipo)
            ->ordenados()
            ->with(['tipoProceso', 'procesosInternos' => function ($query) {
                $query->activos()->ordenados();
            }])
            ->get();
    }
}
