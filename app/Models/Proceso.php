<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Proceso extends Model
{
    use HasFactory;

    protected $table = 'procesos';

    protected $fillable = [
        'nombre',
        'descripcion',
        'tipo',
        'codigo',
        'color',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    public const TIPO_ESTRATEGICO = 'estrategico';
    public const TIPO_MISIONAL = 'misional';
    public const TIPO_INTERNO = 'interno';
    public const TIPO_APOYO = 'apoyo';

    public function direcciones(): BelongsToMany
    {
        return $this->belongsToMany(Direccion::class, 'direccion_proceso', 'proceso_id', 'direccion_id')
            ->withTimestamps();
    }

    public function documentos(): HasMany
    {
        return $this->hasMany(Documento::class, 'proceso_id');
    }

    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }

    public function scopeTipo(Builder $query, string $tipo): Builder
    {
        return $query->where('tipo', $tipo);
    }

    public function scopeOrdenados(Builder $query): Builder
    {
        return $query->orderBy('nombre');
    }
}
