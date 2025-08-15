import React, { useEffect, useState } from 'react';
import CreateForm from '../common/CreateForm';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/components/Documentos.module.css';
import { 
  DocumentIcon, 
  TagIcon, 
  BuildingIcon, 
  ProcessIcon, 
  LockIcon, 
  FileIcon 
} from '../icons/DashboardIcons';

const TIPO_OPTIONS = [
  { value: 'Formato', label: 'Formato' },
  { value: 'Informe', label: 'Informe' }
];

const CONF_OPTS = [
  { value: 'Publico', label: 'Público' },
  { value: 'Interno', label: 'Interno' }
];

const DocumentoModal = ({ show, mode, formData, onClose, onSubmit, onChange, loading = false, errors = {} }) => {
  const { apiRequest } = useAuth();
  const [direccionesOptions, setDireccionesOptions] = useState([]);
  const [procesosOptions, setProcesosOptions] = useState([]);
  const [tipoOptions, setTipoOptions] = useState(TIPO_OPTIONS);
  const [etiquetasOptions, setEtiquetasOptions] = useState([]);
  const [localData, setLocalData] = useState(formData || {});

  useEffect(() => {
    if (!show) return;
    console.log('🔄 [DocumentoModal.jsx] Cargando datos iniciales...');
    (async () => {
      try {
        console.log('📡 [DocumentoModal.jsx] Haciendo requests a la API...');
        const [d, e] = await Promise.all([
          apiRequest('/procesos-generales'),
          apiRequest('/documentos/etiquetas')
        ]);
        
        console.log('📊 [DocumentoModal.jsx] Respuesta procesos generales:', d);
        console.log('🏷️ [DocumentoModal.jsx] Respuesta etiquetas:', e);
        
        if (d.success) {
          const procesosGenerales = d.data.map(x => ({ value: x.id, label: x.nombre }));
          console.log('✅ [DocumentoModal.jsx] Procesos generales cargados:', procesosGenerales);
          setDireccionesOptions(procesosGenerales);
        } else {
          console.error('❌ [DocumentoModal.jsx] Error cargando procesos generales:', d);
        }
        
        if (e.success) {
          const etiquetas = e.data.map(x => ({ value: x, label: x }));
          console.log('✅ [DocumentoModal.jsx] Etiquetas cargadas:', etiquetas);
          setEtiquetasOptions(etiquetas);
        } else {
          console.error('❌ [DocumentoModal.jsx] Error cargando etiquetas:', e);
        }
        
        const procesoGeneralId = (formData && formData.proceso_general_id) || localData?.proceso_general_id;
        console.log('🎯 [DocumentoModal.jsx] Proceso General ID para cargar procesos internos:', procesoGeneralId);
        
        if (procesoGeneralId) {
          const p = await apiRequest(`/procesos-generales/${procesoGeneralId}/procesos-internos`);
          console.log('📡 [DocumentoModal.jsx] Respuesta procesos internos:', p);
          if (p.success) {
            const procesos = (p.data || []).map(x => ({ value: x.id, label: x.nombre }));
            console.log('✅ [DocumentoModal.jsx] Procesos internos cargados:', procesos);
            setProcesosOptions(procesos);
          } else {
            console.error('❌ [DocumentoModal.jsx] Error cargando procesos internos:', p);
            setProcesosOptions([]);
          }
        } else {
          console.log('ℹ️ [DocumentoModal.jsx] No hay proceso general seleccionado, procesos internos vacíos');
          setProcesosOptions([]);
        }
      } catch (error) {
        console.error('💥 [DocumentoModal.jsx] Error general cargando datos:', error);
      }
    })();
  }, [show, apiRequest]);

  // Cargar procesos internos cuando cambia el proceso general seleccionado
  useEffect(() => {
    if (!show) return;
    const procesoGeneralId = localData?.proceso_general_id;
    console.log('🔄 [DocumentoModal.jsx] Cambio de proceso general detectado:', procesoGeneralId);
    
    if (!procesoGeneralId) {
      console.log('ℹ️ [DocumentoModal.jsx] No hay proceso general seleccionado, limpiando procesos internos');
      setProcesosOptions([]);
      return;
    }
    
    (async () => {
      try {
        console.log('📡 [DocumentoModal.jsx] Cargando procesos internos para proceso general:', procesoGeneralId);
        const p = await apiRequest(`/procesos-generales/${procesoGeneralId}/procesos-internos`);
        console.log('📊 [DocumentoModal.jsx] Respuesta procesos internos por proceso general:', p);
        
        if (p.success) {
          const procesos = (p.data || []).map(x => ({ value: x.id, label: x.nombre }));
          console.log('✅ [DocumentoModal.jsx] Procesos internos cargados para proceso general:', procesos);
          setProcesosOptions(procesos);
          setLocalData(prev => ({ ...prev, proceso_interno_id: '' }));
        } else {
          console.error('❌ [DocumentoModal.jsx] Error cargando procesos internos por proceso general:', p);
          setProcesosOptions([]);
        }
      } catch (error) {
        console.error('💥 [DocumentoModal.jsx] Error cargando procesos internos por proceso general:', error);
        setProcesosOptions([]);
      }
    })();
  }, [localData?.proceso_general_id, show, apiRequest]);

  if (!show) return null;

  const handleAddTipo = () => {
    const nuevo = window.prompt('Escribe el nombre de la nueva categoría:');
    if (!nuevo) return;
    const val = String(nuevo).trim();
    if (!val) return;
    if (!tipoOptions.find(o => String(o.value).toLowerCase() === val.toLowerCase())) {
      setTipoOptions(prev => [...prev, { value: val, label: val }]);
    }
    setLocalData(prev => ({ ...prev, tipo: val }));
  };

  const handleAddEtiqueta = () => {
    const nueva = window.prompt('Escribe la nueva etiqueta:');
    if (!nueva) return;
    const val = String(nueva).trim();
    if (!val) return;
    if (!etiquetasOptions.find(o => String(o.value).toLowerCase() === val.toLowerCase())) {
      setEtiquetasOptions(prev => [...prev, { value: val, label: val }]);
    }
    // Agregar la nueva etiqueta a las etiquetas seleccionadas
    const etiquetasActuales = localData.etiquetas || [];
    if (!etiquetasActuales.includes(val)) {
      setLocalData(prev => ({ 
        ...prev, 
        etiquetas: [...etiquetasActuales, val] 
      }));
    }
  };

  const handleAddProcesoGeneral = async () => {
    const nombre = window.prompt('Escribe el nombre del nuevo proceso general:');
    if (!nombre) return;
    const codigo = window.prompt('Escribe el código del proceso general (opcional):');
    
    try {
      const res = await apiRequest('/procesos-generales', {
        method: 'POST',
        body: JSON.stringify({
          nombre: nombre.trim(),
          codigo: codigo ? codigo.trim() : null,
          descripcion: '',
          color: '#1F448B'
        })
      });
      
      if (res.success) {
        const nuevoProcesoGeneral = { value: res.data.id, label: res.data.nombre };
        setDireccionesOptions(prev => [...prev, nuevoProcesoGeneral]);
        setLocalData(prev => ({ ...prev, proceso_general_id: res.data.id, proceso_interno_id: '' }));
        alert('Proceso general creado exitosamente');
      } else {
        alert(res.message || 'Error al crear el proceso general');
      }
    } catch (e) {
      alert('Error al crear el proceso general: ' + e.message);
    }
  };

  const handleAddProcesoInterno = async () => {
    if (!localData?.proceso_general_id) {
      alert('Primero selecciona un proceso general');
      return;
    }
    
    const nombre = window.prompt('Escribe el nombre del nuevo proceso interno:');
    if (!nombre) return;
    const codigo = window.prompt('Escribe el código del proceso interno (opcional):');
    
    try {
      const res = await apiRequest('/procesos-internos', {
        method: 'POST',
        body: JSON.stringify({
          nombre: nombre.trim(),
          codigo: codigo ? codigo.trim() : null,
          descripcion: '',
          proceso_general_id: localData.proceso_general_id
        })
      });
      
      if (res.success) {
        const nuevoProceso = { value: res.data.id, label: res.data.nombre };
        setProcesosOptions(prev => [...prev, nuevoProceso]);
        setLocalData(prev => ({ ...prev, proceso_interno_id: res.data.id }));
        alert('Proceso interno creado exitosamente');
      } else {
        alert(res.message || 'Error al crear el proceso interno');
      }
    } catch (e) {
      alert('Error al crear el proceso interno: ' + e.message);
    }
  };

  const fields = [
    {
      title: 'Archivo y Título',
      icon: FileIcon,
      fields: [
        { 
          name: 'archivo', 
          label: 'Archivo', 
          type: 'file', 
          required: mode === 'create',
          accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt,.zip,.rar',
          helpText: mode === 'create' ? 'Selecciona el archivo a subir (PDF, Word, Excel, PowerPoint, imágenes, etc.)' : 'El archivo actual se mantendrá si no seleccionas uno nuevo'
        },
        { 
          name: 'titulo', 
          label: 'Título del Documento', 
          type: 'text', 
          required: true, 
          maxLength: 255,
          placeholder: 'Ingresa un título descriptivo para el documento'
        },
        { 
          name: 'descripcion', 
          label: 'Descripción', 
          type: 'textarea', 
          required: false, 
          maxLength: 500,
          placeholder: 'Describe brevemente el contenido y propósito del documento (opcional)',
          rows: 3
        }
      ]
    },
    {
      title: 'Clasificación Organizacional',
      icon: BuildingIcon,
      fields: [
        { 
          name: 'proceso_general_id', 
          label: 'Proceso General', 
          type: 'select', 
          required: true, 
          options: direccionesOptions, 
          placeholder: 'Selecciona el proceso general',
          hasAddButton: true,
          addButtonText: 'Agregar proceso general',
          onAddClick: handleAddProcesoGeneral
        },
        { 
          name: 'proceso_interno_id', 
          label: 'Proceso Interno', 
          type: 'select', 
          required: true, 
          options: procesosOptions, 
          disabled: !localData?.proceso_general_id,
          placeholder: 'Selecciona el proceso interno',
          hasAddButton: true,
          addButtonText: 'Agregar proceso interno',
          onAddClick: handleAddProcesoInterno
        },
        { 
          name: 'tipo', 
          label: 'Categoría (carpeta)', 
          type: 'select', 
          required: false, 
          options: tipoOptions, 
          placeholder: 'Selecciona la categoría del documento',
          hasAddButton: true,
          addButtonText: 'Agregar categoría',
          onAddClick: handleAddTipo
        }
      ]
    },
    {
      title: 'Seguridad',
      icon: LockIcon,
      fields: [
        { 
          name: 'confidencialidad', 
          label: 'Nivel de Confidencialidad', 
          type: 'select', 
          options: CONF_OPTS, 
          placeholder: 'Define quién puede acceder al documento',
          
        }
      ]
    },
    {
      title: 'Etiquetas y Categorización',
      icon: TagIcon,
      fields: [
        { 
          name: 'etiquetas', 
          label: 'Etiquetas', 
          type: 'multiselect', 
          options: etiquetasOptions,
          placeholder: 'Selecciona o crea etiquetas',
          hasAddButton: true,
          addButtonText: 'Crear etiqueta',
          onAddClick: handleAddEtiqueta
        }
      ]
    }
  ];

  const onInternalSubmit = async (data) => {
    if (onSubmit) await onSubmit(data);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {mode === 'create' ? 'Nuevo Documento' : 'Editar Documento'}
          </h2>
          <button onClick={onClose} title="Cerrar" className={styles.closeButton}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={styles.modalBody}>
          <CreateForm
            entityType="documento"
            fields={fields}
            initialData={localData}
            onSubmit={onInternalSubmit}
            onCancel={onClose}
            onChange={setLocalData}
            loading={loading}
            errors={errors}
            isModal={true}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentoModal; 
