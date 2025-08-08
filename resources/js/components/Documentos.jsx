import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SearchFilterBar from './common/SearchFilterBar';
import DocumentCard from './documentos/DocumentCard';
import DocumentoModal from './documentos/DocumentoModal';
import ConfirmModal from './common/ConfirmModal';
import useConfirmModal from '../hooks/useConfirmModal';
import styles from '../styles/components/Documentos.module.css';

const TIPO_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'Política', label: 'Política' },
  { value: 'Procedimiento', label: 'Procedimiento' },
  { value: 'Formato', label: 'Formato' },
  { value: 'Registro', label: 'Registro' },
  { value: 'Informe', label: 'Informe' },
  { value: 'Plano', label: 'Plano' },
  { value: 'Acta', label: 'Acta' },
  { value: 'Contrato', label: 'Contrato' },
  { value: 'Fotografía', label: 'Fotografía' },
  { value: 'Otro', label: 'Otro' }
];

const CONF_OPTS = [
  { value: '', label: 'Todas' },
  { value: 'Publico', label: 'Público' },
  { value: 'Interno', label: 'Interno' },
  { value: 'Restringido', label: 'Restringido' }
];

const Documentos = () => {
  const { apiRequest } = useAuth();
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
    direccion_id: '',
    proceso_apoyo_id: '',
    tipo: '',
    etiquetas: [],
    etiquetas_texto: '',
    confidencialidad: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { modalState, showConfirmModal, hideConfirmModal } = useConfirmModal();

  const fetchDocumentos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      // Filtros soportados por backend
      activeFilters.forEach(f => {
        if (f.value !== '' && f.value !== null && f.value !== undefined) {
          params.set(f.key, f.value);
        }
      });
      const qs = params.toString();
      const url = qs ? `/api/documentos?${qs}` : '/api/documentos';
      const res = await apiRequest(url);
      if (res.success) {
        setDocumentos(res.data.documentos || res.data || []);
      } else {
        setDocumentos([]);
      }
    } catch (e) {
      console.error('Error al cargar documentos:', e);
      setDocumentos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(activeFilters)]);

  const filteredDocs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return documentos;
    return (documentos || []).filter(d => {
      const inTitulo = (d.titulo || '').toLowerCase().includes(term);
      const inDesc = (d.descripcion || '').toLowerCase().includes(term);
      const inTags = Array.isArray(d.etiquetas) ? d.etiquetas.join(' ').toLowerCase().includes(term) : false;
      return inTitulo || inDesc || inTags;
    });
  }, [searchTerm, documentos]);

  const handleSearch = (val) => setSearchTerm(val);
  const handleFiltersChange = (filters) => setActiveFilters(filters);

  const advancedFilters = [
    {
      key: 'tipo',
      label: 'Tipo',
      type: 'select',
      options: TIPO_OPTIONS
    },
    {
      key: 'confidencialidad',
      label: 'Confidencialidad',
      type: 'select',
      options: CONF_OPTS
    },
    {
      key: 'etiqueta',
      label: 'Etiqueta',
      type: 'text',
      value: activeFilters.find(f => f.key === 'etiqueta')?.value ?? ''
    },
    {
      key: 'desde',
      label: 'Desde (YYYY-MM-DD)',
      type: 'text',
      value: activeFilters.find(f => f.key === 'desde')?.value ?? ''
    },
    {
      key: 'hasta',
      label: 'Hasta (YYYY-MM-DD)',
      type: 'text',
      value: activeFilters.find(f => f.key === 'hasta')?.value ?? ''
    }
  ];

  const handleView = async (documento) => {
    try {
      const res = await apiRequest(`/api/documentos/${documento.id}/vista-previa`);
      if (res.success && res.data?.url) {
        window.open(res.data.url, '_blank');
      } else {
        alert(res.message || 'No se pudo abrir la vista previa');
      }
    } catch (e) {
      console.error('Error al abrir vista previa:', e);
      alert(e.message || 'Error al abrir vista previa');
    }
  };

  const handleDownload = async (documento) => {
    try {
      const res = await apiRequest(`/api/documentos/${documento.id}/descargar`, { method: 'POST' });
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
      console.error('Error al descargar documento:', e);
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
          await apiRequest(`/api/documentos/${documento.id}`, { method: 'DELETE' });
          await fetchDocumentos();
          
          // Forzar recarga de estadísticas del dashboard para actualizar contadores
          // Esto asegura que los contadores de documentos se actualicen en direcciones y procesos
          try {
            await apiRequest('/api/documentos/estadisticas', { 
              method: 'GET',
              ignoreAuthErrors: true 
            });
          } catch (e) {
            // Ignorar errores de estadísticas, no es crítico
            console.log('No se pudieron actualizar estadísticas:', e);
          }
        } catch (e) { 
          console.error('Error al eliminar documento:', e);
        }
      }
    });
  };

  const handleSubmit = async (data) => {
    try {
      setFormLoading(true);
      setErrors({});
      
      let res;
      
      if (modalMode === 'create') {
        // Crear nuevo documento
        const fd = new FormData();
        if (data.archivo instanceof File) fd.append('archivo', data.archivo);
        fd.append('titulo', data.titulo || '');
        fd.append('descripcion', data.descripcion || '');
        fd.append('direccion_id', data.direccion_id || '');
        fd.append('proceso_apoyo_id', data.proceso_apoyo_id || '');
        if (data.tipo) fd.append('tipo', data.tipo);
        
        // Convertir texto de etiquetas a array
        let tags = Array.isArray(data.etiquetas) ? data.etiquetas : [];
        if (data.etiquetas_texto && typeof data.etiquetas_texto === 'string') {
          const extra = data.etiquetas_texto.split(',').map(s => s.trim()).filter(Boolean);
          tags = Array.from(new Set([ ...tags, ...extra ]));
        }
        tags.forEach((t, i) => fd.append(`etiquetas[${i}]`, t));
        if (data.confidencialidad) fd.append('confidencialidad', data.confidencialidad);

        res = await apiRequest('/api/documentos', { method: 'POST', body: fd });
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
        
        // Convertir texto de etiquetas a array
        let tags = Array.isArray(data.etiquetas) ? data.etiquetas : [];
        if (data.etiquetas_texto && typeof data.etiquetas_texto === 'string') {
          const extra = data.etiquetas_texto.split(',').map(s => s.trim()).filter(Boolean);
          tags = Array.from(new Set([ ...tags, ...extra ]));
        }
        updateData.etiquetas = tags;

        res = await apiRequest(`/api/documentos/${data.id}`, { 
          method: 'PUT', 
          body: JSON.stringify(updateData) 
        });
      }
      
      if (res.success) {
        setShowModal(false);
        await fetchDocumentos();
        
        // Forzar recarga de estadísticas del dashboard para actualizar contadores
        try {
          await apiRequest('/api/documentos/estadisticas', { 
            method: 'GET',
            ignoreAuthErrors: true 
          });
        } catch (e) {
          console.log('No se pudieron actualizar estadísticas:', e);
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
      direccion_id: '',
      proceso_apoyo_id: '',
      tipo: '',
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
      direccion_id: '',
      proceso_apoyo_id: '',
      tipo: '',
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
              Busca y filtra documentos por tipo, etiquetas y confidencialidad
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

