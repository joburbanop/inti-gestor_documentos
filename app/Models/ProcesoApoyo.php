<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class ProcesoApoyo extends Model
{
    use HasFactory;

    protected $table = 'procesos_apoyo';

    protected $fillable = [
        'nombre',
        'descripcion',
        'direccion_id',
        'codigo',
        'orden',
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean',
        'orden' => 'integer'
    ];

    /**
     * Relación con dirección
     */
    public function direccion(): BelongsTo
    {
        return $this->belongsTo(Direccion::class, 'direccion_id');
    }

    /**
     * Relación con documentos
     */
    public function documentos(): HasMany
    {
        return $this->hasMany(Documento::class, 'proceso_apoyo_id');
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
        return $query->orderBy('orden');
    }

    /**
     * Scope para filtrar por dirección
     */
    public function scopePorDireccion(Builder $query, int $direccionId): Builder
    {
        return $query->where('direccion_id', $direccionId);
    }

    /**
     * Obtener estadísticas del proceso
     */
    public function getEstadisticasAttribute(): array
    {
        return [
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
                    ->with(['direccion', 'subidoPor'])
                    ->orderBy('created_at', 'desc')
                    ->paginate($perPage);
    }
} 