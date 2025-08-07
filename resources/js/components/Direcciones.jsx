import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/components/Direcciones.module.css';

// Componentes modulares
import DireccionCard from './direcciones/DireccionCard';
import DireccionModal from './direcciones/DireccionModal';
import DireccionDetailsModal from './direcciones/DireccionDetailsModal';

// Iconos SVG
import { BuildingIcon, PlusIcon } from './icons/DireccionesIcons';

const Direcciones = () => {
    const { user, apiRequest } = useAuth();
    const navigate = useNavigate();
    const [direcciones, setDirecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDireccion, setSelectedDireccion] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('edit');
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        codigo: '',
        color: '#1F448B'
    });

    useEffect(() => {
        fetchDirecciones();
        
        // Verificar si hay mensaje de éxito en la URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success') === 'created') {
            setSuccessMessage('¡Dirección creada exitosamente!');
            // Limpiar el parámetro de la URL
            window.history.replaceState({}, document.title, window.location.pathname + window.location.hash.split('?')[0]);
            // Ocultar el mensaje después de 5 segundos
            setTimeout(() => setSuccessMessage(''), 5000);
        }
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
            const response = await apiRequest(`/api/direcciones/${selectedDireccion.id}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            if (response.success) {
                setShowModal(false);
                fetchDirecciones();
                resetForm();
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

    const handleViewDetails = (direccion) => {
        setSelectedDireccion(direccion);
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            descripcion: '',
            codigo: '',
            color: '#1F448B'
        });
    };

    const openCreatePage = () => {
        navigate('/direcciones/crear');
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const closeDetailsModal = () => {
        setSelectedDireccion(null);
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p className="text-gray-600 text-lg font-medium mt-4">
                    Cargando direcciones...
                </p>
            </div>
        );
    }

    return (
        <div className={styles.direccionesContainer}>
            {/* Mensaje de éxito */}
            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">
                                {successMessage}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1>
                        <BuildingIcon className="w-8 h-8 inline mr-3" />
                        Direcciones
                    </h1>
                    <p>
                        Gestiona las direcciones administrativas de la empresa
                    </p>
                </div>
                {user?.is_admin && (
                    <button
                        onClick={openCreatePage}
                        className={styles.newButton}
                        title="Crear nueva dirección"
                    >
                        <PlusIcon />
                        Nueva Dirección
                    </button>
                )}
            </div>

            {/* Grid de Direcciones */}
            <div className={styles.direccionesGrid}>
                {direcciones.map((direccion) => (
                    <DireccionCard
                        key={direccion.id}
                        direccion={direccion}
                        user={user}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onViewDetails={handleViewDetails}
                    />
                ))}
            </div>

            {/* Estado vacío */}
            {direcciones.length === 0 && !loading && (
                <div className="text-center py-12">
                    <BuildingIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No hay direcciones registradas
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Comienza creando la primera dirección administrativa
                    </p>
                    {user?.is_admin && (
                        <button
                            onClick={openCreatePage}
                            className={styles.newButton}
                        >
                            <PlusIcon />
                            Crear Primera Dirección
                        </button>
                    )}
                </div>
            )}

            {/* Modal para Editar */}
            <DireccionModal
                show={showModal}
                mode={modalMode}
                formData={formData}
                onClose={closeModal}
                onSubmit={handleSubmit}
                onChange={setFormData}
            />

            {/* Modal de Detalles */}
            <DireccionDetailsModal
                direccion={selectedDireccion}
                onClose={closeDetailsModal}
            />
        </div>
    );
};

export default Direcciones; 