import React, { useEffect, useState } from 'react';
import CreateForm from '../crud/CreateForm';
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
  const [localData, setLocalData] = useState(formData || {});

  useEffect(() => {
    if (!show) return;
    (async () => {
      try {
        const d = await apiRequest('/direcciones');
        if (d.success) setDireccionesOptions(d.data.map(x => ({ value: x.id, label: x.nombre })));
        const dirId = (formData && formData.direccion_id) || localData?.direccion_id;
        if (dirId) {
          const p = await apiRequest(`/direcciones/${dirId}/procesos-apoyo`);
          if (p.success) {
            setProcesosOptions((p.data || []).map(x => ({ value: x.id, label: x.nombre })));
          } else {
            setProcesosOptions([]);
          }
        } else {
          setProcesosOptions([]);
        }
      } catch {}
    })();
  }, [show, apiRequest]);

  // Cargar procesos cuando cambia la dirección seleccionada
  useEffect(() => {
    if (!show) return;
    const dirId = localData?.direccion_id;
    if (!dirId) {
      setProcesosOptions([]);
      return;
    }
    (async () => {
      try {
        const p = await apiRequest(`/direcciones/${dirId}/procesos-apoyo`);
        if (p.success) {
          setProcesosOptions((p.data || []).map(x => ({ value: x.id, label: x.nombre })));
          setLocalData(prev => ({ ...prev, proceso_apoyo_id: '' }));
        } else {
          setProcesosOptions([]);
        }
      } catch {
        setProcesosOptions([]);
      }
    })();
  }, [localData?.direccion_id, show, apiRequest]);

  if (!show) return null;

  const handleAddTipo = () => {
    const nuevo = window.prompt('Escribe el nuevo tipo de documento:');
    if (!nuevo) return;
    const val = String(nuevo).trim();
    if (!val) return;
    if (!tipoOptions.find(o => String(o.value).toLowerCase() === val.toLowerCase())) {
      setTipoOptions(prev => [...prev, { value: val, label: val }]);
    }
    setLocalData(prev => ({ ...prev, tipo: val }));
  };

  const handleAddDireccion = async () => {
    const nombre = window.prompt('Escribe el nombre de la nueva dirección:');
    if (!nombre) return;
    const codigo = window.prompt('Escribe el código de la dirección (opcional):');
    
    try {
      const res = await apiRequest('/direcciones', {
        method: 'POST',
        body: JSON.stringify({
          nombre: nombre.trim(),
          codigo: codigo ? codigo.trim() : null,
          descripcion: '',
          color: '#1F448B'
        })
      });
      
      if (res.success) {
        const nuevaDireccion = { value: res.data.id, label: res.data.nombre };
        setDireccionesOptions(prev => [...prev, nuevaDireccion]);
        setLocalData(prev => ({ ...prev, direccion_id: res.data.id, proceso_apoyo_id: '' }));
        alert('Dirección creada exitosamente');
      } else {
        alert(res.message || 'Error al crear la dirección');
      }
    } catch (e) {
      alert('Error al crear la dirección: ' + e.message);
    }
  };

  const handleAddProceso = async () => {
    if (!localData?.direccion_id) {
      alert('Primero selecciona una dirección');
      return;
    }
    
    const nombre = window.prompt('Escribe el nombre del nuevo proceso de apoyo:');
    if (!nombre) return;
    const codigo = window.prompt('Escribe el código del proceso (opcional):');
    
    try {
      const res = await apiRequest('/procesos-apoyo', {
        method: 'POST',
        body: JSON.stringify({
          nombre: nombre.trim(),
          codigo: codigo ? codigo.trim() : null,
          descripcion: '',
          direccion_id: localData.direccion_id
        })
      });
      
      if (res.success) {
        const nuevoProceso = { value: res.data.id, label: res.data.nombre };
        setProcesosOptions(prev => [...prev, nuevoProceso]);
        setLocalData(prev => ({ ...prev, proceso_apoyo_id: res.data.id }));
        alert('Proceso de apoyo creado exitosamente');
      } else {
        alert(res.message || 'Error al crear el proceso de apoyo');
      }
    } catch (e) {
      alert('Error al crear el proceso de apoyo: ' + e.message);
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
          name: 'direccion_id', 
          label: 'Dirección', 
          type: 'select', 
          required: true, 
          options: direccionesOptions, 
          placeholder: 'Selecciona la dirección responsable',
          hasAddButton: true,
          addButtonText: 'Agregar dirección',
          onAddClick: handleAddDireccion
        },
        { 
          name: 'proceso_apoyo_id', 
          label: 'Proceso de Apoyo', 
          type: 'select', 
          required: true, 
          options: procesosOptions, 
          disabled: !localData?.direccion_id,
          placeholder: 'Selecciona el proceso relacionado',
          hasAddButton: true,
          addButtonText: 'Agregar proceso',
          onAddClick: handleAddProceso
        },
        { 
          name: 'tipo', 
          label: 'Tipo de Documento', 
          type: 'select', 
          required: false, 
          options: tipoOptions, 
          placeholder: 'Selecciona la categoría del documento',
          hasAddButton: true,
          addButtonText: 'Agregar tipo',
          onAddClick: handleAddTipo
        }
      ]
    },
    {
      title: 'Metadatos y Seguridad',
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
          type: 'tags', 
          placeholder: 'Ej: proyecto tumaco, fotografía, 2025'
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
