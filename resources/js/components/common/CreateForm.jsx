import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DocumentIcon, PlusIcon } from '../icons/CrudIcons';
import styles from '../../styles/components/CreateForm.module.css';

// Form builder profesional con estética similar a NewsForm.jsx
const CreateForm = ({
  entityType = 'documento',
  title,
  subtitle,
  fields = [],
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  errors = {},
  onChange,
  isModal = false,
  headerIcon: HeaderIcon = DocumentIcon
}) => {
  const [formData, setFormData] = useState(initialData || {});
  const fileInputRefs = useRef({});

  // Sincronizar formData con initialData cuando cambie
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(initialData);
      console.log('📁 [CreateForm] initialData actualizado:', initialData);
    }
  }, [initialData]);

  const handleChange = (name, value) => {
    console.log(`📁 [CreateForm] handleChange llamado para ${name}:`, value, {
      type: typeof value,
      isFile: value instanceof File,
      isNull: value === null,
      isUndefined: value === undefined
    });
    
    const next = { ...formData, [name]: value };
    setFormData(next);
    onChange && onChange(next);
  };
  const renderField = (field) => {
    const {
      name,
      label,
      type = 'text',
      placeholder,
      options = [],
      multiple,
      rows = 3,
      required,
      accept,
      hasAddButton,
      addButtonText,
      onAddClick,
      disabled = false
    } = field;
    const value = formData[name] ?? (multiple ? [] : '');
    const inputProps = {
      id: name,
      name,
      placeholder: placeholder || '',
      required: !!required,
      onChange: (e) => handleChange(name, e.target.value),
      value,
      disabled
    };
    if (type === 'textarea') {
      return (
        <div key={name} className={styles.field}>
          <label htmlFor={name} className={styles.label}>{label}</label>
          <textarea
            {...inputProps}
            rows={rows}
            className={styles.textarea}
          />
          {errors[name] && <div className={styles.error}>{errors[name]}</div>}
        </div>
      );
    }
    if (type === 'select') {
      return (
        <div key={name} className={styles.field}>
          <label htmlFor={name} className={styles.label}>{label}</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <select
              id={name}
              name={name}
              value={value || ''}
              onChange={(e) => handleChange(name,
                multiple ? Array.from(e.target.selectedOptions).map(o => o.value) : e.target.value
              )}
              multiple={!!multiple}
              disabled={disabled}
              className={styles.select}
            >
              {(!multiple) && <option value="">Seleccionar…</option>}
              {options.map(opt => (
                <option key={String(opt.value)} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {hasAddButton && (
              <button
                type="button"
                onClick={onAddClick}
                className={styles.addButton}
              >
                {addButtonText || 'Agregar'}
              </button>
            )}
          </div>
          {errors[name] && <div className={styles.error}>{errors[name]}</div>}
        </div>
      );
    }
    if (type === 'file') {
      return (
        <div key={name} className={styles.field}>
          <label htmlFor={name} className={styles.label}>{label}</label>
          <div className={styles.filePicker}>
            <input
              ref={(el) => fileInputRefs.current[name] = el}
              id={name}
              name={name}
              type="file"
              accept={accept}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                console.log(`📁 [CreateForm] Campo archivo ${name} onChange:`, {
                  file: file,
                  isFile: file instanceof File,
                  fileName: file?.name,
                  fileSize: file?.size,
                  fileType: file?.type
                });
                handleChange(name, file);
              }}
              className={styles.fileInput}
            />
            <button
              type="button"
              onClick={() => fileInputRefs.current[name]?.click()}
              className={styles.browseBtn}
            >
              <PlusIcon className={styles.browseIcon} />
              Seleccionar archivo
            </button>
            {formData[name] && (
              <span className={styles.fileName}>
                {formData[name].name || formData[name]}
              </span>
            )}
          </div>
          {errors[name] && <div className={styles.error}>{errors[name]}</div>}
        </div>
      );
    }
    if (type === 'checkbox') {
      return (
        <div key={name} className={styles.field}>
          <label className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id={name}
              name={name}
              checked={Boolean(value)}
              onChange={(e) => handleChange(name, e.target.checked)}
              className={styles.checkbox}
            />
            <span className={styles.checkboxLabel}>{label}</span>
          </label>
          {errors[name] && <div className={styles.error}>{errors[name]}</div>}
        </div>
      );
    }
    return (
      <div key={name} className={styles.field}>
        <label htmlFor={name} className={styles.label}>{label}</label>
        <input {...inputProps} type={type} className={styles.input} />
        {errors[name] && <div className={styles.error}>{errors[name]}</div>}
      </div>
    );
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('📁 [CreateForm] handleSubmit llamado');
    console.log('📁 [CreateForm] formData actual:', formData);
    console.log('📁 [CreateForm] initialData:', initialData);
    console.log('📁 [CreateForm] fields:', fields);
    
    // Verificar si hay campos de archivo en el formulario
    const hasFileFields = fields.some(section => {
      const sectionHasFileFields = section.fields.some(field => {
        if (field.type === 'file') {
          console.log(`🔍 [CreateForm] Campo de archivo encontrado: ${field.name}`);
          return true;
        }
        return false;
      });
      console.log(`🔍 [CreateForm] Sección ${section.title} tiene campos de archivo:`, sectionHasFileFields);
      return sectionHasFileFields;
    });
    console.log('📁 [CreateForm] ¿Tiene campos de archivo?', hasFileFields);
    console.log('📁 [CreateForm] formData completo:', formData);
    console.log('📁 [CreateForm] Campos de archivo en formData:', Object.keys(formData).filter(key => formData[key] instanceof File));
    
    if (hasFileFields) {
      // Crear FormData para archivos
      const formDataToSend = new FormData();
      console.log('📁 [CreateForm] Creando FormData con archivos...');
      
      // Agregar todos los campos al FormData
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        console.log(`📁 [CreateForm] Agregando campo ${key}:`, value, {
          type: typeof value,
          isFile: value instanceof File,
          isNull: value === null,
          isUndefined: value === undefined,
          isEmpty: value === ''
        });
        
        // Buscar si el campo es requerido
        const isRequired = fields.some(section => 
          section.fields.some(field => field.name === key && field.required)
        );
        
        // Agregar el campo si tiene valor O si es requerido (para validación)
        if (value !== null && value !== undefined && (value !== '' || isRequired)) {
          if (value instanceof File) {
            formDataToSend.append(key, value);
            console.log(`✅ [CreateForm] Archivo agregado: ${key} = ${value.name}`);
          } else if (Array.isArray(value)) {
            value.forEach(item => formDataToSend.append(key, item));
            console.log(`✅ [CreateForm] Array agregado: ${key} = ${value.length} items`);
          } else {
            formDataToSend.append(key, value || ''); // Asegurar que nunca sea null/undefined
            console.log(`✅ [CreateForm] Campo agregado: ${key} = ${value || ''}`);
          }
        } else {
          console.log(`❌ [CreateForm] Campo omitido: ${key} (valor: ${value}, requerido: ${isRequired})`);
        }
      });
      
      // Agregar ID si está disponible en initialData (modo edición)
      if (initialData && initialData.id) {
        formDataToSend.append('id', initialData.id);
        console.log(`✅ [CreateForm] ID agregado para edición: ${initialData.id}`);
      }
      
      // Log del FormData creado
      console.log('📁 [CreateForm] FormData creado, verificando contenido:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`📁 [CreateForm] FormData[${key}] =`, value);
      }
      
      console.log('📁 [CreateForm] Enviando FormData con archivos:', formDataToSend);
      onSubmit && onSubmit(formDataToSend);
    } else {
      // Enviar datos normales sin archivos
      console.log('📋 [CreateForm] Enviando datos normales:', formData);
      onSubmit && onSubmit(formData);
    }
  };
  return (
    <section className={styles.container}>
      {(title || subtitle) && (
        <header className={styles.header}>
          <HeaderIcon className={styles.headerIcon} />
          <div>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        </header>
      )}
      <form className={styles.form} onSubmit={handleSubmit}>
        {fields.map(section => (
          <section key={section.title} className={styles.section}>
            {section.title && (
              <div className={styles.sectionTitle}>
                {section.icon && <section.icon className={styles.sectionIcon} />}
                {section.title}
              </div>
            )}
            <div className={section.fields.length > 1 ? styles.row : ''}>
              {section.fields.map(renderField)}
            </div>
          </section>
        ))}
        {errors.general && <div className={styles.generalError}>{errors.general}</div>}
        <div className={styles.actions}>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
          {onCancel && (
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>
  );
};
CreateForm.propTypes = {
  entityType: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  fields: PropTypes.array,
  initialData: PropTypes.object,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  loading: PropTypes.bool,
  errors: PropTypes.object,
  onChange: PropTypes.func,
  isModal: PropTypes.bool,
  headerIcon: PropTypes.elementType,
};
export default CreateForm;