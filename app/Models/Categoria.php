<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;

class Categoria extends Model
{
    use HasFactory;

    protected $table = 'categorias';

    protected $fillable = [
        'nombre',
        'descripcion',
        'icono',
        'proceso_interno_id',
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

        // Limpiar cache cuando se crea, actualiza o elimina una categoría
        static::created(function ($categoria) {
            Cache::forget('categorias_activas');
        });

        static::updated(function ($categoria) {
            Cache::forget('categorias_activas');
        });

        static::deleted(function ($categoria) {
            Cache::forget('categorias_activas');
        });
    }

    /**
     * Relación con proceso interno
     */
    public function procesoInterno(): BelongsTo
    {
        return $this->belongsTo(ProcesoInterno::class, 'proceso_interno_id');
    }

    /**
     * Relación con documentos
     */
    public function documentos(): HasMany
    {
        return $this->hasMany(Documento::class, 'categoria_id');
    }

    /**
     * Scope para categorías activas
     */
    public function scopeActivas(Builder $query): Builder
    {
        return $query->where('activo', true);
    }

    /**
     * Scope para ordenar por nombre
     */
    public function scopeOrdenadas(Builder $query): Builder
    {
        return $query->orderBy('nombre');
    }

    /**
     * Scope para filtrar por proceso interno
     */
    public function scopePorProcesoInterno(Builder $query, int $procesoInternoId): Builder
    {
        return $query->where('proceso_interno_id', $procesoInternoId);
    }

    /**
     * Obtener estadísticas de la categoría
     */
    public function getEstadisticasAttribute(): array
    {
        return Cache::remember("categoria_stats_{$this->id}", 300, function () {
            return [
                'total_documentos' => $this->documentos()->count(),
            ];
        });
    }

    /**
     * Obtener todas las categorías activas con cache
     */
    public static function getActivas(): \Illuminate\Database\Eloquent\Collection
    {
        return Cache::remember('categorias_activas', 300, function () {
            return static::activas()
                ->ordenadas()
                ->with(['procesoInterno.procesoGeneral.tipoProceso'])
                ->get();
        });
    }

    /**
     * Obtener categorías por proceso interno
     */
    public static function getPorProcesoInterno(int $procesoInternoId): \Illuminate\Database\Eloquent\Collection
    {
        return static::activas()
            ->porProcesoInterno($procesoInternoId)
            ->ordenadas()
            ->with(['procesoInterno.procesoGeneral.tipoProceso'])
            ->get();
    }
}
