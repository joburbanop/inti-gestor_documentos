import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import userStyles from '../styles/components/UserDashboard.module.css';

// Componentes modulares
import HierarchicalFilters from './dashboard/HierarchicalFilters';

// Iconos SVG
import { PdfIcon, ExcelIcon, WordIcon, SearchIcon } from './icons/DashboardIcons';

const UserDashboard = () => {
    const { user, apiRequest } = useAuth();
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [allDocuments, setAllDocuments] = useState([]);
    const typingTimerRef = useRef(null);
    const searchAbortRef = useRef(null);
    const [stats, setStats] = useState({
        total: 0,
        filtered: 0,
        byType: {},
        byDirection: {}
    });

    // Cargar todos los documentos al montar el componente
    useEffect(() => {
        loadAllDocuments();
    }, []);

    const loadAllDocuments = async () => {
        try {
            setSearchLoading(true);
            const response = await apiRequest('/api/documentos');
            if (response.success) {
                const docs = response.data?.documentos || response.data || [];
                setAllDocuments(docs);
                calculateStats(docs);
            }
        } catch (error) {
            console.error('Error al cargar documentos:', error);
        } finally {
            setSearchLoading(false);
        }
    };

    const calculateStats = (docs) => {
        const byType = {};
        const byDirection = {};
        
        docs.forEach(doc => {
            // Estadísticas por tipo
            const type = doc.tipo_archivo?.toLowerCase() || 'otro';
            byType[type] = (byType[type] || 0) + 1;
            
            // Estadísticas por dirección
            const direction = doc.direccion?.nombre || 'Sin dirección';
            byDirection[direction] = (byDirection[direction] || 0) + 1;
        });

        setStats({
            total: docs.length,
            filtered: docs.length,
            byType,
            byDirection
        });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        await performSearch();
    };

    // Función para manejar cambios en el término de búsqueda
    const handleSearchTermChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        // Limpiar timer anterior
        if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
        }
        
        // Configurar nuevo timer para búsqueda automática después de 500ms
        typingTimerRef.current = setTimeout(() => {
            if (value.length >= 3 || value.length === 0) {
                performSearch();
            }
        }, 500);
    };

    const performSearch = async () => {
        try {
            setSearchLoading(true);
            
            console.log('🔍 UserDashboard: performSearch iniciado con filtros:', filters);
            
            // Construir parámetros de búsqueda
            const params = new URLSearchParams();
            
            // Solo agregar término de búsqueda si tiene al menos 2 caracteres (optimizado)
            if (searchTerm && searchTerm.trim().length >= 2) {
                params.append('termino', searchTerm.trim());
            }
            
            // Filtros jerárquicos (normalizar a números)
            const dirId = Number(filters.direccionId);
            if (Number.isFinite(dirId) && dirId > 0) {
                params.append('direccion_id', String(dirId));
            }

            const procId = Number(filters.procesoId);
            if (Number.isFinite(procId) && procId > 0) {
                params.append('proceso_apoyo_id', String(procId));
            }
            
            if (filters.tipoArchivo) {
                params.append('tipo_archivo', filters.tipoArchivo);
            }

            // Filtros avanzados
            if (filters.tipo) {
                params.append('tipo', filters.tipo);
            }
            
            if (filters.confidencialidad) {
                params.append('confidencialidad', filters.confidencialidad);
            }
            
            if (filters.etiqueta) {
                params.append('etiqueta', filters.etiqueta);
            }
            
            if (filters.fechaDesde) {
                params.append('fecha_desde', filters.fechaDesde);
            }
            
            if (filters.fechaHasta) {
                params.append('fecha_hasta', filters.fechaHasta);
            }
            
            if (filters.extension) {
                params.append('extension', filters.extension);
            }
            
            // Ordenamiento por defecto (más recientes primero)
            params.append('sort_by', 'created_at');
            params.append('sort_order', 'desc');

            // Si no hay término de búsqueda y no hay filtros, usar el endpoint index
            let url = '/api/documentos';
            const hasText = Boolean(searchTerm && searchTerm.trim().length >= 3);
            const hasAnyParam = Boolean(params.toString());
            if (hasText) {
                url = `/api/documentos/buscar?${params.toString()}`;
            } else if (hasAnyParam) {
                url = `/api/documentos?${params.toString()}`;
            }

            // Cancelar búsqueda anterior si existe
            if (searchAbortRef.current) {
                try { searchAbortRef.current.abort(); } catch (e) {}
            }
            const controller = new AbortController();
            searchAbortRef.current = controller;

            console.log('🔍 UserDashboard: Haciendo petición a:', url);
            let response = await apiRequest(url, { signal: controller.signal });
            console.log('🔍 UserDashboard: Respuesta recibida:', response);
            
            if (response.success) {
                let results = response.data?.documentos || response.data || [];
                console.log('🔍 UserDashboard: Resultados obtenidos:', results.length);
                
                // Fallback: si buscamos por texto y no hay resultados, intentar solo con filtros (sin termino)
                if (hasText && results.length === 0 && hasAnyParam) {
                    const paramsOnlyFilters = new URLSearchParams(params);
                    paramsOnlyFilters.delete('termino');
                    const fallbackUrl = `/api/documentos?${paramsOnlyFilters.toString()}`;
                    try {
                        const fb = await apiRequest(fallbackUrl, { signal: controller.signal });
                        if (fb.success) {
                            results = fb.data?.documentos || fb.data || [];
                        }
                    } catch (_) {
                        // Ignorar errores de fallback
                    }
                }
                setSearchResults(results);
                setStats(prev => ({ ...prev, filtered: results.length }));
            }
        } catch (error) {
            console.error('Error en la búsqueda:', error);
            // Si hay error, mostrar documentos vacíos
            setSearchResults([]);
            setStats(prev => ({ ...prev, filtered: 0 }));
        } finally {
            setSearchLoading(false);
        }
    };

    const scheduleSearch = () => {
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
            performSearch();
        }, 200); // Reducido a 200ms para búsqueda más rápida
    };

    const handleFilterChange = async (newFilters) => {
        console.log('🔍 UserDashboard: handleFilterChange recibido:', newFilters);
        setFilters(newFilters);
        const hasAnyFilter = Object.values(newFilters).some(v => v && v !== '');
        console.log('🔍 UserDashboard: ¿Tiene filtros?', hasAnyFilter);
        
        // Cancelar cualquier búsqueda en curso al cambiar filtros jerárquicos
        if (searchAbortRef.current) {
            try { searchAbortRef.current.abort(); } catch (e) {}
        }
        if (hasAnyFilter || (searchTerm && searchTerm.trim().length >= 2)) {
            // Ejecutar búsqueda inmediata para evitar resultados obsoletos
            console.log('🔍 UserDashboard: Ejecutando búsqueda inmediata');
            setSearchLoading(true);
            setSearchResults([]);
            await performSearch();
        } else {
            console.log('🔍 UserDashboard: Sin filtros, limpiando resultados');
            setSearchResults([]);
            setStats(prev => ({ ...prev, filtered: prev.total }));
        }
    };

    const clearAllFilters = () => {
        setFilters({});
        setSearchTerm('');
        setSearchResults([]);
        setStats(prev => ({ ...prev, filtered: prev.total }));
    };

    // Debounce de búsqueda por texto
    useEffect(() => {
        if (searchTerm && searchTerm.trim().length >= 3) {
            scheduleSearch();
        } else if (!Object.values(filters).some(v => v && v !== '')) {
            setSearchResults([]);
            setStats(prev => ({ ...prev, filtered: prev.total }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    const handleDocumentClick = (document) => {
        // Para usuarios, solo pueden ver/descargar documentos
        if (document.url) {
            window.open(document.url, '_blank');
        }
    };

    const handleViewDoc = async (documento) => {
        try {
            const res = await apiRequest(`/api/documentos/${documento.id}/vista-previa`);
            if (res.success && res.data?.url) {
                window.open(res.data.url, '_blank');
            } else {
                alert(res.message || 'No se pudo abrir la vista previa');
            }
        } catch (e) {
            alert(e.message || 'Error al abrir vista previa');
        }
    };

    const handleDownloadDoc = async (documento) => {
        try {
            const res = await apiRequest(`/api/documentos/${documento.id}/descargar`, { method: 'POST' });
            if (res.success && res.data?.url) {
                const a = document.createElement('a');
                a.href = res.data.url;
                a.download = documento.nombre_original || documento.titulo || 'documento';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                alert(res.message || 'No se pudo generar la descarga');
            }
        } catch (e) {
            alert(e.message || 'Error al descargar documento');
        }
    };

    const getDocumentIcon = (fileType) => {
        switch (fileType?.toLowerCase()) {
            case 'pdf':
                return <PdfIcon className="w-6 h-6" />;
            case 'xlsx':
            case 'xls':
                return <ExcelIcon className="w-6 h-6" />;
            case 'doc':
            case 'docx':
                return <WordIcon className="w-6 h-6" />;
            default:
                return <WordIcon className="w-6 h-6" />;
        }
    };




    return (
        <div className={userStyles.userDashboardContainer}>
            {/* Header Simple */}
            <div className={userStyles.userHeader}>
                <h1 className={userStyles.userTitle}>Portal Documental</h1>
                <p className={userStyles.userSubtitle}>
                    Bienvenido, {user?.name}. Encuentra cualquier documento en máximo 3 clics con nuestros filtros avanzados.
                </p>
            </div>

            {/* Estadísticas rápidas */}
            <div className={userStyles.statsContainer}>
                <div className={userStyles.statCard}>
                    <div className={userStyles.statIcon}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className={userStyles.statContent}>
                        <h3>{stats.total}</h3>
                        <p>Documentos Totales</p>
                    </div>
                </div>
                <div className={userStyles.statCard}>
                    <div className={userStyles.statIcon}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <div className={userStyles.statContent}>
                        <h3>{stats.filtered}</h3>
                        <p>Resultados</p>
                    </div>
                </div>
                <div className={userStyles.statCard}>
                    <div className={userStyles.statIcon}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <div className={userStyles.statContent}>
                        <h3>{Object.keys(stats.byType).length}</h3>
                        <p>Tipos de Archivo</p>
                    </div>
                </div>
            </div>

            {/* Búsqueda de documentos - Sección principal mejorada */}
            <div className={userStyles.userSearchSection}>
                <div className={userStyles.searchHeader}>
                    <div className={userStyles.searchTitleContainer}>
                        <svg style={{ width: '32px', height: '32px', color: '#1F448B', marginRight: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                            <h2 className={userStyles.searchTitle}>Búsqueda Avanzada</h2>
                            <p className={userStyles.searchSubtitle}>Encuentra la información que necesitas usando filtros inteligentes</p>
                        </div>
                    </div>
                </div>

                {/* Barra de búsqueda mejorada */}
                <div className={userStyles.modernSearchContainer}>
                    <div className={userStyles.searchInputWrapper}>
                        <svg style={{ width: '20px', height: '20px', color: '#1F448B', marginRight: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="¿Qué documento buscas? Escribe al menos 3 caracteres..."
                            value={searchTerm}
                            onChange={handleSearchTermChange}
                            className={userStyles.modernSearchInput}
                        />
                        <button 
                            className={userStyles.modernSearchButton}
                            onClick={() => performSearch(searchTerm, filters)}
                        >
                            <svg style={{ width: "16px", height: "16px", marginRight: "6px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>Buscar
                        </button>
                    </div>
                </div>

                {/* Filtros rápidos tipo chips */}


                {/* Botón para mostrar/ocultar filtros avanzados */}


                                {/* Filtros Jerárquicos */}
                <HierarchicalFilters 
                    onFilterChange={handleFilterChange}
                    filters={filters}
                    styles={userStyles}
                    onDocumentsLoad={setSearchResults}
                />
            </div>

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
                <div className={userStyles.userDocumentResults}>
                    <div className={userStyles.userDocumentResultsHeader}>
                        <h2 className={userStyles.userDocumentResultsTitle}>
                            Documentos Encontrados ({searchResults.length})
                        </h2>
                        <button
                            onClick={clearAllFilters}
                            className={userStyles.clearResultsButton}
                        >
                            Limpiar búsqueda
                        </button>
                    </div>
                    <div className={userStyles.userDocumentResultsList}>
                        {searchResults.map((doc) => (
                            <div 
                                key={doc.id} 
                                className={userStyles.userDocumentItem}
                            >
                                <div className={`${userStyles.userDocumentIcon} ${userStyles[`userDocumentIcon${doc.tipo_archivo?.toUpperCase()}`] || userStyles.userDocumentIconDoc}`}>
                                    {getDocumentIcon(doc.tipo_archivo)}
                                </div>
                                <div className={userStyles.userDocumentInfo}>
                                    <div className={userStyles.userDocumentTitle}>{doc.titulo}</div>
                                    <div className={userStyles.userDocumentMeta}>
                                        <span className={userStyles.userDocumentDirection}>{doc.direccion?.nombre}</span>
                                        <span className={userStyles.userDocumentSeparator}>•</span>
                                        <span className={userStyles.userDocumentProcess}>{doc.proceso_apoyo?.nombre}</span>
                                        {doc.tipo && (
                                            <>
                                                <span className={userStyles.userDocumentSeparator}>•</span>
                                                <span className={userStyles.userDocumentType}>{doc.tipo}</span>
                                            </>
                                        )}
                                    </div>
                                    {doc.etiquetas && doc.etiquetas.length > 0 && (
                                        <div className={userStyles.userDocumentTags}>
                                            {doc.etiquetas.slice(0, 3).map((tag, index) => (
                                                <span key={index} className={userStyles.userDocumentTag}>
                                                    {tag}
                                                </span>
                                            ))}
                                            {doc.etiquetas.length > 3 && (
                                                <span className={userStyles.userDocumentTagMore}>
                                                    +{doc.etiquetas.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <div className={userStyles.userDocumentActions}>
                                        <button
                                            className={`${userStyles.actionButton} ${userStyles.viewButton}`}
                                            onClick={() => handleViewDoc(doc)}
                                        >
                                            Ver
                                        </button>
                                        <button
                                            className={`${userStyles.actionButton} ${userStyles.downloadButton}`}
                                            onClick={() => handleDownloadDoc(doc)}
                                        >
                                            Descargar
                                        </button>
                                    </div>
                                </div>
                                <div className={userStyles.userDocumentDate}>
                                    {doc.fecha_creacion ? new Date(doc.fecha_creacion).toLocaleDateString() : ''}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Estado cuando no hay resultados */}
            {!searchLoading && searchResults.length === 0 && (searchTerm || Object.keys(filters).some(key => filters[key])) && (
                <div className={userStyles.noResultsContainer}>
                    <div className={userStyles.noResultsIcon}>
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                        </svg>
                    </div>
                    <h3 className={userStyles.noResultsTitle}>No se encontraron documentos</h3>
                    <p className={userStyles.noResultsText}>
                        Intenta ajustar tus filtros de búsqueda o usar términos diferentes.
                    </p>
                    <button
                        onClick={clearAllFilters}
                        className={userStyles.noResultsButton}
                    >
                        Limpiar filtros
                    </button>
                </div>
            )}

            {/* Loading state */}
            {searchLoading && (
                <div className={userStyles.userLoadingContainer}>
                    <div className={userStyles.userLoadingSpinner}></div>
                    <p className="text-gray-600 text-lg font-medium mt-4">
                        Buscando documentos...
                    </p>
                </div>
            )}
        </div>
    );
};

export default UserDashboard; 