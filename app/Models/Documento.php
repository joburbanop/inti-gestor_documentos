<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class Documento extends Model
{
    use HasFactory;

    protected $table = 'documentos';

    protected $fillable = [
        'titulo',
        'descripcion',
        'nombre_archivo',
        'nombre_original',
        'ruta_archivo',
        'tipo_archivo',
        'tamaño_archivo',
        'direccion_id',
        'proceso_apoyo_id',
        'subido_por',
        'slug',
        'tipo',
        'etiquetas',
        'fecha_documento',
        'vigente_hasta',
        'confidencialidad'
    ];

    protected $casts = [
        'tamaño_archivo' => 'integer',
        'contador_descargas' => 'integer',
        'etiquetas' => 'array',
        'fecha_documento' => 'date',
        'vigente_hasta' => 'date'
    ];

    /**
     * Boot del modelo
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($documento) {
            if (empty($documento->slug)) {
                $documento->slug = Str::slug($documento->titulo);
            }
        });
    }

    /**
     * Relación con dirección
     */
    public function direccion(): BelongsTo
    {
        return $this->belongsTo(Direccion::class, 'direccion_id');
    }

    /**
     * Relación con proceso de apoyo
     */
    public function procesoApoyo(): BelongsTo
    {
        return $this->belongsTo(ProcesoApoyo::class, 'proceso_apoyo_id');
    }

    /**
     * Relación con usuario que subió el documento
     */
    public function subidoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'subido_por');
    }

    // responsable eliminado



    /**
     * Scope para filtrar por dirección
     */
    public function scopePorDireccion(Builder $query, int $direccionId): Builder
    {
        return $query->where('direccion_id', $direccionId);
    }

    /**
     * Scope para filtrar por proceso
     */
    public function scopePorProceso(Builder $query, int $procesoId): Builder
    {
        return $query->where('proceso_apoyo_id', $procesoId);
    }

    /**
     * Scope para buscar por término
     */
    public function scopeBuscar(Builder $query, string $termino): Builder
    {
        return $query->where(function ($q) use ($termino) {
            $q->where('titulo', 'like', "%{$termino}%")
              ->orWhere('descripcion', 'like', "%{$termino}%");
        });
    }

    /**
     * Incrementar contador de descargas
     */
    public function incrementarDescargas(): void
    {
        $this->increment('contador_descargas');
    }

    /**
     * Obtener URL de descarga
     */
    public function getUrlDescargaAttribute(): string
    {
        return route('documentos.descargar', $this->slug);
    }

    /**
     * Obtener URL de vista previa
     */
    public function getUrlVistaPreviaAttribute(): string
    {
        return route('documentos.vista-previa', $this->slug);
    }

    /**
     * Obtener tamaño formateado
     */
    public function getTamañoFormateadoAttribute(): string
    {
        $bytes = $this->tamaño_archivo;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Verificar si el documento es descargable por el usuario
     */
    public function esDescargablePor(User $user): bool
    {
        // Solo el que lo subió o un admin puede descargarlo
        return $user->id === $this->subido_por || $user->is_admin;
    }

    /**
     * Obtener documentos relacionados (misma dirección y proceso)
     */
    public function documentosRelacionados(int $limit = 5)
    {
        return static::where('id', '!=', $this->id)
                    ->where('direccion_id', $this->direccion_id)
                    ->where('proceso_apoyo_id', $this->proceso_apoyo_id)
                    ->with(['direccion', 'procesoApoyo'])
                    ->orderBy('created_at', 'desc')
                    ->limit($limit)
                    ->get();
    }
} 