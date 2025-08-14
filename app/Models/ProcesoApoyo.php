<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class ProcesoApoyo extends Model
{
    use HasFactory;

    protected $table = 'procesos';

    protected $fillable = [
        'nombre',
        'descripcion',
        'tipo',
        'codigo',
        'color',
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean'
    ];

    /**
     * Boot del modelo para asegurar que siempre sea tipo 'apoyo'
     */
    protected static function boot()
    {
        parent::boot();

        static::addGlobalScope('tipo_apoyo', function (Builder $builder) {
            $builder->where('tipo', 'apoyo');
        });
    }

    /**
     * Relación con direcciones (many-to-many)
     */
    public function direcciones(): BelongsToMany
    {
        return $this->belongsToMany(Direccion::class, 'direccion_proceso', 'proceso_id', 'direccion_id')
            ->withTimestamps();
    }

    /**
     * Relación con dirección (para compatibilidad)
     */
    public function direccion(): BelongsTo
    {
        return $this->belongsToMany(Direccion::class, 'direccion_proceso', 'proceso_id', 'direccion_id')
            ->withTimestamps()
            ->first();
    }

    /**
     * Relación con documentos
     */
    public function documentos(): HasMany
    {
        return $this->hasMany(Documento::class, 'proceso_id');
    }

    /**
     * Scope para procesos activos
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
        // Ordenar por nombre para consistencia tras eliminar "orden"
        return $query->orderBy('nombre');
    }

    /**
     * Scope para filtrar por dirección
     */
    public function scopePorDireccion(Builder $query, int $direccionId): Builder
    {
        return $query->whereHas('direcciones', function ($q) use ($direccionId) {
            $q->where('direccion_id', $direccionId);
        });
    }

    /**
     * Obtener estadísticas del proceso
     */
    public function getEstadisticasAttribute(): array
    {
        return [
            'total_documentos' => $this->documentos()->count(),
            'total_descargas' => $this->documentos()->sum('contador_descargas')
        ];
    }

    /**
     * Obtener documentos con paginación optimizada
     */
    public function documentosConPaginacion(int $perPage = 15)
    {
        return $this->documentos()
                    ->with(['direccion', 'subidoPor'])
                    ->orderBy('created_at', 'desc')
                    ->paginate($perPage);
    }

    /**
     * Crear un proceso de apoyo
     */
    public static function create(array $attributes = [])
    {
        $attributes['tipo'] = 'apoyo';
        return parent::create($attributes);
    }
} 