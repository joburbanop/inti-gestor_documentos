import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import userStyles from '../styles/components/UserDashboard.module.css';

// Componentes modulares
import HierarchicalFilters from './dashboard/HierarchicalFilters';
import ExtensionFilter from './dashboard/ExtensionFilter';

// Iconos SVG
import { PdfIcon, ExcelIcon, WordIcon, SearchIcon } from './icons/DashboardIcons';

const UserDashboard = () => {
    const { user, apiRequest } = useAuth();
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [allDocuments, setAllDocuments] = useState([]);
    const [selectedExtensions, setSelectedExtensions] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const typingTimerRef = useRef(null);
    const searchAbortRef = useRef(null);
    const [stats, setStats] = useState({
        total: 0,
        filtered: 0,
        byType: {},
        byDirection: {}
    });
    
    // Estado de paginación
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        total: 0
    });
    
    // Estado de carga de paginación
    const [paginationLoading, setPaginationLoading] = useState(false);

    // Cargar documentos iniciales al montar el componente
    useEffect(() => {
        performInitialSearch();
    }, []);

    const performInitialSearch = async () => {
        try {
            setSearchLoading(true);
            const response = await apiRequest('/api/documentos?per_page=10&page=1');
            if (response.success) {
                const docs = response.data?.documentos || response.data || [];
                console.log('📄 UserDashboard: Cargados', docs.length, 'documentos iniciales');
                setSearchResults(docs);
                
                // Actualizar información de paginación
                if (response.data?.pagination) {
                    setPagination({
                        currentPage: response.data.pagination.current_page,
                        lastPage: response.data.pagination.last_page,
                        perPage: response.data.pagination.per_page,
                        total: response.data.pagination.total
                    });
                }
                
                setStats(prev => ({ ...prev, filtered: docs.length }));
            }
        } catch (error) {
            console.error('Error al cargar documentos iniciales:', error);
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

    const performSearchWithFilters = async (customFilters = null, customPage = null) => {
        try {
            setSearchLoading(true);
            
            const filtersToUse = customFilters || filters;
            const pageToUse = customPage || pagination.currentPage;
            const params = new URLSearchParams();
            
            // Agregar término de búsqueda si existe
            if (searchTerm && searchTerm.trim().length >= 3) {
                params.append('termino', searchTerm.trim());
            }
            
            // Agregar filtros de dirección y proceso
            if (filtersToUse.direccionId) {
                params.append('direccion_id', filtersToUse.direccionId);
            }
            
            if (filtersToUse.procesoId) {
                params.append('proceso_apoyo_id', filtersToUse.procesoId);
            }
            
            // Agregar filtros avanzados
            if (filtersToUse.tipo) {
                params.append('tipo', filtersToUse.tipo);
            }
            
            if (filtersToUse.confidencialidad) {
                params.append('confidencialidad', filtersToUse.confidencialidad);
            }
            
            if (filtersToUse.etiqueta) {
                params.append('etiqueta', filtersToUse.etiqueta);
            }
            
            if (filtersToUse.fechaDesde) {
                params.append('fecha_desde', filtersToUse.fechaDesde);
            }
            
            if (filtersToUse.fechaHasta) {
                params.append('fecha_hasta', filtersToUse.fechaHasta);
            }
            
            if (filtersToUse.extensiones && filtersToUse.extensiones.length > 0) {
                filtersToUse.extensiones.forEach(ext => {
                    params.append('extensiones[]', ext);
                });
            }
            
            // Ordenamiento por defecto (más recientes primero)
            params.append('sort_by', 'created_at');
            params.append('sort_order', 'desc');
            
            // Agregar parámetros de paginación
            params.append('per_page', pagination.perPage.toString());
            params.append('page', pageToUse.toString());

            // Determinar la URL correcta
            let url = '/api/documentos';
            const hasText = Boolean(searchTerm && searchTerm.trim().length >= 3);
            
            if (hasText) {
                url = `/api/documentos/buscar?${params.toString()}`;
            } else {
                url = `/api/documentos?${params.toString()}`;
            }

            // Cancelar búsqueda anterior si existe
            if (searchAbortRef.current) {
                try { searchAbortRef.current.abort(); } catch (e) {}
            }
            const controller = new AbortController();
            searchAbortRef.current = controller;

            console.log('🔍 UserDashboard: Haciendo petición a:', url);
            console.log('🔍 UserDashboard: Página solicitada:', pageToUse);
            let response = await apiRequest(url, { signal: controller.signal });
            
            if (response.success) {
                let results = response.data?.documentos || response.data || [];
                console.log('🔍 UserDashboard: Resultados obtenidos:', results.length);
                
                // Actualizar resultados
                setSearchResults(results);
                
                // Actualizar información de paginación si está disponible
                if (response.data?.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        currentPage: response.data.pagination.current_page,
                        lastPage: response.data.pagination.last_page,
                        perPage: response.data.pagination.per_page,
                        total: response.data.pagination.total
                    }));
                }
                
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

    const performSearch = async () => {
        return performSearchWithFilters();
    };

    // Funciones de paginación
    const goToPage = async (page) => {
        console.log('🔍 UserDashboard: goToPage llamado con página:', page);
        console.log('🔍 UserDashboard: Estado actual pagination:', pagination);
        
        if (page >= 1 && page <= pagination.lastPage) {
            console.log('🔍 UserDashboard: Navegando a página', page);
            setPaginationLoading(true);
            
            try {
                // Actualizar el estado de paginación inmediatamente
                setPagination(prev => ({ ...prev, currentPage: page }));
                
                // Ejecutar búsqueda con la nueva página directamente
                await performSearchWithFilters(null, page);
            } finally {
                setPaginationLoading(false);
            }
        } else {
            console.log('🔍 UserDashboard: Navegación no válida - página:', page, 'lastPage:', pagination.lastPage, 'currentPage:', pagination.currentPage);
        }
    };

    const goToNextPage = async () => {
        console.log('🔍 UserDashboard: goToNextPage - currentPage:', pagination.currentPage, 'lastPage:', pagination.lastPage);
        const nextPage = pagination.currentPage + 1;
        if (nextPage <= pagination.lastPage) {
            console.log('🔍 UserDashboard: Navegando a página siguiente:', nextPage);
            await goToPage(nextPage);
        } else {
            console.log('🔍 UserDashboard: Ya estamos en la última página');
        }
    };

    const goToPrevPage = async () => {
        if (pagination.currentPage > 1) {
            await goToPage(pagination.currentPage - 1);
        }
    };

    const scheduleSearch = () => {
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
            performSearch();
        }, 200); // Reducido a 200ms para búsqueda más rápida
    };

    const handleFilterChange = async (newFilters) => {
        console.log('🔍 UserDashboard: handleFilterChange llamado con:', newFilters);
        
        // Resetear a página 1 cuando cambian los filtros
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        
        setFilters(newFilters);
        
        // Cancelar cualquier búsqueda en curso
        if (searchAbortRef.current) {
            try { searchAbortRef.current.abort(); } catch (e) {}
        }
        
        // Ejecutar búsqueda inmediata con los nuevos filtros
        setSearchLoading(true);
        setSearchResults([]);
        
        // Usar los nuevos filtros directamente
        await performSearchWithFilters(newFilters, 1);
    };

    const handleExtensionFilterChange = ({ extensiones, tipos }) => {
        console.log('🔍 UserDashboard: handleExtensionFilterChange llamado con:', { extensiones, tipos });
        setSelectedExtensions(extensiones);
        setSelectedTypes(tipos);
        
        // Resetear a página 1 cuando cambian los filtros
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        
        // Actualizar filtros locales
        const newFilters = { ...filters };
        
        if (extensiones.length > 0) {
            newFilters.extensiones = extensiones;
        } else {
            delete newFilters.extensiones;
        }
        
        if (tipos.length > 0) {
            newFilters.tipos_documento = tipos;
        } else {
            delete newFilters.tipos_documento;
        }
        
        setFilters(newFilters);
        
        // Cancelar cualquier búsqueda en curso
        if (searchAbortRef.current) {
            try { searchAbortRef.current.abort(); } catch (e) {}
        }
        
        // Ejecutar búsqueda inmediata con los nuevos filtros
        setSearchLoading(true);
        setSearchResults([]);
        
        // Usar los nuevos filtros directamente
        performSearchWithFilters(newFilters, 1);
    };

    const clearAllFilters = () => {
        setFilters({});
        setSearchTerm('');
        setSelectedExtensions([]);
        setSelectedTypes([]);
        setSearchResults([]);
        setPagination({
            currentPage: 1,
            lastPage: 1,
            perPage: 10,
            total: 0
        });
        setStats(prev => ({ ...prev, filtered: prev.total }));
        
        // Recargar documentos iniciales
        performInitialSearch();
    };

    // Debounce de búsqueda por texto
    useEffect(() => {
        if (searchTerm && searchTerm.trim().length >= 3) {
            // Resetear a página 1 cuando cambia el término de búsqueda
            setPagination(prev => ({ ...prev, currentPage: 1 }));
            scheduleSearch();
        } else if (!Object.values(filters).some(v => v && v !== '') && !selectedExtensions.length && !selectedTypes.length) {
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
        const type = fileType?.toLowerCase() || '';
        if (type.includes('pdf')) return <PdfIcon />;
        if (type.includes('excel') || type.includes('xls') || type.includes('csv')) return <ExcelIcon />;
        if (type.includes('word') || type.includes('doc') || type.includes('txt')) return <WordIcon />;
        return <SearchIcon />;
    };

    return (
        <div className={userStyles.userDashboardContainer}>
            {/* Header del usuario */}
            <div className={userStyles.userHeader}>
                <h1 className={userStyles.userTitle}>¡Bienvenido, {user?.name}!</h1>
                <p className={userStyles.userSubtitle}>
                    Explora y encuentra los documentos que necesitas de manera rápida y eficiente.
                </p>
            </div>

            {/* Estadísticas */}
            <div className={userStyles.statsContainer}>
                <div className={userStyles.statCard}>
                    <div className={userStyles.statIcon}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <div className={userStyles.statContent}>
                        <h3>{stats.filtered}</h3>
                        <p>Resultados Encontrados</p>
                    </div>
                </div>
            </div>

            {/* Sección de búsqueda */}
            <div className={userStyles.userSearchSection}>
                <div className={userStyles.searchHeader}>
                    <div className={userStyles.searchTitleContainer}>
                        <SearchIcon className={userStyles.searchHeaderIcon} />
                        <h2 className={userStyles.searchTitle}>Buscar Documentos</h2>
                    </div>
                    <p className={userStyles.searchSubtitle}>
                        Encuentra documentos específicos usando filtros avanzados
                    </p>
                </div>

                {/* Formulario de búsqueda */}
                <form onSubmit={handleSearch} className={userStyles.searchForm}>
                    <div className={userStyles.searchInputWrapper}>
                        <SearchIcon className={userStyles.searchInputIcon} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchTermChange}
                            placeholder="Buscar por título, descripción o contenido..."
                            className={userStyles.modernSearchInput}
                        />
                        <button
                            type="submit"
                            disabled={searchLoading}
                            className={userStyles.modernSearchButton}
                        >
                            <SearchIcon className={userStyles.searchButtonIcon} />
                            Buscar
                        </button>
                    </div>
                </form>

                {/* Filtros de extensiones */}
                <ExtensionFilter
                    onFilterChange={handleExtensionFilterChange}
                    selectedExtensions={selectedExtensions}
                    selectedTypes={selectedTypes}
                />

                {/* Filtros jerárquicos */}
                <HierarchicalFilters
                    onFilterChange={handleFilterChange}
                    onDocumentsLoad={(docs) => {
                        setSearchResults(docs);
                        setStats(prev => ({ ...prev, filtered: docs.length }));
                    }}
                />
            </div>

            {/* Resultados de documentos */}
            {searchResults.length > 0 && (
                <div className={userStyles.userDocumentResults}>
                    <div className={userStyles.userDocumentResultsHeader}>
                        <h3 className={userStyles.userDocumentResultsTitle}>
                            Documentos Encontrados ({searchResults.length})
                        </h3>
                        <button
                            onClick={clearAllFilters}
                            className={userStyles.clearResultsButton}
                        >
                            Limpiar búsqueda
                        </button>
                    </div>
                    
                    <div className={userStyles.userDocumentResultsList}>
                        {searchResults.map((doc) => (
                            <div key={doc.id} className={userStyles.userDocumentItem}>
                                <div className={`${userStyles.userDocumentIcon} ${
                                    doc.extension === 'pdf' ? userStyles.userDocumentIconPDF :
                                    doc.extension === 'xlsx' || doc.extension === 'xls' ? userStyles.userDocumentIconXLSX :
                                    doc.extension === 'doc' || doc.extension === 'docx' ? userStyles.userDocumentIconDOC :
                                    ''
                                }`}>
                                    {getDocumentIcon(doc.tipo_archivo)}
                                </div>
                                
                                <div className={userStyles.userDocumentInfo}>
                                    <h4 className={userStyles.userDocumentTitle}>{doc.titulo}</h4>
                                    <div className={userStyles.userDocumentMeta}>
                                        <span className={userStyles.userDocumentDirection}>
                                            {doc.direccion?.nombre}
                                        </span>
                                        <span className={userStyles.userDocumentSeparator}>•</span>
                                        <span className={userStyles.userDocumentProcess}>
                                            {doc.proceso_apoyo?.nombre}
                                        </span>
                                        <span className={userStyles.userDocumentSeparator}>•</span>
                                        <span className={userStyles.userDocumentType}>
                                            {doc.tipo_archivo}
                                        </span>
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
                                            onClick={() => handleViewDoc(doc)}
                                            className={`${userStyles.actionButton} ${userStyles.viewButton}`}
                                        >
                                            Ver
                                        </button>
                                        <button
                                            onClick={() => handleDownloadDoc(doc)}
                                            className={`${userStyles.actionButton} ${userStyles.downloadButton}`}
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
                    
                    {/* Paginación Mejorada */}
                    {pagination.lastPage > 1 && (
                        <div className={userStyles.paginationContainer}>
                            <div className={userStyles.paginationInfo}>
                                <span>📄 Página {pagination.currentPage} de {pagination.lastPage}</span>
                                <span>📊</span>
                                <span>Mostrando {searchResults.length} de {pagination.total} documentos</span>
                                {paginationLoading && (
                                    <span style={{ color: '#1F448B', fontWeight: '600' }}>
                                        🔄 Cargando...
                                    </span>
                                )}
                            </div>
                            
                            <div className={userStyles.paginationControls}>
                                <button
                                    onClick={goToPrevPage}
                                    disabled={pagination.currentPage === 1 || paginationLoading}
                                    className={`${userStyles.paginationButton} ${userStyles.paginationPrev}`}
                                    title="Página anterior"
                                >
                                    {paginationLoading ? (
                                        <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full"></div>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    )}
                                    <span>Anterior</span>
                                </button>
                                
                                <div className={userStyles.paginationNumbers}>
                                    {(() => {
                                        const pages = [];
                                        const currentPage = pagination.currentPage;
                                        const lastPage = pagination.lastPage;
                                        
                                        // Función para agregar página si no existe
                                        const addPageIfNotExists = (page) => {
                                            if (page >= 1 && page <= lastPage && !pages.some(p => p.number === page)) {
                                                pages.push({
                                                    number: page,
                                                    type: 'number',
                                                    isActive: page === currentPage
                                                });
                                            }
                                        };
                                        
                                        // Calcular rango de páginas visibles
                                        const start = Math.max(1, currentPage - 2);
                                        const end = Math.min(lastPage, currentPage + 2);
                                        
                                        // Primera página (solo si no está en el rango visible)
                                        if (currentPage > 3 && start > 1) {
                                            addPageIfNotExists(1);
                                        }
                                        
                                        // Elipsis después de la primera página
                                        if (currentPage > 4 && start > 2) {
                                            pages.push({ type: 'ellipsis', key: 'ellipsis-start' });
                                        }
                                        
                                        // Páginas alrededor de la actual
                                        for (let i = start; i <= end; i++) {
                                            addPageIfNotExists(i);
                                        }
                                        
                                        // Elipsis antes de la última página
                                        if (currentPage < lastPage - 3 && end < lastPage - 1) {
                                            pages.push({ type: 'ellipsis', key: 'ellipsis-end' });
                                        }
                                        
                                        // Última página (solo si no está en el rango visible)
                                        if (currentPage < lastPage - 2 && end < lastPage) {
                                            addPageIfNotExists(lastPage);
                                        }
                                        
                                        return pages.map((item, index) => {
                                            if (item.type === 'ellipsis') {
                                                return (
                                                    <span 
                                                        key={item.key || `ellipsis-${index}`} 
                                                        className={userStyles.paginationEllipsis}
                                                    >
                                                        ⋯
                                                    </span>
                                                );
                                            }
                                            
                                            return (
                                                <button
                                                    key={`page-${item.number}`}
                                                    onClick={() => goToPage(item.number)}
                                                    disabled={paginationLoading}
                                                    className={`${userStyles.paginationNumber} ${
                                                        item.isActive ? userStyles.paginationActive : ''
                                                    }`}
                                                    title={`Ir a la página ${item.number}`}
                                                >
                                                    {item.number}
                                                </button>
                                            );
                                        });
                                    })()}
                                </div>
                                
                                <button
                                    onClick={goToNextPage}
                                    disabled={pagination.currentPage === pagination.lastPage || paginationLoading}
                                    className={`${userStyles.paginationButton} ${userStyles.paginationNext}`}
                                    title="Página siguiente"
                                >
                                    <span>Siguiente</span>
                                    {paginationLoading ? (
                                        <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full"></div>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
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