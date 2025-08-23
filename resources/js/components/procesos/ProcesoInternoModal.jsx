import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createPortal } from 'react-dom';
import styles from '../../styles/components/Administracion.module.css';

const ProcesoInternoModal = ({ isOpen, onClose, onSuccess, editingProceso = null }) => {
  const { apiRequest } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    titulo: '',
    descripcion: '',
    icono: 'document-text',
    activo: true,
    orden: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingProceso) {
      setFormData({
        nombre: editingProceso.nombre || '',
        titulo: editingProceso.titulo || '',
        descripcion: editingProceso.descripcion || '',
        icono: editingProceso.icono || 'document-text',
        activo: editingProceso.activo !== undefined ? editingProceso.activo : true,
        orden: editingProceso.orden || 0
      });
    } else {
      setFormData({
        nombre: '',
        titulo: '',
        descripcion: '',
        icono: 'document-text',
        activo: true,
        orden: 0
      });
    }
    setError('');
  }, [editingProceso, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = editingProceso 
        ? `/procesos-internos/${editingProceso.id}`
        : '/procesos-internos';
      
      const method = editingProceso ? 'PUT' : 'POST';
      
      console.log('📋 [ProcesoInternoModal] Enviando datos:', {
        url,
        method,
        formData
      });

      const response = await apiRequest(url, {
        method,
        data: formData
      });

      if (response.success) {
        console.log('✅ [ProcesoInternoModal] Proceso interno guardado exitosamente:', response.data);
        onSuccess(response.data);
      } else {
        console.error('❌ [ProcesoInternoModal] Error en respuesta:', response);
        setError(response.message || 'Error al guardar el proceso interno');
      }
    } catch (error) {
      console.error('❌ [ProcesoInternoModal] Error completo:', error);
      setError('Error al guardar el proceso interno');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {editingProceso ? 'Editar Proceso Interno' : 'Crear Nuevo Proceso Interno'}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="nombre" className={styles.formLabel}>
              Nombre (identificador único)
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className={styles.formInput}
              placeholder="ej: gestion-documental"
              required
            />
            <small className={styles.formHint}>
              Usar solo letras minúsculas, números y guiones
            </small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="titulo" className={styles.formLabel}>
              Título
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              className={styles.formInput}
              placeholder="ej: Gestión Documental"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="descripcion" className={styles.formLabel}>
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              className={styles.formTextarea}
              placeholder="Descripción del proceso interno..."
              rows="3"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="icono" className={styles.formLabel}>
              Icono
            </label>
            <select
              id="icono"
              name="icono"
              value={formData.icono}
              onChange={handleInputChange}
              className={styles.formSelect}
            >
              <option value="document-text">📄 Documento</option>
              <option value="clipboard-list">📋 Lista</option>
              <option value="book-open">📖 Manual</option>
              <option value="academic-cap">🎓 Académico</option>
              <option value="cog">⚙️ Configuración</option>
              <option value="chart-bar">📊 Gráfico</option>
              <option value="user-group">👥 Usuarios</option>
              <option value="shield-check">🛡️ Seguridad</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="orden" className={styles.formLabel}>
              Orden
            </label>
            <input
              type="number"
              id="orden"
              name="orden"
              value={formData.orden}
              onChange={handleInputChange}
              className={styles.formInput}
              min="0"
              placeholder="0"
            />
            <small className={styles.formHint}>
              Número para ordenar los procesos (0 = primero)
            </small>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleInputChange}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>Proceso activo</span>
            </label>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                editingProceso ? 'Actualizar Proceso' : 'Crear Proceso'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ProcesoInternoModal;
