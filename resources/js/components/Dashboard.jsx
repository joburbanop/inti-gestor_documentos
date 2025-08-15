import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserRole, useHasPermission } from '../hooks/useAuthorization';
import { PERMISSIONS, ROLES } from '../roles/permissions';

// Componentes modulares del dashboard
import DashboardHeader from './dashboard/DashboardHeader';
import StatsSection from './dashboard/StatsSection';
import QuickActionsSection from './dashboard/QuickActionsSection';
import DocumentSearchSection from './dashboard/DocumentSearchSection';
import NewsSlider from './common/NewsSlider';
import InfoCards from './common/InfoCards';
import HierarchicalFilters from './dashboard/HierarchicalFilters';
import ExtensionFilter from './dashboard/ExtensionFilter';

// Iconos
import { DocumentIcon, BuildingIcon, ProcessIcon, AdminIcon } from './icons/DashboardIcons';
import { PdfIcon, ExcelIcon, WordIcon, SearchIcon } from './icons/DashboardIcons';
import { MissionIcon, VisionIcon } from './icons/BrandIcons';

// Estilos
import styles from '../styles/components/Dashboard.module.css';

const Dashboard = () => {
    console.log('📊 [Dashboard.jsx] Renderizando Dashboard Unificado');
    
    const { user, apiRequest } = useAuth();
    const navigate = useNavigate();
    const userRole = useUserRole();
    
    // Permisos del usuario
    const canManageUsers = useHasPermission(PERMISSIONS.MANAGE_USERS);
    const canManageDocs = useHasPermission(PERMISSIONS.MANAGE_DOCUMENTS);
    const canViewDocs = useHasPermission(PERMISSIONS.VIEW_DOCUMENTS);
    const canManageProcesses = useHasPermission(PERMISSIONS.MANAGE_PROCESSES);
    const canManageNews = useHasPermission(PERMISSIONS.MANAGE_NEWS);
    const canViewNews = useHasPermission(PERMISSIONS.VIEW_NEWS);
    
    console.log('🔐 [Dashboard.jsx] Rol del usuario:', userRole);
    console.log('🔐 [Dashboard.jsx] Permisos:', { 
        canManageUsers, 
        canManageDocs, 
        canViewDocs, 
        canManageProcesses, 
        canManageNews,
        canViewNews
    });

    // Estados compartidos
    const [stats, setStats] = useState({
        total_documentos: 0,
        total_direcciones: 0,
        total_procesos: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para búsqueda de documentos (solo para usuarios con permisos)
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [selectedExtensions, setSelectedExtensions] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        total: 0
    });
    const [paginationLoading, setPaginationLoading] = useState(false);
    
    // Estados para noticias
    const [newsItems, setNewsItems] = useState([]);
    
    // Refs para búsqueda
    const typingTimerRef = useRef(null);
    const searchAbortRef = useRef(null);

    // Cargar estadísticas (solo para administradores y directores)
    const fetchDashboardData = useCallback(async () => {
        if (!canManageDocs && !canManageProcesses) return;
        
        console.log('📡 [Dashboard.jsx] Iniciando fetchDashboardData');
        try {
            setLoading(true);
            setError(null);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await apiRequest('/documentos/estadisticas', {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.success) {
                console.log('✅ [Dashboard.jsx] Estadísticas cargadas exitosamente:', response.data);
                setStats(response.data);
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.log('❌ [Dashboard.jsx] Error al cargar estadísticas:', error.message);
                setError('Error al cargar datos');
                setStats({
                    total_documentos: 0,
                    total_direcciones: 0,
                    total_procesos: 0
                });
            }
        } finally {
            setLoading(false);
        }
    }, [apiRequest, canManageDocs, canManageProcesses]);

    // Cargar conteos por tipo de proceso
    const [tipoCounts, setTipoCounts] = useState({});
    useEffect(() => {
        if (!canManageProcesses) return;
        
        console.log('📊 [Dashboard.jsx] Cargando conteos por tipo de proceso');
        let mounted = true;
        (async () => {
            try {
                const res = await apiRequest('/procesos/tipos/stats');
                if (res?.success && mounted) {
                    console.log('✅ [Dashboard.jsx] Conteos por tipo cargados:', res.data);
                    setTipoCounts(res.data || {});
                }
            } catch (error) {
                console.log('❌ [Dashboard.jsx] Error al cargar conteos por tipo:', error.message);
            }
        })();
        return () => { mounted = false; };
    }, [apiRequest, canManageProcesses]);

    // Cargar noticias (para usuarios con permiso VIEW_NEWS)
    useEffect(() => {
        if (!canViewNews) return;
        
        console.log('📰 [Dashboard.jsx] Cargando noticias para el slider');
        const loadLatestNews = async () => {
            try {
                const res = await apiRequest('/noticias/latest?limit=5', { ignoreAuthErrors: true });
                if (res?.success) {
                    const items = (res.data || []).map(n => ({
                        id: n.id,
                        title: n.title,
                        subtitle: n.subtitle,
                        publishedAt: n.published_at,
                        ctaText: n.document_url ? 'Ver documento' : undefined,
                        onClick: n.document_url ? () => window.open(n.document_url, '_blank') : undefined,
                    }));
                    console.log('✅ [Dashboard.jsx] Noticias cargadas:', items.length);
                    setNewsItems(items);
                } else {
                    console.log('⚠️ [Dashboard.jsx] No se pudieron cargar las noticias');
                    setNewsItems([]);
                }
            } catch (error) {
                console.log('❌ [Dashboard.jsx] Error al cargar noticias:', error.message);
                setNewsItems([]);
            }
        };
        loadLatestNews();
    }, [apiRequest, canViewNews]);

    // Configuración de acciones rápidas según rol
    const actionsConfig = useMemo(() => {
        console.log('⚙️ [Dashboard.jsx] Configurando acciones rápidas para rol:', userRole);
        const items = [];
        const push = (title, desc, hash, icon, color) => items.push({ title, description: desc, hash, icon, colorClass: color });
        
        // Acciones para administradores y directores
        if (canManageProcesses) {
        if (tipoCounts.estrategico > 0) push('Procesos Estratégicos', 'Explora procesos estratégicos.', 'procesos/estrategico', <BuildingIcon className="w-6 h-6" />, 'quickActionIconAzul');
        if (tipoCounts.misional > 0) push('Procesos Misionales', 'Explora procesos misionales.', 'procesos/misional', <ProcessIcon className="w-6 h-6" />, 'quickActionIconVerde');
        if (tipoCounts.apoyo > 0) push('Procesos de Apoyo', 'Procesos que soportan la operación.', 'procesos/apoyo', <ProcessIcon className="w-6 h-6" />, 'quickActionIconMorado');
        if (tipoCounts.evaluacion > 0) push('Procesos de Evaluación', 'Evaluación y mejora continua.', 'procesos/evaluacion', <ProcessIcon className="w-6 h-6" />, 'quickActionIconMorado');
        }
        
        // Acciones para todos los usuarios con permisos de documentos
        if (canViewDocs || canManageDocs) {
        push('Formatos o Documentos', 'Crea y consulta documentos.', 'documentos', <DocumentIcon className="w-6 h-6" />, 'quickActionIconNaranja');
        }
        
        // Acciones solo para administradores
        if (canManageUsers) {
            push('Administración', 'Usuarios, roles y noticias/circulares.', 'administracion', <AdminIcon className="w-6 h-6" />, 'quickActionIconMorado');
        }
        
        console.log('✅ [Dashboard.jsx] Acciones configuradas:', items.length, 'acciones');
        return items;
    }, [tipoCounts, canManageProcesses, canViewDocs, canManageDocs, canManageUsers, userRole]);

    // Funciones de búsqueda de documentos (solo para usuarios con permisos)
    const performSearchWithFilters = async (customFilters = null, customPage = null) => {
        if (!canViewDocs) return;
        
        console.log('🔍 [Dashboard.jsx] Realizando búsqueda con filtros:', { customFilters, customPage });
        try {
            setSearchLoading(true);
            
            const filtersToUse = customFilters || filters;
            const pageToUse = customPage || pagination.currentPage;
            const params = new URLSearchParams();
            
            if (searchTerm && searchTerm.trim().length >= 3) {
                params.append('termino', searchTerm.trim());
            }
            
            if (filtersToUse.direccionId) {
                params.append('direccion_id', filtersToUse.direccionId);
            }
            
            if (filtersToUse.procesoId) {
                params.append('proceso_apoyo_id', filtersToUse.procesoId);
            }
            
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
            
            params.append('sort_by', 'created_at');
            params.append('sort_order', 'desc');
            params.append('per_page', pagination.perPage.toString());
            params.append('page', pageToUse.toString());

            let url = '/documentos';
            const hasText = Boolean(searchTerm && searchTerm.trim().length >= 3);
            
            if (hasText) {
                url = `/api/documentos/buscar?${params.toString()}`;
            } else {
                url = `/api/documentos?${params.toString()}`;
            }

            if (searchAbortRef.current) {
                try { searchAbortRef.current.abort(); } catch (e) {}
            }
            const controller = new AbortController();
            searchAbortRef.current = controller;

            console.log('🌐 [Dashboard.jsx] Haciendo petición a:', url);
            let response = await apiRequest(url, { signal: controller.signal });
            
            if (response.success) {
                let results = response.data?.documentos || response.data || [];
                console.log('✅ [Dashboard.jsx] Resultados obtenidos:', results.length);
                
                setSearchResults(results);
                
                if (response.data?.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        currentPage: response.data.pagination.current_page,
                        lastPage: response.data.pagination.last_page,
                        perPage: response.data.pagination.per_page,
                        total: response.data.pagination.total
                    }));
                }
            }
        } catch (error) {
            console.log('❌ [Dashboard.jsx] Error en la búsqueda:', error.message);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        console.log('🔍 [Dashboard.jsx] Búsqueda manual iniciada');
        await performSearchWithFilters();
    };

    const handleSearchTermChange = (e) => {
        const value = e.target.value;
        console.log('✏️ [Dashboard.jsx] Cambio en término de búsqueda:', value ? '***' : 'vacío');
        setSearchTerm(value);
        
        if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
        }
        
        typingTimerRef.current = setTimeout(() => {
            if (value.length >= 3 || value.length === 0) {
                performSearchWithFilters();
            }
        }, 500);
    };

    const handleFilterChange = async (newFilters) => {
        console.log('🔧 [Dashboard.jsx] Cambio de filtros:', newFilters);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        setFilters(newFilters);
        
        if (searchAbortRef.current) {
            try { searchAbortRef.current.abort(); } catch (e) {}
        }
        
        setSearchLoading(true);
        setSearchResults([]);
        await performSearchWithFilters(newFilters, 1);
    };

    const handleExtensionFilterChange = ({ extensiones, tipos }) => {
        console.log('📁 [Dashboard.jsx] Cambio en filtros de extensión:', { extensiones, tipos });
        setSelectedExtensions(extensiones);
        setSelectedTypes(tipos);
        
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        
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
        
        if (searchAbortRef.current) {
            try { searchAbortRef.current.abort(); } catch (e) {}
        }
        
        setSearchLoading(true);
        setSearchResults([]);
        performSearchWithFilters(newFilters, 1);
    };

    const clearAllFilters = () => {
        console.log('🧹 [Dashboard.jsx] Limpiando todos los filtros');
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
    };

    const handleDocumentClick = (document) => {
        console.log('📄 [Dashboard.jsx] Documento clickeado:', document.titulo);
        if (document.url) {
            window.open(document.url, '_blank');
        }
    };

    const handleViewDoc = async (documento) => {
        console.log('👁️ [Dashboard.jsx] Abriendo vista previa de documento:', documento.titulo);
        try {
            const res = await apiRequest(`/documentos/${documento.id}/vista-previa`);
            if (res.success && res.data?.url) {
                window.open(res.data.url, '_blank');
            } else {
                alert(res.message || 'No se pudo abrir la vista previa');
            }
        } catch (e) {
            console.log('❌ [Dashboard.jsx] Error al abrir vista previa:', e.message);
            alert(e.message || 'Error al abrir vista previa');
        }
    };

    const handleDownloadDoc = async (documento) => {
        console.log('⬇️ [Dashboard.jsx] Descargando documento:', documento.titulo);
        try {
            const res = await apiRequest(`/documentos/${documento.id}/descargar`, { method: 'POST' });
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
            console.log('❌ [Dashboard.jsx] Error al descargar documento:', e.message);
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

    // Efectos iniciales
    useEffect(() => {
        console.log('🔄 [Dashboard.jsx] useEffect - Inicializando dashboard para rol:', userRole);
        fetchDashboardData();
    }, [fetchDashboardData, userRole]);

    // Determinar el título del dashboard según el rol
    const getDashboardTitle = () => {
        switch (userRole) {
            case ROLES.ADMINISTRADOR:
                return "Panel de Administración";
            case ROLES.DIRECTOR:
                return "Panel de Dirección";
            case ROLES.USUARIO:
            default:
                return "Panel de Usuario";
        }
    };

    const getDashboardSubtitle = () => {
        switch (userRole) {
            case ROLES.ADMINISTRADOR:
                return "Gestión completa de documentos, procesos y usuarios";
            case ROLES.DIRECTOR:
                return "Gestión de documentos y procesos de la empresa";
            case ROLES.USUARIO:
            default:
                return "Consulta y descarga de documentos organizados";
        }
    };

    console.log('🎨 [Dashboard.jsx] Renderizando JSX del Dashboard Unificado');
    return (
        <div className={styles.dashboardContainer}>
            <DashboardHeader
                title={getDashboardTitle()}
                subtitle={getDashboardSubtitle()}
                rightSlot={canManageDocs || canManageProcesses ? (
                    <button
                        onClick={fetchDashboardData}
                        disabled={loading}
                        className={styles.refreshButton}
                        title="Actualizar datos"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {loading ? 'Actualizando...' : 'Actualizar'}
                    </button>
                ) : null}
            />

            <div className={styles.dashboardContent}>
                {/* Slider de noticias (para usuarios con permiso VIEW_NEWS) */}
                {canViewNews && (
                    <div className={styles.sliderSection}>
                        <NewsSlider items={newsItems} autoPlay autoPlayMs={6000} />
                    </div>
                )}

                {/* Misión y Visión (para usuarios regulares) */}
                {userRole === ROLES.USUARIO && (
                    <div className={styles.infoCardsSection}>
                        <InfoCards
                            items={[
                                {
                                    title: 'Misión',
                                    text: 'Brindar soluciones energéticas eficientes y sostenibles, impulsando el desarrollo industrial con tecnología de vanguardia y un compromiso permanente con la excelencia operativa.',
                                    icon: <MissionIcon className="w-6 h-6" />
                                },
                                {
                                    title: 'Visión',
                                    text: 'Ser referente nacional en innovación y gestión energética, generando valor para nuestros clientes y la sociedad mediante prácticas responsables y un equipo humano de alto desempeño.',
                                    icon: <VisionIcon className="w-6 h-6" />
                                }
                            ]}
                        />
                    </div>
                )}

                {/* Estadísticas (solo para administradores y directores) */}
                {(canManageDocs || canManageProcesses) && (
                    <StatsSection
                        stats={stats}
                        loading={loading}
                        error={error}
                        styles={styles}
                    />
                )}

                                {/* Acciones rápidas (para administradores y directores) */}
                {(userRole === ROLES.ADMINISTRADOR || userRole === ROLES.DIRECTOR) && (
                    <QuickActionsSection
                        actionsConfig={actionsConfig}
                        styles={styles}
                        isUserDashboard={userRole === ROLES.USUARIO}
                        onActionClick={(hash) => { 
                            console.log('🖱️ [Dashboard.jsx] Acción rápida clickeada:', hash);
                            if (hash) navigate(hash.startsWith('/') ? hash : `/${hash}`); 
                        }}
                    />
                )}

                {/* Búsqueda de documentos (solo para directores) */}
                {userRole === ROLES.DIRECTOR && (
                    <DocumentSearchSection
                        searchResults={searchResults}
                        searchLoading={searchLoading}
                        searchTerm={searchTerm}
                        filters={filters}
                        selectedExtensions={selectedExtensions}
                        selectedTypes={selectedTypes}
                        pagination={pagination}
                        paginationLoading={paginationLoading}
                        onSearch={handleSearch}
                        onSearchTermChange={handleSearchTermChange}
                        onFilterChange={handleFilterChange}
                        onExtensionFilterChange={handleExtensionFilterChange}
                        onClearFilters={clearAllFilters}
                        onDocumentClick={handleDocumentClick}
                        onViewDoc={handleViewDoc}
                        onDownloadDoc={handleDownloadDoc}
                        getDocumentIcon={getDocumentIcon}
                        styles={styles}
                        canManageDocs={canManageDocs}
                    />
                )}
            </div>
        </div>
    );
};

export default Dashboard; 