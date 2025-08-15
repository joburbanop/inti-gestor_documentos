<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
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
        'codigo',
        'color',
        'orden',
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean',
        'orden' => 'integer'
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
    public function documentos(): HasMany
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
     * Scope para ordenar por orden
     */
    public function scopeOrdenados(Builder $query): Builder
    {
        return $query->orderBy('orden')->orderBy('nombre');
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
                ->with(['procesosInternos' => function ($query) {
                    $query->activos()->orderBy('nombre');
                }])
                ->withCount(['procesosInternos' => function ($query) {
                    $query->where('activo', true);
                }])
                ->withCount(['documentos'])
                ->get();
        });
    }

    /**
     * Buscar por código
     */
    public static function findByCodigo(string $codigo): ?self
    {
        return static::where('codigo', $codigo)->where('activo', true)->first();
    }
}
