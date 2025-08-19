import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
 import { useAuth } from '../contexts/AuthContext';
 import SearchFilterBar from './common/SearchFilterBar';
 import DocumentCard from './documentos/DocumentCard';
 import DocumentoModal from './documentos/DocumentoModal';
 import ConfirmModal from './common/ConfirmModal';
 import useConfirmModal from '../hooks/useConfirmModal';
 import styles from '../styles/components/Documentos.module.css';
 const TIPO_OPTIONS = [
 { value: '', label: 'Todos los tipos' },
 { value: 'Política', label: 'Política' },
 { value: 'Procedimiento', label: 'Procedimiento' },
 { value: 'Formato', label: 'Formato' },
 { value: 'Registro', label: 'Registro' },
 { value: 'Informe', label: 'Informe' },
 { value: 'Plano', label: 'Plano' },
 { value: 'Acta', label: 'Acta' },
 { value: 'Contrato', label: 'Contrato' },
 { value: 'Fotografía', label: 'Fotografía' },
 { value: 'Factura', label: 'Factura' },
 { value: 'Presupuesto', label: 'Presupuesto' },
 { value: 'Manual', label: 'Manual' },
 { value: 'Otro', label: 'Otro' }
 ];
 const CONF_OPTS = [
 { value: '', label: 'Todas las confidencialidades' },
 { value: 'Publico', label: 'Público' },
 { value: 'Interno', label: 'Interno' }
 ];
 const EXTENSION_OPTIONS = [
 { value: '', label: 'Todos los formatos' },
 { value: 'pdf', label: 'PDF' },
 { value: 'docx', label: 'Word (.docx)' },
 { value: 'xlsx', label: 'Excel (.xlsx)' },
 { value: 'pptx', label: 'PowerPoint (.pptx)' },
 { value: 'jpg', label: 'Imagen (.jpg)' },
 { value: 'png', label: 'Imagen (.png)' },
 { value: 'txt', label: 'Texto (.txt)' },
 { value: 'zip', label: 'Archivo comprimido (.zip)' }
 ];
 const Documentos = () => {
 const { apiRequest } = useAuth();
 const location = useLocation();
 const [loading, setLoading] = useState(true);
 const [documentos, setDocumentos] = useState([]);
 const [searchTerm, setSearchTerm] = useState('');
 const [activeFilters, setActiveFilters] = useState([]);
 const [showModal, setShowModal] = useState(false);
 const [modalMode, setModalMode] = useState('create');
 const [formData, setFormData] = useState({
 archivo: null,
 titulo: '',
 descripcion: '',
 tipo_proceso_id: '',
 proceso_general_id: '',
  proceso_interno_id: '', tipo: '',
 etiquetas: [],
 etiquetas_texto: '',
 confidencialidad: '',
 });
 const [formLoading, setFormLoading] = useState(false);
 const [errors, setErrors] = useState({});
 const { modalState, showConfirmModal, hideConfirmModal } = useConfirmModal();
 // Estados para filtros avanzados
 const [advancedFilterValues, setAdvancedFilterValues] = useState({
 tipo: '',
 etiqueta: [],
 extension: '',
 proceso_general_id: '',
  proceso_interno_id: '',
 descargasMin: ''
 });
 // Opciones dinámicas para selects en cascada
 const [procesosGeneralesOptions, setProcesosGeneralesOptions] = useState([
 { value: '', label: 'Todos los procesos generales' }
 ]);
 const [procesosInternosOptions, setProcesosInternosOptions] = useState([
 { value: '', label: 'Todos los procesos internos' }
 ]);
 const [etiquetasOptions, setEtiquetasOptions] = useState([]);
 const [tiposDocumentoOptions, setTiposDocumentoOptions] = useState([]);
 const abortRef = useRef(null);
 const fetchDocumentos = async () => {
 try {
 setLoading(true);
 // Cancelar solicitud anterior en vuelo
 if (abortRef.current) {
 try { abortRef.current.abort(); } catch (_) {}
 }
 const controller = new AbortController();
 abortRef.current = controller;
 const params = new URLSearchParams();
 // Filtros básicos
 activeFilters.forEach(f => {
 if (f.value !== '' && f.value !== null && f.value !== undefined) {
 params.set(f.key, f.value);
 }
 });
 // Filtros avanzados
 Object.entries(advancedFilterValues).forEach(([key, value]) => {
 if (value && value !== '') {
 params.set(key, value);
 }
 });
 // Término de búsqueda (server-side)
 const q = searchTerm.trim();
 if (q) params.set('q', q);
 // Solicitar más documentos por página (máximo 100)
   params.set('per_page', '100');
 const qs = params.toString();
 const url = `/documentos?${qs}`;
 const res = await apiRequest(url, { signal: controller.signal });
 if (res.success) {
 const docs = res.data.documentos || res.data || [];
 setDocumentos(docs);
 } else {
 setDocumentos([]);
 }
 } catch (e) {
 if (e.name === 'AbortError') {
 return; // solicitud cancelada, no actualizar estado
 }
 console.error('Error al cargar documentos:', e);
 setDocumentos([]);
 } finally {
 setLoading(false);
 }
 };
 useEffect(() => {
 fetchDocumentos();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [JSON.stringify(activeFilters), JSON.stringify(advancedFilterValues), searchTerm]);
 // Cargar etiquetas disponibles al inicio
 useEffect(() => {
 (async () => {
 try {
 const response = await apiRequest('/documentos/etiquetas');
 if (response.success) {
 const etiquetas = response.data || [];
 setEtiquetasOptions(etiquetas);
 }
 } catch (error) {
 console.error('Error al cargar etiquetas:', error);
 }
 })();
 }, []);
 // Cargar tipos de documento disponibles al inicio
 useEffect(() => {
 (async () => {
 try {
 const response = await apiRequest('/documentos/tipos');
 if (response.success) {
 const tipos = response.data || [];
 setTiposDocumentoOptions(tipos);
 }
 } catch (error) {
 console.error('Error al cargar tipos de documento:', error);
 }
 })();
 }, []);
 // Cargar procesos generales al inicio
 useEffect(() => {
 (async () => {
 try {
 const d = await apiRequest('/procesos-generales');
 if (d.success) {
 const opts = [{ value: '', label: 'Todos los procesos generales' }].concat(
 (d.data || []).map(x => ({ value: x.id, label: x.nombre }))
 );
 setProcesosGeneralesOptions(opts);
 }
 } catch {}
 })();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);
 // Cargar procesos internos cuando cambia el proceso general seleccionado (cascada)
 useEffect(() => {
 const procesoGeneralId = advancedFilterValues.proceso_general_id;
 if (!procesoGeneralId) {
 setProcesosInternosOptions([{ value: '', label: 'Todos los procesos internos' }]);
 setAdvancedFilterValues(prev => ({ ...prev, proceso_interno_id: '' }));
 return;
 }
 (async () => {
 try {
 const p = await apiRequest(`/procesos-generales/${procesoGeneralId}/procesos-internos`);
 if (p.success) {
 const opts = [{ value: '', label: 'Todos los procesos internos' }].concat(
 (p.data || []).map(x => ({ value: x.id, label: x.nombre }))
 );
 setProcesosInternosOptions(opts);
 setAdvancedFilterValues(prev => ({ ...prev, proceso_interno_id: '' }));
 } else {
 setProcesosInternosOptions([{ value: '', label: 'Todos los procesos internos' }]);
 }
 } catch {
 setProcesosInternosOptions([{ value: '', label: 'Todos los procesos internos' }]);
 }
 })();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [advancedFilterValues.proceso_general_id]);
 // Manejar filtro por categoría cuando se navega desde categorías
 useEffect(() => {
 if (location.state?.filterByCategoria) {
 const categoriaId = location.state.filterByCategoria;
 const categoriaName = location.state.categoriaName;
 // Aplicar filtro por categoría
 setAdvancedFilterValues(prev => ({
 ...prev,
 proceso_interno_id: categoriaId.toString()
 }));
 // Mostrar notificación
 // showSuccess(`Filtrado por categoría: ${categoriaName}`);
 // Limpiar el estado de navegación
 window.history.replaceState({}, document.title, window.location.pathname);
 }
 }, [location.state]);
 // Resultados vienen ya filtrados desde el servidor
 const filteredDocs = documentos;
 const handleSearch = (val) => setSearchTerm(val);
 const handleFiltersChange = (filters) => setActiveFilters(filters);
 // Manejar cambios en filtros avanzados
 const handleAdvancedFilterChange = (filterKey, value) => {
 setAdvancedFilterValues(prev => {
 const newValues = {
 ...prev,
 [filterKey]: value
 };
 return newValues;
 });
 };
 // Limpiar todos los filtros
 const clearAllFilters = () => {
 setActiveFilters([]);
 setAdvancedFilterValues({
 tipo: '',
 etiqueta: [],
 extension: '',
 tipo_proceso_id: '',
 proceso_general_id: '',
  proceso_interno_id: '', descargasMin: ''
 });
 setSearchTerm('');
 };
 const advancedFilters = useMemo(() => [
 {
 key: 'tipo',
 label: 'Tipo de Documento',
 type: 'select',
 options: [
 { value: '', label: 'Todos los tipos' },
 ...tiposDocumentoOptions.map(tipo => ({
 value: tipo,
 label: tipo
 }))
 ],
 value: advancedFilterValues.tipo
 },
 {
 key: 'etiqueta',
 label: 'Etiquetas',
 type: 'multiselect',
 options: etiquetasOptions.map(etiqueta => ({
 value: etiqueta,
 label: etiqueta
 })),
 value: advancedFilterValues.etiqueta || []
 },
 {
 key: 'descargasMin',
 label: 'Cantidad Descargas',
 type: 'number',
 placeholder: 'Ej: 5',
 value: advancedFilterValues.descargasMin
 },
 {
 key: 'extension',
 label: 'Formato de Archivo',
 type: 'select',
 options: EXTENSION_OPTIONS,
 value: advancedFilterValues.extension
 },
 {
 key: 'proceso_general_id',
 label: 'Proceso General',
 type: 'select',
 options: procesosGeneralesOptions,
 value: advancedFilterValues.proceso_general_id
 },
 {
 key: 'proceso_interno_id',
 label: 'Proceso Interno',
 type: 'select',
 options: procesosInternosOptions,
 value: advancedFilterValues.proceso_interno_id
 }
 ], [procesosGeneralesOptions, procesosInternosOptions, etiquetasOptions, tiposDocumentoOptions, advancedFilterValues]);
 const handleView = async (documento) => {
 try {
 const res = await apiRequest(`/documentos/${documento.id}/vista-previa`, { method: 'GET' });
 if (res.success && res.data?.url) {
 // Construir URL completa con el token de autenticación
 const token = localStorage.getItem('auth_token');
 const fullUrl = `${window.location.origin}${res.data.url}`;
 // Para archivos visualizables, abrir en nueva pestaña
 if (res.data.viewable) {
 const newWin = window.open(fullUrl, '_blank', 'noopener,noreferrer');
 if (!newWin) {
 alert('Permite las ventanas emergentes para ver el documento.');
 }
 } else {
 // Para archivos no visualizables, mostrar mensaje
 alert('Este tipo de archivo no se puede previsualizar. Se abrirá para descarga.');
 const newWin = window.open(fullUrl, '_blank', 'noopener,noreferrer');
 if (!newWin) {
 alert('Permite las ventanas emergentes para descargar el documento.');
 }
 }
 } else {
 alert(res.message || 'No se pudo abrir la vista previa');
 }
 } catch (e) {
 console.error('Error en vista previa:', e);
 alert('Error al abrir vista previa: ' + (e.message || 'Error desconocido'));
 }
 };
 const handleDownload = async (documento) => {
 try {
 const res = await apiRequest(`/documentos/${documento.id}/descargar`, { method: 'POST' });
 if (res.success && res.data?.url) {
 // Si la URL es pública (storage local), forzar descarga con atributo download
 const a = document.createElement('a');
 a.href = res.data.url;
 a.download = documento.nombre_original || documento.titulo || 'documento';
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 // Refrescar documentos para actualizar contador de descargas
 try { await fetchDocumentos(); } catch (_) {}
 } else {
 alert(res.message || 'No se pudo generar la descarga');
 }
 } catch (e) {
 // Silenciado en producción
 alert(e.message || 'Error al descargar documento');
 }
 };
 const handleEdit = (documento) => {
 setModalMode('edit');
 setFormData({
 ...formData,
 ...documento,
 etiquetas_texto: Array.isArray(documento.etiquetas) ? documento.etiquetas.join(', ') : ''
 });
 setShowModal(true);
 };
 const handleDelete = (documento) => {
 showConfirmModal({
 title: 'Eliminar Documento',
 message: `¿Estás seguro de que quieres eliminar "${documento.titulo}"? Esta acción no se puede deshacer.`,
 confirmText: 'Eliminar',
 cancelText: 'Cancelar',
 type: 'danger',
 onConfirm: async () => {
 try {
 await apiRequest(`/documentos/${documento.id}`, { method: 'DELETE' });
 await fetchDocumentos();
 // Forzar recarga de estadísticas del dashboard para actualizar contadores
 // Esto asegura que los contadores de documentos se actualicen en direcciones y procesos
 try {
 await apiRequest('/documentos/estadisticas', {
 method: 'GET',
 ignoreAuthErrors: true
 });
 } catch (e) {
 // Ignorar errores de estadísticas
 }
 } catch (e) {
 // Silenciado
 }
 }
 });
 };
 const handleSubmit = async (data) => {
 try {
 setFormLoading(true);
 setErrors({});
 let res;
 
 console.log('🔍 [Documentos.jsx] Datos recibidos en handleSubmit:', data);
 
 if (modalMode === 'create') {
  // Crear nuevo documento
  let fd;
  
  // Verificar si ya recibimos FormData del CreateForm
  if (data instanceof FormData) {
   console.log('📁 [Documentos.jsx] Recibido FormData del CreateForm');
   fd = data;
  } else {
   console.log('📋 [Documentos.jsx] Recibidos datos normales, creando FormData');
   // Crear FormData manualmente
   fd = new FormData();
   if (data.archivo instanceof File) fd.append('archivo', data.archivo);
   fd.append('titulo', data.titulo || '');
   fd.append('descripcion', data.descripcion || '');
   // Campos estandarizados según jerarquía: tipo_proceso_id -> proceso_general_id -> proceso_interno_id
   fd.append('tipo_proceso_id', data.tipo_proceso_id || '');
   fd.append('proceso_general_id', data.proceso_general_id || '');
   fd.append('proceso_interno_id', data.proceso_interno_id || '');
   if (data.tipo) fd.append('tipo', data.tipo);
   // Etiquetas: ahora vienen como array en data.etiquetas
   (Array.isArray(data.etiquetas) ? data.etiquetas : []).forEach((t, i) => fd.append(`etiquetas[${i}]`, t));
   if (data.confidencialidad) fd.append('confidencialidad', data.confidencialidad);
  }
  
  console.log('📁 [Documentos.jsx] FormData final:', {
    titulo: fd.get('titulo'),
    descripcion: fd.get('descripcion'),
    tipo_proceso_id: fd.get('tipo_proceso_id'),
    proceso_general_id: fd.get('proceso_general_id'),
    proceso_interno_id: fd.get('proceso_interno_id'),
    archivo: fd.get('archivo') ? fd.get('archivo').name : 'no file'
  });
  
  res = await apiRequest('/documents', { method: 'POST', body: fd });
  } else {
 // Actualizar documento existente
 const updateData = {
 titulo: data.titulo || '',
 descripcion: data.descripcion || '',
 direccion_id: data.direccion_id || '',
 proceso_apoyo_id: data.proceso_apoyo_id || '',
 tipo: data.tipo || '',
 confidencialidad: data.confidencialidad || ''
 };
 updateData.etiquetas = Array.isArray(data.etiquetas) ? data.etiquetas : [];
 res = await apiRequest(`/documentos/${data.id}`, {
 method: 'PUT',
 body: JSON.stringify(updateData)
 });
 }
 if (res.success) {
 setShowModal(false);
 await fetchDocumentos();
 // Forzar recarga de estadísticas del dashboard para actualizar contadores
 try {
 await apiRequest('/documentos/estadisticas', {
 method: 'GET',
 ignoreAuthErrors: true
 });
 } catch (e) {
 }
 } else {
 setErrors({ general: res.message || `Error al ${modalMode === 'create' ? 'crear' : 'actualizar'} documento` });
 }
 } catch (e) {
 if (e.errors) setErrors(e.errors);
 else setErrors({ general: e.message || `Error al ${modalMode === 'create' ? 'crear' : 'actualizar'} documento` });
 } finally {
 setFormLoading(false);
 }
 };
 const openCreateModal = () => {
 setModalMode('create');
 setFormData({
 archivo: null,
 titulo: '',
 descripcion: '',
 tipo_proceso_id: '',
 proceso_general_id: '',
  proceso_interno_id: '', tipo: '',
 etiquetas: [],
 etiquetas_texto: '',
 confidencialidad: '',
 });
 setErrors({});
 setShowModal(true);
 };
 const closeModal = () => {
 setShowModal(false);
 setFormData({
 archivo: null,
 titulo: '',
 descripcion: '',
 tipo_proceso_id: '',
 proceso_general_id: '',
  proceso_interno_id: '', tipo: '',
 etiquetas: [],
 etiquetas_texto: '',
 confidencialidad: '',
 });
 setErrors({});
 };
 return (
 <div className={styles.documentosContainer}>
 {/* Header */}
 <div className={styles.header}>
 <div className={styles.headerContent}>
 <div>
 <h1 className={styles.title}>Gestión de Documentos</h1>
 <p className={styles.subtitle}>
 Busca y filtra documentos por proceso estratégico, proceso misional, tipo, etiquetas y más
 </p>
 </div>
 <button
 onClick={openCreateModal}
 className={styles.createButton}
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
 </svg>
 Nuevo Documento
 </button>
 </div>
 </div>
 {/* Barra de búsqueda y filtros */}
 <SearchFilterBar
 onSearch={handleSearch}
 onFiltersChange={handleFiltersChange}
 placeholder="Buscar documentos por título, descripción o etiquetas..."
 searchValue={searchTerm}
 loading={loading}
 showAdvancedFilters={true}
 advancedFilters={advancedFilters}
 onAdvancedFilterChange={handleAdvancedFilterChange}
 clearAllFilters={clearAllFilters}
 />
 {/* Contenido */}
 {loading ? (
 <div className={styles.loadingContainer}>
 <div className={styles.loadingSpinner}></div>
 <p>Cargando documentos...</p>
 </div>
 ) : filteredDocs.length === 0 ? (
 <div className={styles.loadingContainer}>
 <p>No se encontraron documentos</p>
 </div>
 ) : (
 <div className={styles.documentosGrid}>
 {filteredDocs.map((documento) => (
 <DocumentCard
 key={documento.id}
 documento={documento}
 onView={handleView}
 onEdit={handleEdit}
 onDelete={handleDelete}
 onDownload={handleDownload}
 busy={formLoading}
 />
 ))}
 </div>
 )}
 {/* Modal de documento */}
 {showModal && (
 <DocumentoModal
 show={showModal}
 mode={modalMode}
 formData={formData}
 onClose={closeModal}
 onChange={setFormData}
 loading={formLoading}
 errors={errors}
 onSubmit={handleSubmit}
 />
 )}
 {/* Modal de confirmación */}
 <ConfirmModal
 isOpen={modalState.isOpen}
 title={modalState.title}
 message={modalState.message}
 confirmText={modalState.confirmText}
 cancelText={modalState.cancelText}
 type={modalState.type}
 icon={modalState.icon}
 onClose={hideConfirmModal}
 onConfirm={modalState.onConfirm}
 />
 </div>
 );
 };
 export default Documentos;