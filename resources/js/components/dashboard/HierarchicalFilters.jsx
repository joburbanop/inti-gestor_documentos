import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/components/HierarchicalFilters.module.css';

const HierarchicalFilters = ({ 
    onFilterChange, 
    filters = {},
    onDocumentsLoad // Nueva prop para cargar documentos
}) => {
    const { apiRequest } = useAuth();
    const [direcciones, setDirecciones] = useState([]);
    const [procesos, setProcesos] = useState([]);
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

    // Cargar documentos cuando cambie la dirección o proceso seleccionado
    useEffect(() => {
        if (localFilters.direccionId) {
            loadDocumentsByDirection(localFilters.direccionId, localFilters.procesoId);
        }
    }, [localFilters.direccionId, localFilters.procesoId]);

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

    // Nueva función para cargar documentos por dirección y proceso con paginación
    const loadDocumentsByDirection = async (direccionId, procesoId = null) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                direccion_id: direccionId,
                per_page: '10' // Paginación de 10 documentos
            });
            
            // Si hay proceso seleccionado, agregarlo al filtro
            if (procesoId) {
                params.append('proceso_apoyo_id', procesoId);
            }
            
            console.log('🔍 Cargando documentos con parámetros:', params.toString());
            const response = await apiRequest(`/api/documentos?${params}`);
            
            if (response.success && onDocumentsLoad) {
                console.log('📄 Documentos cargados:', response.data?.documentos?.length || 0);
                onDocumentsLoad(response.data?.documentos || []);
            } else {
                console.error('❌ Error en respuesta:', response);
            }
        } catch (error) {
            console.error('Error al cargar documentos por dirección/proceso:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        console.log('🔍 HierarchicalFilters: Cambio de filtro:', { key, value, currentFilters: localFilters });
        
        let newFilters = { ...localFilters, [key]: value };

        // Resetear proceso cuando cambie la dirección
        if (key === 'direccionId') {
            newFilters.procesoId = '';
            console.log('🔄 Reseteando procesoId porque cambió dirección');
        }

        console.log('🔍 HierarchicalFilters: Nuevos filtros:', newFilters);
        setLocalFilters(newFilters);
        onFilterChange && onFilterChange(newFilters);
    };

    return (
        <div className={`${styles.filtersContainer} ${loading ? styles.loading : ''}`}>
            {/* Layout responsive para filtros */}
            <div className={styles.filtersRow}>
                {/* Filtro de Dirección */}
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel} htmlFor="direccion-select">
                        Dirección
                    </label>
                    <select
                        id="direccion-select"
                        value={localFilters.direccionId || ''}
                        onChange={(e) => handleFilterChange('direccionId', e.target.value ? Number(e.target.value) : '')}
                        className={styles.filterSelect}
                        disabled={loading}
                        aria-label="Seleccionar dirección"
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
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel} htmlFor="proceso-select">
                        Proceso de Apoyo
                    </label>
                    <select
                        id="proceso-select"
                        value={localFilters.procesoId || ''}
                        onChange={(e) => handleFilterChange('procesoId', e.target.value ? Number(e.target.value) : '')}
                        className={styles.filterSelect}
                        disabled={!localFilters.direccionId || loading}
                        aria-label="Seleccionar proceso de apoyo"
                    >
                        <option value="">Seleccionar proceso</option>
                        {procesos.map((proceso) => (
                            <option key={proceso.id} value={proceso.id}>
                                {proceso.nombre}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Indicador de carga mejorado */}
            {loading && (
                <div className={styles.loadingIndicator}>
                    <div className={styles.loadingSpinner}></div>
                    <span>Cargando documentos...</span>
                </div>
            )}

            {/* Mensaje de estado cuando no hay dirección seleccionada */}
            {!localFilters.direccionId && !loading && (
                <div className={`${styles.statusMessage} ${styles.info}`}>
                    Selecciona una dirección para ver los procesos de apoyo disponibles
                </div>
            )}

            {/* Mensaje cuando hay dirección pero no hay procesos */}
            {localFilters.direccionId && procesos.length === 0 && !loading && (
                <div className={`${styles.statusMessage} ${styles.warning}`}>
                    No hay procesos de apoyo disponibles para esta dirección
                </div>
            )}

            {/* Botón para limpiar filtros */}
            {(localFilters.direccionId || localFilters.procesoId) && (
                <div className={styles.resultsCounter}>
                    <span>
                        {localFilters.direccionId && (
                            <>
                                Dirección: <span className={styles.resultsCount}>
                                    {direcciones.find(d => d.id === localFilters.direccionId)?.nombre}
                                </span>
                            </>
                        )}
                        {localFilters.procesoId && (
                            <>
                                {' • '}Proceso: <span className={styles.resultsCount}>
                                    {procesos.find(p => p.id === localFilters.procesoId)?.nombre}
                                </span>
                            </>
                        )}
                    </span>
                    <button
                        className={styles.clearFiltersButton}
                        onClick={() => {
                            setLocalFilters({});
                            onFilterChange && onFilterChange({});
                        }}
                        type="button"
                        aria-label="Limpiar filtros"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                        Limpiar filtros
                    </button>
                </div>
            )}
        </div>
    );
};

export default HierarchicalFilters; 