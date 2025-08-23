import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { renderIcon } from '../../utils/iconMapping';
import documentStyles from '../../styles/components/Documentos.module.css';

const ICONOS_DISPONIBLES = [
  { value: 'chart-bar', label: 'Gráfico' },
  { value: 'office-building', label: 'Edificio' },
  { value: 'heart', label: 'Corazón' },
  { value: 'user-group', label: 'Grupo de Usuarios' },
  { value: 'clipboard-list', label: 'Lista' },
  { value: 'users', label: 'Usuarios' },
  { value: 'currency-dollar', label: 'Moneda' },
  { value: 'computer-desktop', label: 'Computadora' },
  { value: 'shield-check', label: 'Escudo' },
  { value: 'arrow-up', label: 'Crecimiento' },
  { value: 'process', label: 'Proceso' }
];

const TipoProcesoModal = ({ isOpen, onClose, onSuccess, editingTipo = null }) => {
  const { apiRequest } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    titulo: '',
    descripcion: '',
    icono: 'process',
    activo: true
  });
  const [errors, setErrors] = useState({});

  // Cargar datos del tipo cuando estamos editando
  useEffect(() => {
    if (editingTipo) {
      setFormData({
        nombre: editingTipo.nombre || '',
        titulo: editingTipo.titulo || '',
        descripcion: editingTipo.descripcion || '',
        icono: editingTipo.icono || 'process',
        activo: editingTipo.activo !== undefined ? editingTipo.activo : true
      });
    } else {
      setFormData({
        nombre: '',
        titulo: '',
        descripcion: '',
        icono: 'process',
        activo: true
      });
    }
    setErrors({});
  }, [editingTipo]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo
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
      const url = editingTipo 
        ? `/procesos-tipos/${editingTipo.id}` 
        : '/procesos-tipos';
      
      const method = editingTipo ? 'PUT' : 'POST';
      
      console.log('🔍 Enviando request a:', url);
      console.log('🔍 Método:', method);
      console.log('🔍 Datos:', formData);
      console.log('🔍 Token en localStorage:', localStorage.getItem('auth_token') ? 'Presente' : 'Ausente');
      
      const response = await apiRequest(url, {
        method,
        body: formData
      });

      console.log('🔍 Respuesta recibida:', response);

      if (response.success) {
        onSuccess(response.data);
      } else {
        setErrors(response.errors || {});
      }
    } catch (error) {
      console.error('Error al guardar tipo de proceso:', error);
      console.error('Error completo:', error.response?.data);
      setErrors({ general: 'Error al guardar el tipo de proceso' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={documentStyles.modalOverlay}>
      <div className={documentStyles.modalContent}>
        <div className={documentStyles.modalHeader}>
          <h2 className={documentStyles.modalTitle}>
            {editingTipo ? 'Editar Tipo de Proceso' : 'Nuevo Tipo de Proceso'}
          </h2>
          <button 
            title="Cerrar" 
            className={documentStyles.closeButton}
            onClick={onClose}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className={documentStyles.modalBody}>
          <form onSubmit={handleSubmit}>
            {/* Información Básica */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre (Clave)
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ej: estrategicos"
                    required
                  />
                  {errors.nombre && (
                    <p className="text-red-500 text-sm mt-1">{errors.nombre[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ej: Procesos Estratégicos"
                    required
                  />
                  {errors.titulo && (
                    <p className="text-red-500 text-sm mt-1">{errors.titulo[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descripción del tipo de proceso"
                    required
                  />
                  {errors.descripcion && (
                    <p className="text-red-500 text-sm mt-1">{errors.descripcion[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="icono" className="block text-sm font-medium text-gray-700 mb-2">
                    Icono
                  </label>
                  <div className="relative">
                    <select
                      id="icono"
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

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="activo"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                    Activo
                  </label>
                </div>
              </div>
            </div>

            {errors.general && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </div>
                ) : (
                  editingTipo ? 'Actualizar' : 'Crear'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TipoProcesoModal;
