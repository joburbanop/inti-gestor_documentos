import React, { useState, useEffect, useRef } from 'react'; import HierarchicalFilters from './HierarchicalFilters';
 import ExtensionFilter from './ExtensionFilter';
 const DocumentSearchSection = ({
 searchResults,
 searchLoading,
 searchTerm,
 filters,
 selectedExtensions,
 selectedTypes,
 pagination,
 paginationLoading,
 onSearch,
 onSearchTermChange,
 onFilterChange,
 onExtensionFilterChange,
 onClearFilters,
 onDocumentClick,
 onViewDoc,
 onDownloadDoc,
 getDocumentIcon,
 styles,
 canManageDocs
 }) => {
 const typingTimerRef = useRef(null);
 const searchAbortRef = useRef(null);
 // Funciones de paginación
 const goToPage = async (page) => {
 if (page >= 1 && page <= pagination.lastPage) {
 // Actualizar el estado de paginación inmediatamente
 const newPagination = { ...pagination, currentPage: page };
 // Ejecutar búsqueda con la nueva página
 await performSearchWithFilters(null, page);
 } else {
 }
 };
 const goToNextPage = async () => {
 const nextPage = pagination.currentPage + 1;
 if (nextPage <= pagination.lastPage) {
 await goToPage(nextPage);
 } else {
 }
 };
 const goToPrevPage = async () => {
 if (pagination.currentPage > 1) {
 await goToPage(pagination.currentPage - 1);
 }
 };
 const performSearchWithFilters = async (customFilters = null, customPage = null) => {
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
 // Llamar a la función del padre para ejecutar la búsqueda
 if (onSearch) {
 await onSearch();
 }
 };
 // Debounce de búsqueda por texto
 useEffect(() => {
 if (searchTerm && searchTerm.trim().length >= 3) {
 if (typingTimerRef.current) {
 clearTimeout(typingTimerRef.current);
 }
 typingTimerRef.current = setTimeout(() => {
 performSearchWithFilters();
 }, 500);
 }
 }, [searchTerm]);
 return (
 <div className={styles.documentSearchSection}>
 {/* Barra de búsqueda */}
 <div className={styles.searchBar}>
 <form onSubmit={onSearch} className={styles.searchForm}>
 <div className={styles.searchInputContainer}>
 <input
 type="text"
 placeholder="Buscar documentos..."
 value={searchTerm}
 onChange={onSearchTermChange}
 className={styles.searchInput}
 />
 <button type="submit" className={styles.searchButton}>
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 </button>
 </div>
 </form>
 </div>
 {/* Filtros */}
 <div className={styles.filtersContainer}>
 {/* HierarchicalFilters temporalmente deshabilitado - requiere actualización de endpoints */}
 {/* <HierarchicalFilters
 onFilterChange={onFilterChange}
 filters={filters}
 styles={styles}
 /> */}
 <ExtensionFilter
 onFilterChange={onExtensionFilterChange}
 selectedExtensions={selectedExtensions}
 selectedTypes={selectedTypes}
 styles={styles}
 />
 </div>
 {/* Resultados de documentos */}
 {searchResults.length > 0 && (
 <div className={styles.documentResults}>
 <div className={styles.documentResultsHeader}>
 <h3 className={styles.documentResultsTitle}>
 Documentos Encontrados ({searchResults.length})
 </h3>
 <button
 onClick={onClearFilters}
 className={styles.clearResultsButton}
 >
 Limpiar búsqueda
 </button>
 </div>
 <div className={styles.documentResultsList}>
 {searchResults.map((doc) => (
 <div key={doc.id} className={styles.documentItem}>
 <div className={`${styles.documentIcon} ${
 doc.extension === 'pdf' ? styles.documentIconPDF :
 doc.extension === 'xlsx' || doc.extension === 'xls' ? styles.documentIconXLSX :
 doc.extension === 'doc' || doc.extension === 'docx' ? styles.documentIconDOC :
 ''
 }`}>
 {getDocumentIcon(doc.tipo_archivo)}
 </div>
 <div className={styles.documentInfo}>
 <h4 className={styles.documentTitle}>{doc.titulo}</h4>
 <div className={styles.documentMeta}>
 <span className={styles.documentDirection}>
 {doc.direccion?.nombre}
 </span>
 <span className={styles.documentSeparator}>•</span>
 <span className={styles.documentProcess}>
 {doc.proceso_apoyo?.nombre}
 </span>
 <span className={styles.documentSeparator}>•</span>
 <span className={styles.documentType}>
 {doc.tipo_archivo}
 </span>
 </div>
 {doc.etiquetas && doc.etiquetas.length > 0 && (
 <div className={styles.documentTags}>
 {doc.etiquetas.slice(0, 3).map((tag, index) => (
 <span key={index} className={styles.documentTag}>
 {tag}
 </span>
 ))}
 {doc.etiquetas.length > 3 && (
 <span className={styles.documentTagMore}>
 +{doc.etiquetas.length - 3}
 </span>
 )}
 </div>
 )}
 <div className={styles.documentActions}>
 <button
 onClick={() => onViewDoc(doc)}
 className={`${styles.actionButton} ${styles.viewButton}`}
 >
 Ver
 </button>
 <button
 onClick={() => onDownloadDoc(doc)}
 className={`${styles.actionButton} ${styles.downloadButton}`}
 >
 Descargar
 </button>
 {canManageDocs && (
 <button
 onClick={() => onDocumentClick(doc)}
 className={`${styles.actionButton} ${styles.editButton}`}
 >
 Editar
 </button>
 )}
 </div>
 </div>
 <div className={styles.documentDate}>
 {doc.fecha_creacion ? new Date(doc.fecha_creacion).toLocaleDateString() : ''}
 </div>
 </div>
 ))}
 </div>
 {/* Paginación */}
 {pagination.lastPage > 1 && (
 <div className={styles.paginationContainer}>
 <div className={styles.paginationInfo}>
 <span>📄 Página {pagination.currentPage} de {pagination.lastPage}</span>
 <span>📊</span>
 <span>Mostrando {searchResults.length} de {pagination.total} documentos</span>
 {paginationLoading && (
 <span style={{ color: '#1F448B', fontWeight: '600' }}>
 🔄 Cargando...
 </span>
 )}
 </div>
 <div className={styles.paginationControls}>
 <button
 onClick={goToPrevPage}
 disabled={pagination.currentPage === 1 || paginationLoading}
 className={`${styles.paginationButton} ${styles.paginationPrev}`}
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
 <div className={styles.paginationNumbers}>
 {(() => {
 const pages = [];
 const currentPage = pagination.currentPage;
 const lastPage = pagination.lastPage;
 const addPageIfNotExists = (page) => {
 if (page >= 1 && page <= lastPage && !pages.some(p => p.number === page)) {
 pages.push({
 number: page,
 type: 'number',
 isActive: page === currentPage
 });
 }
 };
 const start = Math.max(1, currentPage - 2);
 const end = Math.min(lastPage, currentPage + 2);
 if (currentPage > 3 && start > 1) {
 addPageIfNotExists(1);
 }
 if (currentPage > 4 && start > 2) {
 pages.push({ type: 'ellipsis', key: 'ellipsis-start' });
 }
 for (let i = start; i <= end; i++) {
 addPageIfNotExists(i);
 }
 if (currentPage < lastPage - 3 && end < lastPage - 1) {
 pages.push({ type: 'ellipsis', key: 'ellipsis-end' });
 }
 if (currentPage < lastPage - 2 && end < lastPage) {
 addPageIfNotExists(lastPage);
 }
 return pages.map((item, index) => {
 if (item.type === 'ellipsis') {
 return (
 <span
 key={item.key || `ellipsis-${index}`}
 className={styles.paginationEllipsis}
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
 className={`${styles.paginationNumber} ${
 item.isActive ? styles.paginationActive : ''
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
 className={`${styles.paginationButton} ${styles.paginationNext}`}
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
 <div className={styles.noResultsContainer}>
 <div className={styles.noResultsIcon}>
 <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
 </svg>
 </div>
 <h3 className={styles.noResultsTitle}>No se encontraron documentos</h3>
 <p className={styles.noResultsText}>
 Intenta ajustar tus filtros de búsqueda o usar términos diferentes.
 </p>
 <button
 onClick={onClearFilters}
 className={styles.noResultsButton}
 >
 Limpiar filtros
 </button>
 </div>
 )}
 {/* Loading state */}
 {searchLoading && (
 <div className={styles.loadingContainer}>
 <div className={styles.loadingSpinner}></div>
 <p className="text-gray-600 text-lg font-medium mt-4">
 Buscando documentos...
 </p>
 </div>
 )}
 </div>
 );
 };
 export default DocumentSearchSection;