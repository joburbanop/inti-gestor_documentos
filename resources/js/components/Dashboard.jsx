import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'; import { useNavigate } from 'react-router-dom';
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
 // Estados compartidos
 const [stats, setStats] = useState({
 total_documentos: 0,
 total_procesos_generales: 0,
 total_procesos_internos: 0
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
 setStats(response.data);
 }
 } catch (error) {
 if (error.name !== 'AbortError') {
 setError('Error al cargar datos');
 setStats({
 total_documentos: 0,
 total_procesos_generales: 0,
 total_procesos_internos: 0
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
 let mounted = true;
 (async () => {
 try {
 const res = await apiRequest('/procesos/tipos/stats');
 if (res?.success && mounted) {
 setTipoCounts(res.data || {});
 }
 } catch (error) {
 }
 })();
 return () => { mounted = false; };
 }, [apiRequest, canManageProcesses]);
 // Cargar noticias (para usuarios con permiso VIEW_NEWS)
 useEffect(() => {
 if (!canViewNews) return;
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
 setNewsItems(items);
 } else {
 setNewsItems([]);
 }
 } catch (error) {
 setNewsItems([]);
 }
 };
 loadLatestNews();
 }, [apiRequest, canViewNews]);
 // Configuración de acciones rápidas según rol
 const actionsConfig = useMemo(() => {
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
 return items;
 }, [tipoCounts, canManageProcesses, canViewDocs, canManageDocs, canManageUsers, userRole]);
 // Funciones de búsqueda de documentos (solo para usuarios con permisos)
 const performSearchWithFilters = async (customFilters = null, customPage = null) => {
 if (!canViewDocs) return;
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
 url = `/documentos/buscar?${params.toString()}`;
 } else {
 url = `/documentos?${params.toString()}`;
 }
 if (searchAbortRef.current) {
 try { searchAbortRef.current.abort(); } catch (e) {}
 }
 const controller = new AbortController();
 searchAbortRef.current = controller;
 let response = await apiRequest(url, { signal: controller.signal });
 if (response.success) {
 let results = response.data?.documentos || response.data || [];
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
 setSearchResults([]);
 } finally {
 setSearchLoading(false);
 }
 };
 const handleSearch = async (e) => {
 e.preventDefault();
 await performSearchWithFilters();
 };
 const handleSearchTermChange = (e) => {
 const value = e.target.value;
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
 if (document.url) {
 window.open(document.url, '_blank');
 }
 };
 const handleViewDoc = async (documento) => {
 try {
 const res = await apiRequest(`/documentos/${documento.id}/vista-previa`);
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
 {/* Acciones rápidas (para todos los usuarios) */}
 <QuickActionsSection />
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