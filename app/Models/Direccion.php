<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

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
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean',
        'orden' => 'integer'
    ];

    /**
     * Relación con procesos de apoyo
     */
    public function procesosApoyo(): HasMany
    {
        return $this->hasMany(ProcesoApoyo::class, 'direccion_id')
                    ->where('activo', true)
                    ->orderBy('orden');
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
     * Obtener estadísticas de la dirección
     */
    public function getEstadisticasAttribute(): array
    {
        return [
            'total_procesos' => $this->procesosApoyo()->count(),
            'total_documentos' => $this->documentos()->count(),
            'documentos_publicos' => $this->documentos()->where('publico', true)->count(),
            'total_descargas' => $this->documentos()->sum('contador_descargas')
        ];
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
} 