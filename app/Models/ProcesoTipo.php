<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class ProcesoTipo extends Model
{
    use HasFactory;

    protected $table = 'proceso_tipos';

    protected $fillable = [
        'key',
        'title',
        'subtitle',
        'empty_text',
        'color',
        'icon',
        'activo',
        'orden'
    ];

    protected $casts = [
        'activo' => 'boolean',
        'orden' => 'integer'
    ];

    /**
     * Relación con procesos
     */
    public function procesos(): HasMany
    {
        return $this->hasMany(Proceso::class, 'tipo', 'key');
    }

    /**
     * Scope para tipos activos
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
        return $query->orderBy('orden')->orderBy('title');
    }

    /**
     * Obtener configuración por key
     */
    public static function getConfig(string $key): ?self
    {
        return static::activos()->where('key', $key)->first();
    }

    /**
     * Obtener todos los tipos activos
     */
    public static function getAllActive(): \Illuminate\Database\Eloquent\Collection
    {
        return static::activos()->ordenados()->get();
    }

    /**
     * Convertir a array de configuración para el frontend
     */
    public function toConfigArray(): array
    {
        return [
            'key' => $this->key,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'emptyText' => $this->empty_text,
            'color' => $this->color,
            'icon' => $this->icon
        ];
    }
}
