-- Optimización de Base de Datos para Búsqueda Empresarial
-- Fecha: 2025-08-09
-- Objetivo: Hacer la búsqueda súper rápida y profesional

-- 1. Índices compuestos para búsqueda rápida por dirección y proceso
CREATE INDEX IF NOT EXISTS idx_documentos_direccion_proceso ON documentos(direccion_id, proceso_apoyo_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documentos_proceso_direccion ON documentos(proceso_apoyo_id, direccion_id, created_at DESC);

-- 2. Índice para búsqueda por texto (título y descripción)
CREATE INDEX IF NOT EXISTS idx_documentos_titulo_descripcion ON documentos USING gin(to_tsvector('spanish', titulo || ' ' || COALESCE(descripcion, '')));

-- 3. Índice para búsqueda por tipo de archivo
CREATE INDEX IF NOT EXISTS idx_documentos_tipo_archivo ON documentos(tipo_archivo);

-- 4. Índice para búsqueda por fecha
CREATE INDEX IF NOT EXISTS idx_documentos_created_at ON documentos(created_at DESC);

-- 5. Índice para búsqueda por etiquetas (JSON)
CREATE INDEX IF NOT EXISTS idx_documentos_etiquetas ON documentos USING gin(etiquetas);

-- 6. Índice para búsqueda por confidencialidad
CREATE INDEX IF NOT EXISTS idx_documentos_confidencialidad ON documentos(confidencialidad);

-- 7. Índice para búsqueda por usuario que subió
CREATE INDEX IF NOT EXISTS idx_documentos_subido_por ON documentos(subido_por, created_at DESC);

-- 8. Índice compuesto para búsqueda completa
CREATE INDEX IF NOT EXISTS idx_documentos_search_complete ON documentos(
    direccion_id, 
    proceso_apoyo_id, 
    tipo_archivo, 
    confidencialidad, 
    created_at DESC
);

-- 9. Optimizar tabla direcciones
CREATE INDEX IF NOT EXISTS idx_direcciones_activo ON direcciones(activo) WHERE activo = true;
CREATE INDEX IF NOT EXISTS idx_direcciones_nombre ON direcciones USING gin(to_tsvector('spanish', nombre));

-- 10. Optimizar tabla procesos_apoyo
CREATE INDEX IF NOT EXISTS idx_procesos_apoyo_direccion ON procesos_apoyo(direccion_id, activo) WHERE activo = true;
CREATE INDEX IF NOT EXISTS idx_procesos_apoyo_nombre ON procesos_apoyo USING gin(to_tsvector('spanish', nombre));

-- 11. Estadísticas actualizadas para el optimizador
ANALYZE documentos;
ANALYZE direcciones;
ANALYZE procesos_apoyo;

-- 12. Configuración de PostgreSQL para mejor rendimiento
-- (Esto se debe ejecutar como superusuario)
-- ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
-- ALTER SYSTEM SET max_parallel_workers_per_gather = 4;
-- ALTER SYSTEM SET work_mem = '256MB';
-- ALTER SYSTEM SET maintenance_work_mem = '512MB';
-- SELECT pg_reload_conf();
