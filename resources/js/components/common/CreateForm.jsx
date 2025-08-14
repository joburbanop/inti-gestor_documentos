import React, { useState } from 'react';
import PropTypes from 'prop-types';

// Form builder básico reusable (movido desde crud/CreateForm)
const CreateForm = ({ entityType = 'documento', title, subtitle, fields = [], initialData = {}, onSubmit, onCancel, loading = false, errors = {}, onChange, isModal = false }) => {
  const [formData, setFormData] = useState(initialData || {});

  const handleChange = (name, value) => {
    const next = { ...formData, [name]: value };
    setFormData(next);
    onChange && onChange(next);
  };

  const renderField = (field) => {
    const { name, label, type = 'text', placeholder, options = [], multiple, rows = 3, required, accept, hasAddButton, addButtonText, onAddClick } = field;
    const value = formData[name] ?? (multiple ? [] : '');

    const inputProps = {
      id: name,
      name,
      placeholder: placeholder || '',
      required: !!required,
      onChange: (e) => handleChange(name, e.target.value),
      value,
    };

    if (type === 'textarea') {
      return (
        <div key={name} style={{ marginBottom: '1rem' }}>
          <label htmlFor={name} style={{ display: 'block', fontWeight: 600 }}>{label}</label>
          <textarea {...inputProps} rows={rows} />
          {errors[name] && <div style={{ color: 'red' }}>{errors[name]}</div>}
        </div>
      );
    }

    if (type === 'select') {
      return (
        <div key={name} style={{ marginBottom: '1rem' }}>
          <label htmlFor={name} style={{ display: 'block', fontWeight: 600 }}>{label}</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              id={name}
              name={name}
              value={value || ''}
              onChange={(e) => handleChange(name, multiple ? Array.from(e.target.selectedOptions).map(o => o.value) : e.target.value)}
              multiple={!!multiple}
            >
              {(!multiple) && <option value="">Seleccionar…</option>}
              {options.map(opt => (
                <option key={String(opt.value)} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {hasAddButton && (
              <button type="button" onClick={onAddClick}>{addButtonText || 'Agregar'}</button>
            )}
          </div>
          {errors[name] && <div style={{ color: 'red' }}>{errors[name]}</div>}
        </div>
      );
    }

    if (type === 'file') {
      return (
        <div key={name} style={{ marginBottom: '1rem' }}>
          <label htmlFor={name} style={{ display: 'block', fontWeight: 600 }}>{label}</label>
          <input id={name} name={name} type="file" accept={accept} onChange={(e) => handleChange(name, e.target.files?.[0] || null)} />
          {errors[name] && <div style={{ color: 'red' }}>{errors[name]}</div>}
        </div>
      );
    }

    return (
      <div key={name} style={{ marginBottom: '1rem' }}>
        <label htmlFor={name} style={{ display: 'block', fontWeight: 600 }}>{label}</label>
        <input {...inputProps} type={type} />
        {errors[name] && <div style={{ color: 'red' }}>{errors[name]}</div>}
      </div>
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {(title || subtitle) && (
        <header style={{ marginBottom: '1rem' }}>
          {title && <h2 style={{ margin: 0 }}>{title}</h2>}
          {subtitle && <p style={{ margin: 0, color: '#64748b' }}>{subtitle}</p>}
        </header>
      )}

      {fields.map(section => (
        <section key={section.title} style={{ marginBottom: '1rem' }}>
          {section.title && (
            <div style={{ marginBottom: '0.5rem', fontWeight: 700 }}>{section.title}</div>
          )}
          <div>
            {section.fields.map(renderField)}
          </div>
        </section>
      ))}

      {errors.general && <div style={{ color: 'red', marginBottom: '0.5rem' }}>{errors.general}</div>}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="submit" disabled={loading}>{loading ? 'Guardando…' : 'Guardar'}</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancelar</button>}
      </div>
    </form>
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
};

export default CreateForm;
