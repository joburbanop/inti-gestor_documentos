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
     * Campos para el índice de búsqueda (Scout)
     * TEMPORALMENTE DESHABILITADO - Laravel Scout no está instalado
     */
    /*
    public function toSearchableArray(): array
    {
        $this->loadMissing(['direccion:id,nombre,codigo', 'procesoApoyo:id,nombre,codigo']);
        return [
            'id' => $this->id,
            'titulo' => (string) $this->titulo,
            'descripcion' => (string) $this->descripcion,
            'nombre_original' => (string) $this->nombre_original,
            'tipo' => (string) $this->tipo,
            'confidencialidad' => (string) $this->confidencialidad,
            'etiquetas' => array_values($this->etiquetas ?? []),
            'direccion' => [
                'id' => optional($this->direccion)->id,
                'nombre' => optional($this->direccion)->nombre,
                'codigo' => optional($this->direccion)->codigo,
            ],
            'proceso' => [
                'id' => optional($this->procesoApoyo)->id,
                'nombre' => optional($this->procesoApoyo)->nombre,
                'codigo' => optional($this->procesoApoyo)->codigo,
            ],
        ];
    }
    */

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
        // Separar en tokens para permitir búsqueda AND entre palabras
        $tokens = collect(preg_split('/\s+/', trim($termino)))->filter();

        // Estrategia OR entre tokens para ser más tolerante
        return $query->where(function (Builder $outerOr) use ($tokens) {
            foreach ($tokens as $token) {
                $outerOr->orWhere(function (Builder $q) use ($token) {
                    $like = "%{$token}%";
                    $q->where('titulo', 'like', $like)
                      ->orWhere('descripcion', 'like', $like)
                      ->orWhere('nombre_original', 'like', $like)
                      // Coincidencia exacta de etiqueta
                      ->orWhereJsonContains('etiquetas', (string) $token)
                      // Buscar por nombre de dirección
                      ->orWhereHas('direccion', function (Builder $dq) use ($like) {
                          $dq->where('nombre', 'like', $like)
                             ->orWhere('codigo', 'like', $like);
                      })
                      // Buscar por nombre/código del proceso de apoyo
                      ->orWhereHas('procesoApoyo', function (Builder $pq) use ($like) {
                          $pq->where('nombre', 'like', $like)
                             ->orWhere('codigo', 'like', $like);
                      })
                      // Tipo y confidencialidad como campos de texto
                      ->orWhere('tipo', 'like', $like)
                      ->orWhere('confidencialidad', 'like', $like);
                });
            }
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
        return route('documentos.descargar', ['id' => $this->id]);
    }

    /**
     * Obtener URL de vista previa
     */
    public function getUrlVistaPreviaAttribute(): string
    {
        return route('documentos.vista-previa', ['id' => $this->id]);
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
    public function esDescargablePor(?User $user): bool
    {
        if (!$user) {
            return false;
        }
        // Público / Interno: cualquier usuario autenticado puede ver/descargar
        return true;
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