import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const HierarchicalFilters = ({ 
    onFilterChange, 
    filters = {},
    styles = {},
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

            {/* Indicador de carga */}
            {loading && (
                <div className={styles.loadingIndicator || ''}>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-600">Cargando documentos...</span>
                </div>
            )}
        </div>
    );
};

export default HierarchicalFilters; 