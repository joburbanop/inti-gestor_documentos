import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CloseIcon, SaveIcon } from '../icons/CrudIcons';
import { renderIcon } from '../../utils/iconMapping';
import styles from '../../styles/components/Documentos.module.css';

const ICONOS_DISPONIBLES = [
  { value: 'chart-bar', label: 'Gráficos' },
  { value: 'office-building', label: 'Edificio' },
  { value: 'users', label: 'Usuarios' },
  { value: 'heart', label: 'Corazón' },
  { value: 'clipboard-list', label: 'Lista' },
  { value: 'currency-dollar', label: 'Dinero' },
  { value: 'computer-desktop', label: 'Computadora' },
  { value: 'shield-check', label: 'Escudo' },
  { value: 'arrow-up', label: 'Crecimiento' },
  { value: 'process', label: 'Proceso' }
];

const ProcesoModal = ({ isOpen, onClose, onSuccess, editingProceso = null, selectedTipoProceso = null }) => {
  const { apiRequest } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tiposProcesos, setTiposProcesos] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    icono: 'process',
    tipo_proceso_id: ''
  });
  const [errors, setErrors] = useState({});

  // Cargar tipos de procesos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadTiposProcesos();
    }
  }, [isOpen]);

  // Cargar datos del proceso cuando estamos editando o pre-seleccionar tipo
  useEffect(() => {
    if (editingProceso) {
      setFormData({
        nombre: editingProceso.nombre || '',
        descripcion: editingProceso.descripcion || '',
        icono: editingProceso.icono || 'process',
        tipo_proceso_id: editingProceso.tipo_proceso?.id || ''
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        icono: 'process',
        tipo_proceso_id: selectedTipoProceso?.id || ''
      });
    }
  }, [editingProceso, selectedTipoProceso]);

  const loadTiposProcesos = async () => {
    try {
      const response = await apiRequest('/procesos-generales/tipos/disponibles');
      if (response.success) {
        setTiposProcesos(response.data || []);
      }
    } catch (error) {
      console.error('Error al cargar tipos de procesos:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const isEditing = !!editingProceso;
      const url = isEditing ? `/procesos-generales/${editingProceso.id}` : '/procesos-generales';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await apiRequest(url, {
        method,
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.success) {
        // Resetear formulario
        setFormData({
          nombre: '',
          descripcion: '',
          icono: 'process',
          tipo_proceso_id: ''
        });
        
        onSuccess?.(response.data);
        onClose();
      } else {
        if (response.errors) {
          setErrors(response.errors);
        } else {
          setErrors({ general: response.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el proceso` });
        }
      }
    } catch (error) {
      console.error(`Error al ${editingProceso ? 'actualizar' : 'crear'} proceso:`, error);
      setErrors({ general: `Error de conexión al ${editingProceso ? 'actualizar' : 'crear'} el proceso` });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        nombre: '',
        descripcion: '',
        icono: 'process',
        tipo_proceso_id: ''
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {editingProceso ? 'Editar Proceso General' : 'Crear Nuevo Proceso General'}
          </h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className={styles.closeButton}
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error general */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {errors.general}
              </div>
            )}

            {/* Tipo de Proceso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Proceso *
              </label>
              <select
                name="tipo_proceso_id"
                value={formData.tipo_proceso_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar tipo de proceso</option>
                {tiposProcesos.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.titulo} - {tipo.descripcion}
                  </option>
                ))}
              </select>
              {errors.tipo_proceso_id && (
                <p className="text-red-500 text-sm mt-1">{errors.tipo_proceso_id[0]}</p>
              )}
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Proceso *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                placeholder="Ej: Gestión de Recursos Humanos"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm mt-1">{errors.nombre[0]}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows={3}
                placeholder="Descripción del proceso general..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.descripcion && (
                <p className="text-red-500 text-sm mt-1">{errors.descripcion[0]}</p>
              )}
            </div>

            {/* Icono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icono
              </label>
              <div className="relative">
                <select
                  name="icono"
                  value={formData.icono}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-10"
                >
                  {ICONOS_DISPONIBLES.map(icono => (
                    <option key={icono.value} value={icono.value}>
                      {icono.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <div className="w-5 h-5">
                    {renderIcon(formData.icono, "w-5 h-5")}
                  </div>
                </div>
              </div>
              {errors.icono && (
                <p className="text-red-500 text-sm mt-1">{errors.icono[0]}</p>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.nombre || !formData.tipo_proceso_id}
            className={`${styles.createButton} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {editingProceso ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              <>
                <SaveIcon className="w-4 h-4 mr-2" />
                {editingProceso ? 'Actualizar Proceso' : 'Crear Proceso'}
              </>
            )}
          </button>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
            <p>{editingProceso ? 'Actualizando proceso general...' : 'Creando proceso general...'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcesoModal;
