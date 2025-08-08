import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const HierarchicalFilters = ({ 
    onFilterChange, 
    filters = {},
    styles = {}
}) => {
    const { apiRequest } = useAuth();
    const [direcciones, setDirecciones] = useState([]);
    const [procesos, setProcesos] = useState([]);
    const [tiposArchivo, setTiposArchivo] = useState([]);
    const [loading, setLoading] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters);

    // Mantener localFilters sincronizado con props.filters para evitar estados "fantasma"
    useEffect(() => {
        // Evitar sets innecesarios comparando superficialmente
        const keys = ['direccionId', 'procesoId', 'tipoArchivo', 'sortBy'];
        const isDifferent = keys.some((k) => (filters?.[k] || '') !== (localFilters?.[k] || ''));
        if (isDifferent) {
            setLocalFilters(prev => ({ ...prev, ...filters }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    // Cargar direcciones al montar el componente
    useEffect(() => {
        loadDirecciones();
    }, []);

    // Cargar procesos cuando cambie la dirección seleccionada
    useEffect(() => {
        if (localFilters.direccionId) {
            loadProcesos(localFilters.direccionId);
        } else {
            setProcesos([]);
        }
    }, [localFilters.direccionId]);

    // Cargar tipos de archivo cuando cambie el proceso seleccionado
    useEffect(() => {
        if (localFilters.procesoId) {
            loadTiposArchivo(localFilters.direccionId, localFilters.procesoId);
        } else {
            setTiposArchivo([]);
        }
    }, [localFilters.procesoId, localFilters.direccionId]);

    const loadDirecciones = async () => {
        try {
            setLoading(true);
            const response = await apiRequest('/api/direcciones');
            if (response.success) {
                setDirecciones(response.data || []);
            }
        } catch (error) {
            console.error('Error al cargar direcciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadProcesos = async (direccionId) => {
        try {
            setLoading(true);
            const response = await apiRequest(`/api/direcciones/${direccionId}/procesos-apoyo`);
            if (response.success) {
                setProcesos(response.data || []);
            }
        } catch (error) {
            console.error('Error al cargar procesos:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadTiposArchivo = async (direccionId, procesoId) => {
        try {
            setLoading(true);
            const response = await apiRequest(`/api/procesos-apoyo/${procesoId}/documentos`);
            if (response.success) {
                // Extraer tipos únicos de archivo de los documentos
                const documentos = response.data || [];
                const tiposUnicos = [...new Set(documentos.map(doc => doc.tipo_archivo).filter(Boolean))];
                setTiposArchivo(tiposUnicos);
            }
        } catch (error) {
            console.error('Error al cargar tipos de archivo:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        let newFilters = { ...localFilters, [key]: value };

        // Resetear filtros dependientes cuando cambie un filtro padre
        if (key === 'direccionId') {
            newFilters.procesoId = '';
            newFilters.tipoArchivo = '';
        } else if (key === 'procesoId') {
            newFilters.tipoArchivo = '';
        }

        setLocalFilters(newFilters);
        onFilterChange && onFilterChange(newFilters);
    };

    return (
        <div className={styles.filtersContainer || ''}>
            {/* Filtro de Dirección */}
            <div className={styles.filterGroup || ''}>
                <label className={styles.filterLabel || ''}>Dirección</label>
                <select
                    value={localFilters.direccionId || ''}
                    onChange={(e) => handleFilterChange('direccionId', e.target.value ? Number(e.target.value) : '')}
                    className={styles.filterSelect || ''}
                    disabled={loading}
                >
                    <option value="">Seleccionar dirección</option>
                    {direcciones.map((direccion) => (
                        <option key={direccion.id} value={direccion.id}>
                            {direccion.nombre}
                        </option>
                    ))}
                </select>
            </div>

            {/* Filtro de Procesos de Apoyo */}
            <div className={styles.filterGroup || ''}>
                <label className={styles.filterLabel || ''}>Proceso de Apoyo</label>
                <select
                    value={localFilters.procesoId || ''}
                    onChange={(e) => handleFilterChange('procesoId', e.target.value ? Number(e.target.value) : '')}
                    className={styles.filterSelect || ''}
                    disabled={!localFilters.direccionId || loading}
                >
                    <option value="">Seleccionar proceso</option>
                    {procesos.map((proceso) => (
                        <option key={proceso.id} value={proceso.id}>
                            {proceso.nombre}
                        </option>
                    ))}
                </select>
            </div>

            {/* Filtro de Tipos de Archivo */}
            <div className={styles.filterGroup || ''}>
                <label className={styles.filterLabel || ''}>Tipo de Archivo</label>
                <select
                    value={localFilters.tipoArchivo || ''}
                    onChange={(e) => handleFilterChange('tipoArchivo', e.target.value)}
                    className={styles.filterSelect || ''}
                    disabled={!localFilters.procesoId || loading}
                >
                    <option value="">Todos los tipos</option>
                    {tiposArchivo.map((tipo) => (
                        <option key={tipo} value={tipo}>
                            {tipo.toUpperCase()}
                        </option>
                    ))}
                </select>
            </div>

            {/* Filtro de Ordenamiento */}
            <div className={styles.filterGroup || ''}>
                <label className={styles.filterLabel || ''}>Ordenar por</label>
                <select
                    value={localFilters.sortBy || 'created_at'}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className={styles.filterSelect || ''}
                >
                    <option value="created_at">Fecha de creación</option>
                    <option value="titulo">Título</option>
                    <option value="updated_at">Última modificación</option>
                </select>
            </div>

            {/* Indicador de carga */}
            {loading && (
                <div className={styles.loadingIndicator || ''}>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-600">Cargando...</span>
                </div>
            )}
        </div>
    );
};

export default HierarchicalFilters; 