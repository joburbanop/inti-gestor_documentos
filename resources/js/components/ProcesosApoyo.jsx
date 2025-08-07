import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/components/ProcesosApoyo.module.css';
import ProcesoApoyoCard from './procesos-apoyo/ProcesoApoyoCard';
import ProcesoApoyoModal from './procesos-apoyo/ProcesoApoyoModal';
import ConfirmModal from './common/ConfirmModal';
import useConfirmModal from '../hooks/useConfirmModal';
import { WarningIcon } from './icons/ModalIcons';

const ProcesosApoyo = () => {
    const { apiRequest } = useAuth();
    const [procesosApoyo, setProcesosApoyo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [selectedProceso, setSelectedProceso] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('edit');
    const [successMessage, setSuccessMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        codigo: '',
        direccion_id: '',
        orden: 0
    });

    const { modalState, showConfirmModal, hideConfirmModal } = useConfirmModal();

    // Cargar procesos de apoyo
    const fetchProcesosApoyo = async () => {
        try {
            setLoading(true);
            const response = await apiRequest('/api/procesos-apoyo');
            
            if (response.success) {
                setProcesosApoyo(response.data);
            }
        } catch (error) {
            console.error('Error al cargar procesos de apoyo:', error);
        } finally {
            setLoading(false);
        }
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        fetchProcesosApoyo();
    }, []);

    // Manejar envío del formulario
    const handleSubmit = async (formData) => {
        try {
            setFormLoading(true);
            setErrors({});
            
            console.log('🔍 Enviando datos del formulario:', formData);
            
            let response;
            
            if (modalMode === 'create') {
                console.log('🔍 Creando nuevo proceso de apoyo...');
                response = await apiRequest('/api/procesos-apoyo', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
            } else {
                console.log('🔍 Editando proceso de apoyo existente...');
                response = await apiRequest(`/api/procesos-apoyo/${selectedProceso.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
            }
            
            if (response.success) {
                setShowModal(false);
                fetchProcesosApoyo();
                resetForm();
                
                const action = modalMode === 'create' ? 'creado' : 'actualizado';
                setSuccessMessage(`Proceso de apoyo "${formData.nombre}" ${action} exitosamente`);
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        } catch (error) {
            console.error('Error al guardar proceso de apoyo:', error);
            
            if (error.message === 'Error de validación' && error.errors) {
                setErrors(error.errors);
            } else {
                setErrors({ general: 'Error al guardar el proceso de apoyo' });
            }
        } finally {
            setFormLoading(false);
        }
    };

    // Manejar edición
    const handleEdit = (proceso) => {
        console.log('🔍 handleEdit llamado con:', proceso);
        setSelectedProceso(proceso);
        setFormData({
            nombre: proceso.nombre,
            descripcion: proceso.descripcion || '',
            codigo: proceso.codigo || '',
            direccion_id: proceso.direccion?.id || '',
            orden: proceso.orden || 0
        });
        setModalMode('edit');
        setShowModal(true);
    };

    // Manejar eliminación
    const handleDelete = (proceso) => {
        console.log('🔍 handleDelete llamado con:', proceso);
        
        const deleteProceso = async () => {
            try {
                const response = await apiRequest(`/api/procesos-apoyo/${proceso.id}`, {
                    method: 'DELETE'
                });
                if (response.success) {
                    fetchProcesosApoyo();
                    setSuccessMessage(`Proceso de apoyo "${proceso.nombre}" eliminado exitosamente`);
                    setTimeout(() => setSuccessMessage(''), 5000);
                }
            } catch (error) {
                console.error('Error al eliminar proceso de apoyo:', error);
            }
        };

        showConfirmModal({
            title: 'Eliminar Proceso de Apoyo',
            message: `¿Estás seguro de que quieres eliminar el proceso "${proceso.nombre}"? Esta acción no se puede deshacer.`,
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            type: 'danger',
            onConfirm: deleteProceso,
            icon: WarningIcon
        });
    };

    // Resetear formulario
    const resetForm = () => {
        setFormData({
            nombre: '',
            descripcion: '',
            codigo: '',
            direccion_id: '',
            orden: 0
        });
    };

    // Abrir modal de creación
    const openCreateModal = () => {
        resetForm();
        setModalMode('create');
        setShowModal(true);
    };

    // Cerrar modal
    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p className="text-gray-600 text-lg font-medium mt-4">
                    Cargando procesos de apoyo...
                </p>
            </div>
        );
    }

    return (
        <div className={styles.procesosApoyoContainer}>
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
                    <div>
                        <h1 className={styles.title}>Procesos de Apoyo</h1>
                        <p className={styles.subtitle}>
                            Gestiona los procesos de apoyo de la organización
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className={styles.createButton}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo Proceso
                    </button>
                </div>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Cargando procesos de apoyo...</p>
                </div>
            ) : (
                <>
                    {/* Lista de procesos de apoyo */}
                    <div className={styles.procesosGrid}>
                        {procesosApoyo.map((proceso) => (
                            <ProcesoApoyoCard
                                key={proceso.id}
                                proceso={proceso}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>

                    {/* Mensaje cuando no hay procesos */}
                    {procesosApoyo.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay procesos de apoyo</h3>
                            <p className="text-gray-500 mb-4">Comienza creando tu primer proceso de apoyo.</p>
                            <button
                                onClick={openCreateModal}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Crear Primer Proceso
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Modal para crear/editar */}
            <ProcesoApoyoModal
                show={showModal}
                mode={modalMode}
                formData={formData}
                onClose={closeModal}
                onSubmit={handleSubmit}
                onChange={setFormData}
                loading={formLoading}
                errors={errors}
            />

            {/* Modal de confirmación */}
            <ConfirmModal {...modalState} onClose={hideConfirmModal} />
        </div>
    );
};

export default ProcesosApoyo; 