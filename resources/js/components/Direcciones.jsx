import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { INTILED_COLORS } from '../config/colors';

const Direcciones = () => {
    const { user, apiRequest } = useAuth();
    const [direcciones, setDirecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDireccion, setSelectedDireccion] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' o 'edit'
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        codigo: '',
        color: '#1F448B'
    });

    useEffect(() => {
        fetchDirecciones();
    }, []);

    const fetchDirecciones = async () => {
        try {
            setLoading(true);
            const response = await apiRequest('/api/direcciones');
            if (response.success) {
                setDirecciones(response.data);
            }
        } catch (error) {
            console.error('Error al cargar direcciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                const response = await apiRequest('/api/direcciones', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
                if (response.success) {
                    setShowModal(false);
                    fetchDirecciones();
                    resetForm();
                }
            } else {
                const response = await apiRequest(`/api/direcciones/${selectedDireccion.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
                if (response.success) {
                    setShowModal(false);
                    fetchDirecciones();
                    resetForm();
                }
            }
        } catch (error) {
            console.error('Error al guardar dirección:', error);
        }
    };

    const handleEdit = (direccion) => {
        setSelectedDireccion(direccion);
        setFormData({
            nombre: direccion.nombre,
            descripcion: direccion.descripcion || '',
            codigo: direccion.codigo || '',
            color: direccion.color
        });
        setModalMode('edit');
        setShowModal(true);
    };

    const handleDelete = async (direccion) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar la dirección "${direccion.nombre}"?`)) {
            try {
                const response = await apiRequest(`/api/direcciones/${direccion.id}`, {
                    method: 'DELETE'
                });
                if (response.success) {
                    fetchDirecciones();
                }
            } catch (error) {
                console.error('Error al eliminar dirección:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            descripcion: '',
            codigo: '',
            color: '#1F448B'
        });
        setSelectedDireccion(null);
    };

    const openCreateModal = () => {
        setModalMode('create');
        resetForm();
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: INTILED_COLORS.azul }}></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 
                        className="text-3xl font-bold"
                        style={{ color: INTILED_COLORS.azul }}
                    >
                        Direcciones
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Gestiona las direcciones administrativas de la empresa
                    </p>
                </div>
                {user?.is_admin && (
                    <button
                        onClick={openCreateModal}
                        className="px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                        style={{ 
                            backgroundColor: INTILED_COLORS.verde,
                            color: 'white'
                        }}
                    >
                        + Nueva Dirección
                    </button>
                )}
            </div>

            {/* Grid de Direcciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {direcciones.map((direccion) => (
                    <div 
                        key={direccion.id}
                        className="p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200"
                        style={{ backgroundColor: INTILED_COLORS.white }}
                    >
                        {/* Header de la tarjeta */}
                        <div className="flex items-center justify-between mb-4">
                            <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: direccion.color }}
                            />
                            {user?.is_admin && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(direccion)}
                                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                                        style={{ color: INTILED_COLORS.azul }}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(direccion)}
                                        className="p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                                        style={{ color: INTILED_COLORS.naranja }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Contenido */}
                        <h3 
                            className="text-xl font-bold mb-2"
                            style={{ color: INTILED_COLORS.azul }}
                        >
                            {direccion.nombre}
                        </h3>
                        
                        {direccion.codigo && (
                            <p className="text-sm text-gray-500 mb-2">
                                Código: {direccion.codigo}
                            </p>
                        )}
                        
                        {direccion.descripcion && (
                            <p className="text-gray-600 mb-4 line-clamp-2">
                                {direccion.descripcion}
                            </p>
                        )}

                        {/* Estadísticas */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                            <div className="text-center">
                                <p className="text-2xl font-bold" style={{ color: direccion.color }}>
                                    {direccion.estadisticas?.total_procesos || 0}
                                </p>
                                <p className="text-xs text-gray-500">Procesos</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold" style={{ color: direccion.color }}>
                                    {direccion.estadisticas?.total_documentos || 0}
                                </p>
                                <p className="text-xs text-gray-500">Documentos</p>
                            </div>
                        </div>

                        {/* Botón Ver Detalles */}
                        <button
                            onClick={() => setSelectedDireccion(direccion)}
                            className="w-full mt-4 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                            style={{ 
                                backgroundColor: direccion.color,
                                color: 'white'
                            }}
                        >
                            Ver Detalles
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal para Crear/Editar */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                        <h2 
                            className="text-2xl font-bold mb-4"
                            style={{ color: INTILED_COLORS.azul }}
                        >
                            {modalMode === 'create' ? 'Nueva Dirección' : 'Editar Dirección'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Código
                                </label>
                                <input
                                    type="text"
                                    value={formData.codigo}
                                    onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción
                                </label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Color
                                </label>
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                                    className="w-full h-10 border border-gray-300 rounded-lg"
                                />
                            </div>
                            
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                                    style={{ 
                                        backgroundColor: INTILED_COLORS.verde,
                                        color: 'white'
                                    }}
                                >
                                    {modalMode === 'create' ? 'Crear' : 'Actualizar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Detalles */}
            {selectedDireccion && !showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-4">
                            <h2 
                                className="text-2xl font-bold"
                                style={{ color: INTILED_COLORS.azul }}
                            >
                                {selectedDireccion.nombre}
                            </h2>
                            <button
                                onClick={() => setSelectedDireccion(null)}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {selectedDireccion.codigo && (
                                <div>
                                    <h3 className="font-medium text-gray-700">Código:</h3>
                                    <p className="text-gray-900">{selectedDireccion.codigo}</p>
                                </div>
                            )}
                            
                            {selectedDireccion.descripcion && (
                                <div>
                                    <h3 className="font-medium text-gray-700">Descripción:</h3>
                                    <p className="text-gray-900">{selectedDireccion.descripcion}</p>
                                </div>
                            )}
                            
                            <div>
                                <h3 className="font-medium text-gray-700 mb-2">Estadísticas:</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg border border-gray-200 text-center">
                                        <p className="text-2xl font-bold" style={{ color: selectedDireccion.color }}>
                                            {selectedDireccion.estadisticas?.total_procesos || 0}
                                        </p>
                                        <p className="text-sm text-gray-500">Procesos de Apoyo</p>
                                    </div>
                                    <div className="p-4 rounded-lg border border-gray-200 text-center">
                                        <p className="text-2xl font-bold" style={{ color: selectedDireccion.color }}>
                                            {selectedDireccion.estadisticas?.total_documentos || 0}
                                        </p>
                                        <p className="text-sm text-gray-500">Documentos</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Direcciones; 