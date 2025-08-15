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

    // Escuchar eventos de creación/actualización de direcciones
    useEffect(() => {
        const handleDireccionCreated = (event) => {
            // Mostrar notificación temporal
            showUpdateNotification('Nueva dirección agregada a los filtros');
            loadDirecciones(); // Recargar direcciones
        };

        const handleDireccionUpdated = (event) => {
            // Mostrar notificación temporal
            showUpdateNotification('Filtros actualizados');
            loadDirecciones(); // Recargar direcciones
        };

        // Agregar event listeners
        window.addEventListener('direccionCreated', handleDireccionCreated);
        window.addEventListener('direccionUpdated', handleDireccionUpdated);

        // Cleanup: remover event listeners
        return () => {
            window.removeEventListener('direccionCreated', handleDireccionCreated);
            window.removeEventListener('direccionUpdated', handleDireccionUpdated);
        };
    }, []);

    // Función para mostrar notificación de actualización
    const showUpdateNotification = (message) => {
        // Crear elemento de notificación temporal
        const notification = document.createElement('div');
        notification.className = styles.updateNotification;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    };

    // Función para recargar direcciones (útil para actualizar después de cambios)
    const reloadDirecciones = () => {
        loadDirecciones();
    };

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
                // Filtrar solo direcciones que tienen documentos o procesos
                const direccionesConContenido = response.data.filter(direccion => 
                    direccion.estadisticas?.total_documentos > 0 || 
                    direccion.estadisticas?.total_procesos > 0
                );
                
                // Verificar si hay cambios en las direcciones
                const direccionesAnteriores = direcciones.map(d => d.id).sort();
                const direccionesNuevas = direccionesConContenido.map(d => d.id).sort();
                const hayCambios = JSON.stringify(direccionesAnteriores) !== JSON.stringify(direccionesNuevas);
                
                setDirecciones(direccionesConContenido || []);
                // Si hay cambios y hay una dirección seleccionada, verificar si sigue existiendo
                if (hayCambios && localFilters.direccionId) {
                    const direccionExiste = direccionesConContenido.some(d => d.id === localFilters.direccionId);
                    if (!direccionExiste) {
                        handleFilterChange('direccionId', '');
                    }
                }
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
            
            const response = await apiRequest(`/api/documentos?${params}`);
            
            if (response.success && onDocumentsLoad) {
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
        let newFilters = { ...localFilters, [key]: value };

        // Resetear proceso cuando cambie la dirección
        if (key === 'direccionId') {
            newFilters.procesoId = '';
            }

        setLocalFilters(newFilters);
        onFilterChange && onFilterChange(newFilters);
    };

    return (
        <div className={`${styles.filtersContainer} ${loading ? styles.loading : ''}`}>
            {/* Layout responsive para filtros */}
            <div className={styles.filtersRow}>
                {/* Filtro de Dirección */}
                <div className={styles.filterGroup}>
                    <div className={styles.filterHeader}>
                        <label className={styles.filterLabel} htmlFor="direccion-select">
                            Dirección
                        </label>
                        <button
                            type="button"
                            onClick={reloadDirecciones}
                            className={styles.reloadButton}
                            title="Actualizar direcciones"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className={styles.loadingSpinner}></div>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <select
                        id="direccion-select"
                        value={localFilters.direccionId || ''}
                        onChange={(e) => handleFilterChange('direccionId', e.target.value ? Number(e.target.value) : '')}
                        className={`${styles.filterSelect} ${loading ? styles.updating : ''}`}
                        disabled={loading}
                        aria-label="Seleccionar dirección"
                    >
                        <option value="">
                            {loading ? 'Actualizando...' : 'Seleccionar dirección'}
                        </option>
                        {direcciones.map((direccion) => (
                            <option key={direccion.id} value={direccion.id}>
                                {direccion.nombre} ({direccion.estadisticas?.total_documentos || 0} docs)
                            </option>
                        ))}
                    </select>
                </div>

                {/* Filtro de Proceso Misional */}
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel} htmlFor="proceso-select">
                        Proceso Misional
                    </label>
                    <select
                        id="proceso-select"
                        value={localFilters.procesoId || ''}
                        onChange={(e) => handleFilterChange('procesoId', e.target.value ? Number(e.target.value) : '')}
                        className={styles.filterSelect}
                        disabled={!localFilters.direccionId || loading}
                        aria-label="Seleccionar proceso misional"
                    >
                        <option value="">Seleccionar proceso misional</option>
                        {procesos.map((proceso) => (
                            <option key={proceso.id} value={proceso.id}>
                                {proceso.nombre} ({proceso.estadisticas?.total_documentos || 0} docs)
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
                    {direcciones.length > 0 
                        ? 'Selecciona una dirección para ver los procesos misionales disponibles'
                        : 'No hay direcciones con documentos disponibles'
                    }
                </div>
            )}

            {/* Mensaje cuando hay dirección pero no hay procesos */}
            {localFilters.direccionId && procesos.length === 0 && !loading && (
                <div className={`${styles.statusMessage} ${styles.warning}`}>
                    No hay procesos misionales disponibles para esta dirección
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
                                <span className={styles.resultsStats}>
                                    ({direcciones.find(d => d.id === localFilters.direccionId)?.estadisticas?.total_documentos || 0} documentos)
                                </span>
                            </>
                        )}
                        {localFilters.procesoId && (
                            <>
                                {' • '}Proceso Misional: <span className={styles.resultsCount}>
                                    {procesos.find(p => p.id === localFilters.procesoId)?.nombre}
                                </span>
                                <span className={styles.resultsStats}>
                                    ({procesos.find(p => p.id === localFilters.procesoId)?.estadisticas?.total_documentos || 0} documentos)
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