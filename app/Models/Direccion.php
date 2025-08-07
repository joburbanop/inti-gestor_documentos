<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;

class Direccion extends Model
{
    use HasFactory;

    protected $table = 'direcciones';

    protected $fillable = [
        'nombre',
        'descripcion',
        'codigo',
        'color',
        'orden',
        'activo',
        'procesos_apoyo'
    ];

    protected $casts = [
        'activo' => 'boolean',
        'orden' => 'integer',
        'procesos_apoyo' => 'array'
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

        // Limpiar cache cuando se crea, actualiza o elimina una dirección
        static::created(function ($direccion) {
            Cache::forget('direcciones_activas');
        });

        static::updated(function ($direccion) {
            Cache::forget('direcciones_activas');
        });

        static::deleted(function ($direccion) {
            Cache::forget('direcciones_activas');
        });
    }

    /**
     * Relación con procesos de apoyo (optimizada)
     */
    public function procesosApoyo(): HasMany
    {
        return $this->hasMany(ProcesoApoyo::class, 'direccion_id')
                    ->where('activo', true)
                    ->orderBy('orden');
    }

    /**
     * Obtener procesos de apoyo con cache
     */
    public function getProcesosApoyoOptimizadosAttribute()
    {
        return Cache::remember("direccion_procesos_{$this->id}", 300, function () {
            return $this->procesosApoyo()
                        ->withCount('documentos')
                        ->get()
                        ->map(function ($proceso) {
                            return [
                                'id' => $proceso->id,
                                'nombre' => $proceso->nombre,
                                'codigo' => $proceso->codigo,
                                'orden' => $proceso->orden,
                                'total_documentos' => $proceso->documentos_count
                            ];
                        });
        });
    }

    /**
     * Relación con documentos
     */
    public function documentos(): HasMany
    {
        return $this->hasMany(Documento::class, 'direccion_id');
    }

    /**
     * Scope para direcciones activas
     */
    public function scopeActivas(Builder $query): Builder
    {
        return $query->where('activo', true);
    }

    /**
     * Scope para ordenar por orden
     */
    public function scopeOrdenadas(Builder $query): Builder
    {
        return $query->orderBy('orden');
    }

    /**
     * Scope para buscar por nombre o código
     */
    public function scopeBuscar(Builder $query, string $termino): Builder
    {
        return $query->where(function ($q) use ($termino) {
            $q->where('nombre', 'like', "%{$termino}%")
              ->orWhere('codigo', 'like', "%{$termino}%");
        });
    }

    /**
     * Obtener estadísticas de la dirección
     */
    public function getEstadisticasAttribute(): array
    {
        return Cache::remember("direccion_estadisticas_{$this->id}", 300, function () {
            return [
                'total_procesos' => $this->procesosApoyo()->count(),
                'total_documentos' => $this->documentos()->count(),
                'total_descargas' => $this->documentos()->sum('contador_descargas')
            ];
        });
    }

    /**
     * Obtener documentos con paginación optimizada
     */
    public function documentosConPaginacion(int $perPage = 15)
    {
        return $this->documentos()
                    ->with(['procesoApoyo', 'subidoPor'])
                    ->orderBy('created_at', 'desc')
                    ->paginate($perPage);
    }

    /**
     * Buscar documentos en esta dirección
     */
    public function buscarDocumentos(string $termino)
    {
        return $this->documentos()
                    ->with(['procesoApoyo', 'subidoPor'])
                    ->where(function ($query) use ($termino) {
                        $query->where('titulo', 'like', "%{$termino}%")
                              ->orWhere('descripcion', 'like', "%{$termino}%");
                    })
                    ->orderBy('created_at', 'desc')
                    ->paginate(15);
    }

    /**
     * Obtener todas las direcciones activas con cache
     */
    public static function getActivasConCache()
    {
        return Cache::remember('direcciones_activas', 300, function () {
            return static::activas()
                ->ordenadas()
                ->with(['procesosApoyo' => function ($query) {
                    $query->activos()->ordenados();
                }])
                ->withCount(['documentos', 'procesosApoyo'])
                ->get();
        });
    }
} 