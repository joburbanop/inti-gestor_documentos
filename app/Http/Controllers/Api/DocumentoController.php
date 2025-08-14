<?php



namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Documento;
use App\Models\Proceso;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class DocumentoController extends Controller
{
    /**
     * Obtener todos los documentos con paginación
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = min(max((int) $request->get('per_page', 10), 1), 100); // Optimizado para 10 por defecto
            $page = (int) $request->get('page', 1);
            $query = Documento::with(['proceso:id,nombre,codigo', 'subidoPor:id,name']); // Solo campos necesarios

            // Filtros con logging para debug
            if ($request->has('proceso_id')) {
                \Log::info('🔍 Aplicando filtro proceso_id:', ['proceso_id' => $request->proceso_id]);
                $query->porProceso($request->proceso_id);
            }

            // Filtro por extensión única
            if ($request->has('extension')) {
                \Log::info('🔍 Aplicando filtro extension:', ['extension' => $request->extension]);
                $query->porExtension($request->extension);
            }

            // Filtro por múltiples extensiones
            if ($request->has('extensiones') && is_array($request->extensiones)) {
                \Log::info('🔍 Aplicando filtro extensiones:', ['extensiones' => $request->extensiones]);
                $query->porExtensiones($request->extensiones);
            }

            // Filtro por tipo de documento
            if ($request->has('tipo_documento')) {
                \Log::info('🔍 Aplicando filtro tipo_documento:', ['tipo_documento' => $request->tipo_documento]);
                $query->porTipoDocumento($request->tipo_documento);
            }

            // Filtro por tipos de documento (array)
            if ($request->has('tipos_documento') && is_array($request->tipos_documento)) {
                \Log::info('🔍 Aplicando filtro tipos_documento:', ['tipos_documento' => $request->tipos_documento]);
                foreach ($request->tipos_documento as $tipo) {
                    $query->porTipoDocumento($tipo);
                }
            }



            // Búsqueda por término (Scout si está disponible, si no fallback a scopeBuscar)
            $q = trim((string) ($request->get('q', $request->get('termino', ''))));
            $useScout = $q !== '' && class_exists(\Laravel\Scout\Builder::class) && config('scout.driver') === 'meilisearch';
            $scoutIds = null;
            if ($useScout) {
                try {
                    // Búsqueda tolerante a errores con filtros aplicados
                    $filters = [];
                    if ($request->filled('tipo')) { $filters[] = 'tipo = "'.$request->tipo.'"'; }
                    if ($request->filled('confidencialidad')) { $filters[] = 'confidencialidad = "'.$request->confidencialidad.'"'; }
                    if ($request->has('etiquetas')) {
                        foreach ((array) $request->get('etiquetas') as $tg) {
                            $tg = trim((string) $tg);
                            if ($tg !== '') { $filters[] = 'etiquetas = "'.$tg.'"'; }
                        }
                    }
                    if ($request->filled('etiqueta')) { $filters[] = 'etiquetas = "'.$request->etiqueta.'"'; }
                     if ($request->filled('proceso_id')) { $filters[] = 'proceso.id = '.$request->proceso_id; }
                    if ($request->filled('tipo_archivo')) { $filters[] = 'tipo_archivo = "'.$request->tipo_archivo.'"'; }

                    $builder = \App\Models\Documento::search($q);
                    if (!empty($filters)) {
                        $builder->where(implode(' AND ', $filters));
                    }
                    // Nota: luego haremos el query Eloquent con IDs preservando orden aproximado
                    $hits = $builder->take(1000)->keys();
                    $scoutIds = $hits->all();
                    if (!empty($scoutIds)) {
                        $query->whereIn('id', $scoutIds);
                    } else {
                        // sin hits, devolver vacío con paginación
                        $documentos = collect([]);
                        $paginator = new \Illuminate\Pagination\LengthAwarePaginator([], 0, $perPage);
                        return response()->json([
                            'success' => true,
                            'data' => [
                                'documentos' => [],
                                'pagination' => [
                                    'current_page' => 1,
                                    'last_page' => 0,
                                    'per_page' => $perPage,
                                    'total' => 0,
                                ]
                            ],
                            'message' => 'Sin resultados'
                        ], 200);
                    }
                } catch (\Throwable $e) {
                    // Fallback seguro
                    $query->buscar($q);
                }
            } elseif ($q !== '' && mb_strlen($q) >= 2) {
                // Búsqueda optimizada usando índices de texto completo
                $query->whereRaw("to_tsvector('spanish', titulo || ' ' || COALESCE(descripcion, '')) @@ plainto_tsquery('spanish', ?)", [$q])
                      ->orWhere('titulo', 'ilike', "%{$q}%")
                      ->orWhere('descripcion', 'ilike', "%{$q}%")
                      ->orWhere('nombre_original', 'ilike', "%{$q}%");
            }

            // Filtros por metadatos
            if ($request->filled('tipo')) {
                $query->where('tipo', $request->tipo);
            }
            if ($request->filled('confidencialidad')) {
                $query->where('confidencialidad', $request->confidencialidad);
            }
            // Rango de fechas de creación
            if ($request->filled('fechaDesde')) {
                $query->whereDate('created_at', '>=', $request->get('fechaDesde'));
            }
            if ($request->filled('fechaHasta')) {
                $query->whereDate('created_at', '<=', $request->get('fechaHasta'));
            }
            // Umbrales de tamaño (bytes) y descargas
            if ($request->filled('tamanoMin')) {
                $query->where('tamaño_archivo', '>=', (int) $request->get('tamanoMin'));
            }
            if ($request->filled('tamanoMax')) {
                $query->where('tamaño_archivo', '<=', (int) $request->get('tamanoMax'));
            }
            if ($request->filled('descargasMin')) {
                $query->where('contador_descargas', '>=', (int) $request->get('descargasMin'));
            }
            // Filtrar por usuario que subió
            $subidoPor = $request->get('subido_por', $request->get('subidoPor'));
            if (!empty($subidoPor)) {
                $query->where('subido_por', (int) $subidoPor);
            }
            if ($request->filled('etiqueta')) {
                $query->whereJsonContains('etiquetas', $request->etiqueta);
            }
            // Búsqueda por múltiples etiquetas (todas deben estar presentes)
            if ($request->has('etiquetas')) {
                $tags = (array) $request->get('etiquetas');
                foreach ($tags as $tag) {
                    $tag = trim((string) $tag);
                    if ($tag !== '') {
                        $query->whereJsonContains('etiquetas', $tag);
                    }
                }
            }

            // Filtro por tipo de archivo (MIME) si se envía
            if ($request->filled('tipo_archivo')) {
                $query->where('tipo_archivo', 'like', $request->tipo_archivo.'%');
            }

            // Filtro por extensión (según nombre original)
            if ($request->filled('extension')) {
                $ext = ltrim(strtolower($request->extension), '.');
                $query->where('nombre_original', 'like', '%.'.$ext);
            }

            // Ordenamiento configurable
            $allowedSortBy = ['created_at', 'updated_at', 'titulo', 'contador_descargas', 'tamaño_archivo'];
            $sortBy = in_array($request->get('sort_by'), $allowedSortBy) ? $request->get('sort_by') : 'created_at';
            $sortOrder = strtolower($request->get('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';
            $query->orderBy($sortBy, $sortOrder);

            $documentos = $query->paginate($perPage, ['*'], 'page', $page)->appends($request->query());

            $data = $documentos->getCollection()->map(function ($documento) {
                return [
                    'id' => $documento->id,
                    'titulo' => $documento->titulo,
                    'descripcion' => $documento->descripcion,
                    'tipo_archivo' => $documento->tipo_archivo,
                    'extension' => $documento->extension,
                    'tamaño_formateado' => $documento->tamaño_formateado,
                    'contador_descargas' => $documento->contador_descargas,

                    'fecha_creacion' => $documento->created_at->format('Y-m-d H:i:s'),
                    'proceso' => [
                        'id' => optional($documento->proceso)->id,
                        'nombre' => optional($documento->proceso)->nombre,
                        'codigo' => optional($documento->proceso)->codigo,
                    ],
                    'subido_por' => [
                        'id' => $documento->subidoPor->id,
                        'name' => $documento->subidoPor->name,
                    ],
                    'tipo' => $documento->tipo,
                    'etiquetas' => $documento->etiquetas ?? [],
                    // fechas eliminadas de respuesta pública
                    'confidencialidad' => $documento->confidencialidad
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'documentos' => $data,
                    'pagination' => [
                        'current_page' => $documentos->currentPage(),
                        'last_page' => $documentos->lastPage(),
                        'per_page' => $documentos->perPage(),
                        'total' => $documentos->total(),
                    ]
                ],
                'message' => 'Documentos obtenidos exitosamente'
            ], 200);

        } catch (\Exception $e) {
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los documentos',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener un documento específico
     */
    public function show(int $id): JsonResponse
    {
        try {
            $documento = Documento::with(['proceso', 'subidoPor'])
                ->findOrFail($id);

            // Verificar permisos
            if (!$documento->esDescargablePor(auth()->user())) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para ver este documento'
                ], 403);
            }

            $data = [
                'id' => $documento->id,
                'titulo' => $documento->titulo,
                'descripcion' => $documento->descripcion,
                'nombre_original' => $documento->nombre_original,
                'tipo_archivo' => $documento->tipo_archivo,
                'tamaño_formateado' => $documento->tamaño_formateado,
                'contador_descargas' => $documento->contador_descargas,

                'fecha_creacion' => $documento->created_at->format('Y-m-d H:i:s'),
                'proceso' => [
                    'id' => optional($documento->proceso)->id,
                    'nombre' => optional($documento->proceso)->nombre,
                    'codigo' => optional($documento->proceso)->codigo,
                ],
                'subido_por' => [
                    'id' => $documento->subidoPor->id,
                    'name' => $documento->subidoPor->name,
                ],
                'tipo' => $documento->tipo,
                'etiquetas' => $documento->etiquetas ?? [],
                // fechas eliminadas de respuesta pública
                'confidencialidad' => $documento->confidencialidad,
                'documentos_relacionados' => $documento->documentosRelacionados()->map(function ($relacionado) {
                    return [
                        'id' => $relacionado->id,
                        'titulo' => $relacionado->titulo,
                        'tipo_archivo' => $relacionado->tipo_archivo,
                        'fecha_creacion' => $relacionado->created_at->format('Y-m-d H:i:s'),
                    ];
                })
            ];

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Documento obtenido exitosamente'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Documento no encontrado'
            ], 404);

        } catch (\Exception $e) {
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el documento',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Crear un nuevo documento
     */
    public function store(Request $request): JsonResponse
    {
        // Configurar límites de PHP dinámicamente para esta petición
        if (function_exists('ini_set')) {
            ini_set('upload_max_filesize', '50M');
            ini_set('post_max_size', '50M');
            ini_set('max_execution_time', '300');
            ini_set('max_input_time', '300');
            ini_set('memory_limit', '256M');
        }
        
        try {
            $validator = Validator::make($request->all(), [
                'titulo' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'archivo' => 'required|file|max:8192', // 8MB máximo (temporalmente reducido)
                'proceso_id' => 'required|exists:procesos,id',
                'tipo' => 'nullable|string|max:50',
                'etiquetas' => 'nullable|array',
                'etiquetas.*' => 'string|max:50',
                'confidencialidad' => 'nullable|string|in:Publico,Interno'

            ], [
                'titulo.required' => 'El título es obligatorio',
                'archivo.required' => 'El archivo es obligatorio',
                'archivo.max' => 'El archivo no puede ser mayor a 8MB (temporalmente)',
                'proceso_id.required' => 'El proceso es obligatorio'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $archivo = $request->file('archivo');
            $nombreArchivo = time() . '_' . Str::random(10) . '.' . $archivo->getClientOriginalExtension();
            $rutaArchivo = $archivo->storeAs('documentos', $nombreArchivo, 'public');

            $documento = Documento::create([
                'titulo' => $request->titulo,
                'descripcion' => $request->descripcion,
                'nombre_archivo' => $nombreArchivo,
                'nombre_original' => $archivo->getClientOriginalName(),
                'ruta_archivo' => $rutaArchivo,
                'tipo_archivo' => $archivo->getClientMimeType(),
                'tamaño_archivo' => $archivo->getSize(),
                'proceso_id' => $request->proceso_id,
                'subido_por' => auth()->id(),
                'tipo' => $request->tipo,
                'etiquetas' => $request->etiquetas,
                'confidencialidad' => $request->confidencialidad ?: 'Publico',

            ]);

            // Limpiar cache relacionado
            Cache::forget('dashboard_estadisticas');
            Cache::forget("direccion_estadisticas_{$request->direccion_id}");
            Cache::forget("direccion_{$request->direccion_id}");
            Cache::forget("proceso_apoyo_{$request->proceso_apoyo_id}");
            Cache::forget("procesos_apoyo_direccion_{$request->direccion_id}");
            Cache::increment('procesos_apoyo_cache_version');

            return response()->json([
                'success' => true,
                'data' => $documento,
                'message' => 'Documento subido exitosamente'
            ], 201);

        } catch (\Exception $e) {
            
            return response()->json([
                'success' => false,
                'message' => 'Error al subir el documento',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Actualizar un documento
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $documento = Documento::findOrFail($id);

            // Verificar permisos
            if (auth()->id() !== $documento->subido_por && !auth()->user()->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para actualizar este documento'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'titulo' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'proceso_id' => 'required|exists:procesos,id',
                'tipo' => 'nullable|string|max:50',
                'etiquetas' => 'nullable|array',
                'etiquetas.*' => 'string|max:50',
                'confidencialidad' => 'nullable|string|in:Publico,Interno',

            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Guardar IDs originales antes de actualizar
            $oldProcesoId = $documento->proceso_id;
            
            $documento->update($request->only([
                'titulo', 'descripcion', 'proceso_id', 'tipo', 'etiquetas', 'confidencialidad'
            ]));

            // Limpiar cache relacionado
            Cache::forget('dashboard_estadisticas');
            Cache::forget('procesos_tipos_stats');

            return response()->json([
                'success' => true,
                'data' => $documento,
                'message' => 'Documento actualizado exitosamente'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Documento no encontrado'
            ], 404);

        } catch (\Exception $e) {
            
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el documento',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Eliminar un documento
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $documento = Documento::findOrFail($id);

            // Verificar permisos
            if (auth()->id() !== $documento->subido_por && !auth()->user()->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para eliminar este documento'
                ], 403);
            }

            // Eliminar archivo físico
            if (Storage::disk('public')->exists($documento->ruta_archivo)) {
                Storage::disk('public')->delete($documento->ruta_archivo);
            }

            // Guardar IDs antes de eliminar para invalidar cache
            $procesoId = $documento->proceso_id;
            
            $documento->delete();

            // Limpiar cache relacionado
            Cache::forget('dashboard_estadisticas');
            Cache::forget('procesos_tipos_stats');

            return response()->json([
                'success' => true,
                'message' => 'Documento eliminado exitosamente'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Documento no encontrado'
            ], 404);

        } catch (\Exception $e) {
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el documento',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Descargar un documento
     */
    public function descargar(int $id): JsonResponse
    {
        try {
            $documento = Documento::findOrFail($id);

            // Verificar permisos
            if (!$documento->esDescargablePor(auth()->user())) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para descargar este documento'
                ], 403);
            }

            // Verificar que el archivo existe
            if (!Storage::disk('public')->exists($documento->ruta_archivo)) {
                return response()->json([
                    'success' => false,
                    'message' => 'El archivo no existe en el servidor'
                ], 404);
            }

            // Incrementar contador de descargas
            $documento->incrementarDescargas();

            // Generar URL de descarga
            $disk = Storage::disk('public');
            $url = null;
            try {
                // Algunos drivers (S3) soportan temporaryUrl
                if (method_exists($disk, 'temporaryUrl')) {
                    $url = $disk->temporaryUrl(
                        $documento->ruta_archivo,
                        now()->addMinutes(5),
                        [
                            'ResponseContentDisposition' => 'attachment; filename="' . $documento->nombre_original . '"'
                        ]
                    );
                }
            } catch (\Throwable $e) {
                // Ignorar y continuar con fallback
            }

            if (!$url) {
                // Fallback para disco local: devolver ruta relativa para evitar problemas con APP_URL
                $url = '/storage/' . ltrim($documento->ruta_archivo, '/');
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'url' => $url,
                    'nombre_original' => $documento->nombre_original
                ],
                'message' => 'URL de descarga generada exitosamente'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Documento no encontrado'
            ], 404);

        } catch (\Exception $e) {
            
            return response()->json([
                'success' => false,
                'message' => 'Error al generar la descarga',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Vista previa de un documento (sin contar como descarga)
     */
    public function vistaPrevia(int $id)
    {
        try {
            $documento = Documento::findOrFail($id);

            // Verificar permisos
            if (!$documento->esDescargablePor(auth()->user())) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para ver este documento'
                ], 403);
            }

            // Verificar que el archivo existe
            if (!Storage::disk('public')->exists($documento->ruta_archivo)) {
                return response()->json([
                    'success' => false,
                    'message' => 'El archivo no existe en el servidor'
                ], 404);
            }

            // Obtener el tipo MIME del archivo
            $disk = Storage::disk('public');
            $mimeType = $disk->mimeType($documento->ruta_archivo);
            $path = method_exists($disk, 'path') ? $disk->path($documento->ruta_archivo) : storage_path('app/public/'.ltrim($documento->ruta_archivo, '/'));

            // Para ciertos tipos de archivo, devolver el archivo directamente con headers de vista previa
            $viewableTypes = [
                'application/pdf',
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'text/plain',
                'text/html',
                'text/csv'
            ];

            if (in_array($mimeType, $viewableTypes)) {
                // Para archivos visualizables, devolver URL en lugar de archivo directo
                $url = '/storage/' . ltrim($documento->ruta_archivo, '/');
                
                return response()->json([
                    'success' => true,
                    'data' => [
                        'url' => $url,
                        'tipo_archivo' => $documento->tipo_archivo,
                        'nombre_original' => $documento->nombre_original,
                        'viewable' => true,
                        'mime_type' => $mimeType
                    ],
                    'message' => 'Vista previa disponible'
                ], 200);
            }

            // Para otros tipos, devolver URL con instrucciones de que se abra en nueva pestaña
            // Generar URL pública segura (temporal si está disponible)
            $url = null;
            try {
                if (method_exists($disk, 'temporaryUrl')) {
                    $url = $disk->temporaryUrl($documento->ruta_archivo, now()->addMinutes(5), [
                        'ResponseContentDisposition' => 'inline; filename="' . $documento->nombre_original . '"'
                    ]);
                }
            } catch (\Throwable $e) {}
            if (!$url) {
                $url = '/storage/' . ltrim($documento->ruta_archivo, '/');
            }
            
            return response()->json([
                'success' => true,
                'data' => [ 
                    'url' => $url,
                    'tipo_archivo' => $documento->tipo_archivo,
                    'nombre_original' => $documento->nombre_original,
                    'viewable' => false
                ],
                'message' => 'Este tipo de archivo se descargará. Para visualizar, usa una aplicación compatible.'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Documento no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar la vista previa',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Buscar documentos
     */
    public function buscar(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'termino' => 'required|string|min:2' // Reducido a 2 caracteres para búsqueda más flexible
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'El término de búsqueda debe tener al menos 2 caracteres'
                ], 422);
            }

            // Búsqueda optimizada usando índices de texto completo
            $termino = $request->get('termino');
            $query = Documento::where(function($q) use ($termino) {
                $q->whereRaw("to_tsvector('spanish', titulo || ' ' || COALESCE(descripcion, '')) @@ plainto_tsquery('spanish', ?)", [$termino])
                  ->orWhere('titulo', 'ilike', "%{$termino}%")
                  ->orWhere('descripcion', 'ilike', "%{$termino}%")
                  ->orWhere('nombre_original', 'ilike', "%{$termino}%")
                  ->orWhereJsonContains('etiquetas', $termino);
            })->with(['direccion:id,nombre,codigo', 'procesoApoyo:id,nombre,codigo', 'subidoPor:id,name']); // Solo campos necesarios

            // Aplicar filtros opcionales también en búsqueda
            if ($request->has('direccion_id')) {
                $query->porDireccion($request->direccion_id);
            }
            if ($request->has('proceso_apoyo_id')) {
                $query->porProceso($request->proceso_apoyo_id);
            }
            if ($request->filled('tipo')) {
                $query->where('tipo', $request->tipo);
            }
            if ($request->filled('confidencialidad')) {
                $query->where('confidencialidad', $request->confidencialidad);
            }
            if ($request->filled('etiqueta')) {
                $query->whereJsonContains('etiquetas', $request->etiqueta);
            }
            if ($request->filled('tipo_archivo')) {
                $query->where('tipo_archivo', 'like', $request->tipo_archivo.'%');
            }
            if ($request->filled('extension')) {
                $ext = ltrim(strtolower($request->extension), '.');
                $query->where('nombre_original', 'like', '%.'.$ext);
            }

            // Ordenamiento configurable
            $allowedSortBy = ['created_at', 'updated_at', 'titulo'];
            $sortBy = in_array($request->get('sort_by'), $allowedSortBy) ? $request->get('sort_by') : 'created_at';
            $sortOrder = strtolower($request->get('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';
            $query->orderBy($sortBy, $sortOrder);

            // Ordenamiento optimizado (más recientes primero)
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación optimizada para 10 documentos
            $perPage = min(max((int) $request->get('per_page', 10), 1), 50);
            $documentos = $query->paginate($perPage);

            $data = $documentos->getCollection()->map(function ($documento) {
                return [
                    'id' => $documento->id,
                    'titulo' => $documento->titulo,
                    'descripcion' => $documento->descripcion,
                    'tipo_archivo' => $documento->tipo_archivo,
                    'tamaño_formateado' => $documento->tamaño_formateado,
                    'contador_descargas' => $documento->contador_descargas,

                    'fecha_creacion' => $documento->created_at->format('Y-m-d H:i:s'),
                    'direccion' => [
                        'id' => $documento->direccion->id,
                        'nombre' => $documento->direccion->nombre,
                        'codigo' => $documento->direccion->codigo,
                    ],
                    'proceso_apoyo' => [
                        'id' => $documento->procesoApoyo->id,
                        'nombre' => $documento->procesoApoyo->nombre,
                        'codigo' => $documento->procesoApoyo->codigo,
                    ],
                    'subido_por' => [
                        'id' => $documento->subidoPor->id,
                        'name' => $documento->subidoPor->name,
                    ]
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'documentos' => $data,
                    'pagination' => [
                        'current_page' => $documentos->currentPage(),
                        'last_page' => $documentos->lastPage(),
                        'per_page' => $documentos->perPage(),
                        'total' => $documentos->total(),
                    ]
                ],
                'message' => 'Búsqueda completada exitosamente',
                'performance' => [
                    'query_time' => round((microtime(true) - LARAVEL_START) * 1000, 2) . 'ms',
                    'results_count' => count($data),
                    'total_found' => $documentos->total()
                ]
            ], 200);

        } catch (\Exception $e) {
            
            return response()->json([
                'success' => false,
                'message' => 'Error en la búsqueda',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener documentos recientes
     */
    public function recientes(): JsonResponse
    {
        try {
            $query = Documento::with(['direccion', 'procesoApoyo', 'subidoPor'])
                ->orderBy('created_at', 'desc')
                ->limit(10);

            $documentos = $query->get()->map(function ($documento) {
                return [
                    'id' => $documento->id,
                    'titulo' => $documento->titulo,
                    'tipo_archivo' => $documento->tipo_archivo,
                    'tamaño_formateado' => $documento->tamaño_formateado,
                    'fecha_creacion' => $documento->created_at->format('Y-m-d H:i:s'),
                    'direccion' => [
                        'nombre' => $documento->direccion->nombre,
                    ],
                    'proceso_apoyo' => [
                        'nombre' => $documento->procesoApoyo->nombre,
                    ]
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $documentos,
                'message' => 'Documentos recientes obtenidos exitosamente'
            ], 200);

        } catch (\Exception $e) {
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener documentos recientes',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener estadísticas optimizadas para el dashboard
     */
    public function estadisticas(): JsonResponse
    {
        try {
            // TEMPORALMENTE SIN CACHÉ para datos frescos
            // $estadisticas = Cache::remember('dashboard_estadisticas', 120, function () {
                // Consultas directas sin caché para datos actualizados
                $totalDocumentos = Documento::count();
                $totalDirecciones = Direccion::where('activo', true)->count();
                $totalProcesos = ProcesoApoyo::where('activo', true)->count();

                $estadisticas = [
                    'total_documentos' => $totalDocumentos,
                    'total_direcciones' => $totalDirecciones,
                    'total_procesos' => $totalProcesos
                ];
            // });

            return response()->json([
                'success' => true,
                'data' => $estadisticas,
                'message' => 'Estadísticas obtenidas exitosamente'
            ], 200);

        } catch (\Exception $e) {
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de extensiones
     */
    public function estadisticasExtensiones(): JsonResponse
    {
        try {
            // Obtener estadísticas frescas sin caché para datos actualizados
            $extensiones = Documento::getEstadisticasExtensiones();
            $extensionesPopulares = Documento::getExtensionesPopulares(10);
            $porTipoDocumento = Documento::getEstadisticasPorTipoDocumento();

            \Log::info('🔍 DocumentoController: Estadísticas de extensiones generadas', [
                'total_extensiones' => count($extensiones),
                'extensiones_populares' => count($extensionesPopulares),
                'tipos_documento' => array_keys($porTipoDocumento)
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'extensiones_detalladas' => $extensiones,
                    'extensiones_populares' => $extensionesPopulares,
                    'por_tipo_documento' => $porTipoDocumento,
                    'total_extensiones_unicas' => count($extensiones),
                    'timestamp' => now()->toISOString()
                ],
                'message' => 'Estadísticas de extensiones obtenidas exitosamente'
            ], 200);

        } catch (\Exception $e) {
            \Log::error('🔍 DocumentoController: Error al obtener estadísticas de extensiones', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas de extensiones',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener extensiones disponibles
     */
    public function extensionesDisponibles(): JsonResponse
    {
        try {
            $extensiones = Documento::selectRaw('DISTINCT extension')
                                   ->whereNotNull('extension')
                                   ->where('extension', '!=', '')
                                   ->orderBy('extension')
                                   ->pluck('extension')
                                   ->toArray();

            $tiposDocumento = [
                'pdf' => ['pdf'],
                'imagen' => ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'],
                'documento' => ['doc', 'docx', 'txt', 'rtf', 'odt'],
                'hoja_calculo' => ['xls', 'xlsx', 'csv', 'ods'],
                'presentacion' => ['ppt', 'pptx', 'odp'],
                'archivo_comprimido' => ['zip', 'rar', '7z', 'tar', 'gz'],
                'video' => ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'],
                'audio' => ['mp3', 'wav', 'aac', 'ogg', 'flac']
            ];

            \Log::info('🔍 DocumentoController: Extensiones disponibles obtenidas', [
                'total_extensiones' => count($extensiones),
                'extensiones' => $extensiones
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'extensiones' => $extensiones,
                    'tipos_documento' => $tiposDocumento,
                    'timestamp' => now()->toISOString()
                ],
                'message' => 'Extensiones disponibles obtenidas exitosamente'
            ], 200);

        } catch (\Exception $e) {
            \Log::error('🔍 DocumentoController: Error al obtener extensiones disponibles', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener extensiones disponibles',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener etiquetas disponibles
     */
    public function etiquetas(): JsonResponse
    {
        try {
            // Obtener todas las etiquetas únicas de los documentos
            $etiquetas = Documento::selectRaw('DISTINCT etiquetas')
                                 ->whereNotNull('etiquetas')
                                 ->where('etiquetas', '!=', '')
                                 ->get()
                                 ->pluck('etiquetas')
                                 ->flatMap(function($etiquetas) {
                                     // Las etiquetas están almacenadas como JSON, convertirlas a array
                                     $etiquetasArray = is_string($etiquetas) ? json_decode($etiquetas, true) : $etiquetas;
                                     return is_array($etiquetasArray) ? $etiquetasArray : [];
                                 })
                                 ->unique()
                                 ->filter()
                                 ->sort()
                                 ->values()
                                 ->toArray();

            \Log::info('🔍 DocumentoController: Etiquetas disponibles obtenidas', [
                'total_etiquetas' => count($etiquetas),
                'etiquetas' => $etiquetas
            ]);

            return response()->json([
                'success' => true,
                'data' => $etiquetas,
                'message' => 'Etiquetas disponibles obtenidas exitosamente'
            ], 200);

        } catch (\Exception $e) {
            \Log::error('🔍 DocumentoController: Error al obtener etiquetas disponibles', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener etiquetas disponibles',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener tipos de documento disponibles
     */
    public function tipos(): JsonResponse
    {
        try {
            // Obtener todos los tipos únicos de los documentos
            $tipos = Documento::selectRaw('DISTINCT tipo')
                             ->whereNotNull('tipo')
                             ->where('tipo', '!=', '')
                             ->orderBy('tipo')
                             ->pluck('tipo')
                             ->toArray();

            \Log::info('🔍 DocumentoController: Tipos de documento disponibles obtenidos', [
                'total_tipos' => count($tipos),
                'tipos' => $tipos
            ]);

            return response()->json([
                'success' => true,
                'data' => $tipos,
                'message' => 'Tipos de documento disponibles obtenidos exitosamente'
            ], 200);

        } catch (\Exception $e) {
            \Log::error('🔍 DocumentoController: Error al obtener tipos de documento disponibles', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener tipos de documento disponibles',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
} 