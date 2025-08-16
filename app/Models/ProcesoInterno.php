<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;

class ProcesoInterno extends Model
{
    use HasFactory;

    protected $table = 'procesos_internos';

    protected $fillable = [
        'nombre',
        'descripcion',
        'icono',
        'proceso_general_id',
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

        // Limpiar cache cuando se crea, actualiza o elimina un proceso interno
        static::created(function ($procesoInterno) {
            Cache::forget('procesos_internos_activos');
        });

        static::updated(function ($procesoInterno) {
            Cache::forget('procesos_internos_activos');
        });

        static::deleted(function ($procesoInterno) {
            Cache::forget('procesos_internos_activos');
        });
    }

    /**
     * Relación con proceso general
     */
    public function procesoGeneral(): BelongsTo
    {
        return $this->belongsTo(ProcesoGeneral::class, 'proceso_general_id');
    }

    /**
     * Relación con categorías (carpetas)
     */
    public function categorias(): HasMany
    {
        return $this->hasMany(Categoria::class, 'proceso_interno_id')
                    ->where('activo', true)
                    ->orderBy('nombre');
    }

    /**
     * Relación con documentos (a través de categorías)
     */
    public function documentos(): \Illuminate\Database\Eloquent\Relations\HasManyThrough
    {
        return $this->hasManyThrough(Documento::class, Categoria::class, 'proceso_interno_id', 'categoria_id');
    }

    /**
     * Scope para procesos internos activos
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
     * Scope para filtrar por proceso general
     */
    public function scopePorProcesoGeneral(Builder $query, int $procesoGeneralId): Builder
    {
        return $query->where('proceso_general_id', $procesoGeneralId);
    }

    /**
     * Obtener estadísticas del proceso interno
     */
    public function getEstadisticasAttribute(): array
    {
        return Cache::remember("proceso_interno_stats_{$this->id}", 300, function () {
            return [
                'total_documentos' => $this->documentos()->count(),
            ];
        });
    }

    /**
     * Obtener todos los procesos internos activos con cache
     */
    public static function getActivos(): \Illuminate\Database\Eloquent\Collection
    {
        return Cache::remember('procesos_internos_activos', 300, function () {
            return static::activos()
                ->ordenados()
                ->with(['procesoGeneral.tipoProceso'])
                ->get();
        });
    }

    /**
     * Obtener procesos internos por proceso general
     */
    public static function getPorProcesoGeneral(int $procesoGeneralId): \Illuminate\Database\Eloquent\Collection
    {
        return static::activos()
            ->porProcesoGeneral($procesoGeneralId)
            ->ordenados()
            ->with(['procesoGeneral.tipoProceso'])
            ->get();
    }
}
