import React, { useEffect, useState } from 'react';
import CreateForm from '../crud/CreateForm';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/components/Documentos.module.css';

const TIPO_OPTIONS = [
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
  { value: 'Publico', label: 'Público' },
  { value: 'Interno', label: 'Interno' },
  { value: 'Restringido', label: 'Restringido' }
];

const DocumentoModal = ({ show, mode, formData, onClose, onSubmit, onChange, loading = false, errors = {} }) => {
  const { apiRequest } = useAuth();
  const [direccionesOptions, setDireccionesOptions] = useState([]);
  const [procesosOptions, setProcesosOptions] = useState([]);

  useEffect(() => {
    if (!show) return;
    (async () => {
      try {
        const d = await apiRequest('/api/direcciones');
        if (d.success) setDireccionesOptions(d.data.map(x => ({ value: x.id, label: x.nombre })));
        const p = await apiRequest('/api/procesos-apoyo');
        if (p.success) setProcesosOptions(p.data.map(x => ({ value: x.id, label: x.nombre })));
      } catch {}
    })();
  }, [show, apiRequest]);

  if (!show) return null;

  const fields = [
    {
      title: 'Archivo y Título',
      fields: [
        { name: 'archivo', label: 'Archivo', type: 'file', required: mode === 'create' },
        { name: 'titulo', label: 'Título', type: 'text', required: true, maxLength: 255 },
        { name: 'descripcion', label: 'Descripción', type: 'textarea', required: false, maxLength: 500 }
      ]
    },
    {
      title: 'Clasificación',
      fields: [
        { name: 'direccion_id', label: 'Dirección', type: 'select', required: true, options: direccionesOptions, placeholder: 'Selecciona la dirección' },
        { name: 'proceso_apoyo_id', label: 'Proceso', type: 'select', required: true, options: procesosOptions, placeholder: 'Selecciona el proceso' },
        { name: 'tipo', label: 'Tipo de documento', type: 'select', required: false, options: TIPO_OPTIONS, placeholder: 'Selecciona el tipo' }
      ]
    },
    {
      title: 'Metadatos',
      fields: [
        { name: 'confidencialidad', label: 'Confidencialidad', type: 'select', options: CONF_OPTS, placeholder: 'Selecciona confidencialidad' }
      ]
    },
    {
      title: 'Etiquetas',
      fields: [
        { name: 'etiquetas_texto', label: 'Etiquetas (separadas por coma)', type: 'text', placeholder: 'Ej: proyecto tumaco, fotografia, 2025' },
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
            initialData={formData}
            onSubmit={onInternalSubmit}
            onCancel={onClose}
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

