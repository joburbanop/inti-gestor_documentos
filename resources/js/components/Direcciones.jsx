import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/components/Direcciones.module.css';

// Componentes modulares
import DireccionCard from './direcciones/DireccionCard';
import DireccionModal from './direcciones/DireccionModal';
import DireccionDetailsModal from './direcciones/DireccionDetailsModal';
import ConfirmModal from './common/ConfirmModal';
import SearchFilterBar from './common/SearchFilterBar';
import NotificationContainer from './common/NotificationContainer';

// Hooks
import useConfirmModal from '../hooks/useConfirmModal';
import useNotifications from '../hooks/useNotifications';

// Iconos SVG
import { BuildingIcon, PlusIcon } from './icons/DireccionesIcons';
import { WarningIcon } from './icons/ModalIcons';

const Direcciones = () => {
    const { user, apiRequest } = useAuth();
    const navigate = useNavigate();
    const [direcciones, setDirecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [selectedDireccion, setSelectedDireccion] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('edit');
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        codigo: '',
        color: '#1F448B',
        procesos_apoyo: []
    });

    // Estados para filtrado y búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState([]);
    const [filteredDirecciones, setFilteredDirecciones] = useState([]);
    const [direccionesOptions, setDireccionesOptions] = useState([]);

    // Hook para modal de confirmación
    const { modalState, showConfirmModal, hideConfirmModal, executeConfirm } = useConfirmModal();
    
    // Hook para notificaciones
    const { notifications, showSuccess, showError, showWarning, removeNotification } = useNotifications();

    useEffect(() => {
        fetchDirecciones();
        
        // Verificar si hay mensaje de éxito en la URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success') === 'created') {
            showSuccess('¡Dirección creada exitosamente!');
            // Limpiar el parámetro de la URL
            window.history.replaceState({}, document.title, window.location.pathname + window.location.hash.split('?')[0]);
        }
    }, []);

    const fetchDirecciones = async () => {
        try {
            setLoading(true);
            const response = await apiRequest('/api/direcciones');
            if (response.success) {
                setDirecciones(response.data);
                setFilteredDirecciones(response.data);
            }
        } catch (error) {
            //
        } finally {
            setLoading(false);
        }
    };

    // Función de búsqueda
    const handleSearch = (term) => {
        setSearchTerm(term);
        applyFilters(term, activeFilters);
    };

    // Función de filtros
    const handleFiltersChange = (filters) => {
        setActiveFilters(filters);
        applyFilters(searchTerm, filters);
    };

    // Aplicar filtros y búsqueda
    const applyFilters = (search, filters) => {
        let filtered = [...direcciones];

        // Aplicar búsqueda
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(direccion => 
                direccion.nombre.toLowerCase().includes(searchLower) ||
                direccion.codigo.toLowerCase().includes(searchLower) ||
                direccion.descripcion?.toLowerCase().includes(searchLower)
            );
        }

        // Aplicar filtros
        filters.forEach(filter => {
            if (filter.key === 'procesos_count') {
                const count = parseInt(filter.value);
                if (count === 0) {
                    filtered = filtered.filter(d => d.procesos_apoyo_count === 0);
                } else if (count > 0) {
                    filtered = filtered.filter(d => d.procesos_apoyo_count > 0);
                }
            }
            if (filter.key === 'codigo') {
                const code = String(filter.value).toLowerCase();
                filtered = filtered.filter(d => d.codigo.toLowerCase().includes(code));
            }
            // filtro color eliminado
            if (filter.key === 'orden_min') {
                const min = Number(filter.value);
                if (!Number.isNaN(min)) filtered = filtered.filter(d => (d.orden ?? 0) >= min);
            }
            if (filter.key === 'orden_max') {
                const max = Number(filter.value);
                if (!Number.isNaN(max)) filtered = filtered.filter(d => (d.orden ?? 0) <= max);
            }
        });

        setFilteredDirecciones(filtered);
    };

    const handleSubmit = async (formData) => {
        try {
            setFormLoading(true);
            setErrors({});
            
            
            let response;
            
            if (modalMode === 'create') {
                // Crear nueva dirección
                response = await apiRequest('/api/direcciones', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
            } else {
                // Editar dirección existente
                response = await apiRequest(`/api/direcciones/${selectedDireccion.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
            }
            
            if (response.success) {
                setShowModal(false);
                fetchDirecciones();
                resetForm();
                
                // Mostrar mensaje de éxito
                const action = modalMode === 'create' ? 'creada' : 'actualizada';
                showSuccess(`Dirección "${formData.nombre}" ${action} exitosamente`);
            }
        } catch (error) {
            //
            
            // Manejar errores de validación
            if (error.message === 'Error de validación' && error.errors) {
                setErrors(error.errors);
            } else {
                setErrors({ general: 'Error al guardar la dirección' });
                showError('Error al guardar la dirección');
            }
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = (direccion) => {
        
        
        setSelectedDireccion(direccion);
        
        // Extraer los IDs de los procesos de apoyo
        const procesosIds = direccion.procesos_apoyo ? 
            direccion.procesos_apoyo.map(proceso => proceso.id) : [];
        
        
        
        setFormData({
            nombre: direccion.nombre,
            descripcion: direccion.descripcion || '',
            codigo: direccion.codigo || '',
            color: direccion.color || '#1F448B',
            procesos_apoyo: procesosIds
        });
        
        setModalMode('edit');
        setShowModal(true);
        
        /*
        console.log('🔍 Modal configurado para editar:', { 
            mode: 'edit', 
            show: true, 
            formData: {
                nombre: direccion.nombre,
                descripcion: direccion.descripcion || '',
                codigo: direccion.codigo || '',
                color: direccion.color || '#1F448B',
                procesos_apoyo: procesosIds
            }
        });*/
    };

    const handleDelete = (direccion) => {
        
        
        // Verificar si la dirección tiene documentos asociados antes de mostrar el modal
        const hasDocuments = direccion.estadisticas?.total_documentos > 0;
        
        if (hasDocuments) {
            // Si tiene documentos, mostrar notificación de advertencia
            showWarning(`No se puede eliminar la dirección "${direccion.nombre}" porque tiene ${direccion.estadisticas.total_documentos} documento(s) asociado(s).\n\nPrimero debes eliminar o mover todos los documentos asociados a esta dirección.`);
            return;
        }
        
        // Si no tiene documentos, proceder con el modal de confirmación
        const deleteDireccion = async () => {
            try {
                const response = await apiRequest(`/api/direcciones/${direccion.id}`, {
                    method: 'DELETE'
                });
                if (response.success) {
                    fetchDirecciones();
                    showSuccess(`Dirección "${direccion.nombre}" eliminada exitosamente`);
                }
            } catch (error) {
                //
                // Mostrar mensaje de error específico al usuario
                let errorMsg = 'Error al eliminar la dirección';
                if (error.message) {
                    errorMsg = error.message;
                } else if (error.response?.data?.message) {
                    errorMsg = error.response.data.message;
                }
                
                showError(`Error: ${errorMsg}`);
            }
        };

        showConfirmModal({
            title: 'Eliminar Dirección',
            message: `¿Estás seguro de que quieres eliminar la dirección "${direccion.nombre}"? Esta acción no se puede deshacer.`,
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            type: 'danger',
            onConfirm: deleteDireccion,
            icon: WarningIcon
        });
    };



    const resetForm = () => {
        setFormData({
            nombre: '',
            descripcion: '',
            codigo: '',
            color: '#1F448B',
            procesos_apoyo: []
        });
    };

    const openCreateModal = () => {
        resetForm();
        setModalMode('create');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
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
                        onClick={openCreateModal}
                        className={styles.newButton}
                        title="Crear nueva dirección"
                    >
                        <PlusIcon />
                        Nueva Dirección
                    </button>
                )}
            </div>

            {/* Barra de búsqueda y filtros */}
            <SearchFilterBar
                onSearch={handleSearch}
                onFiltersChange={handleFiltersChange}
                placeholder="Buscar direcciones por nombre, código o descripción..."
                searchValue={searchTerm}
                loading={loading}
                showAdvancedFilters={true}
                advancedFilters={[
                    {
                        key: 'procesos_count',
                        label: 'Procesos de Apoyo',
                        type: 'select',
                        value: activeFilters.find(f => f.key === 'procesos_count')?.value || '',
                        options: [
                            { value: '0', label: 'Sin procesos' },
                            { value: '1', label: 'Con procesos' }
                        ]
                    },
                    {
                        key: 'codigo',
                        label: 'Código',
                        type: 'text',
                        value: activeFilters.find(f => f.key === 'codigo')?.value || '',
                        placeholder: 'Ej: ADM, FIN, COM'
                    },
                    
                    {
                        key: 'orden_min',
                        label: 'Orden desde',
                        type: 'number',
                        value: activeFilters.find(f => f.key === 'orden_min')?.value ?? ''
                    },
                    {
                        key: 'orden_max',
                        label: 'Orden hasta',
                        type: 'number',
                        value: activeFilters.find(f => f.key === 'orden_max')?.value ?? ''
                    }
                ]}
                onAdvancedFilterChange={(key, value) => {
                    const newFilters = activeFilters.filter(f => f.key !== key);
                    if (value !== '' && value !== undefined && value !== null) {
                        let label = '';
                        if (key === 'procesos_count') label = value === '0' ? 'Sin procesos' : 'Con procesos';
                        else if (key === 'codigo') label = `Código: ${value}`;
                        else if (key === 'orden_min') label = `Orden ≥ ${value}`;
                        else if (key === 'orden_max') label = `Orden ≤ ${value}`;
                        else label = String(value);
                        newFilters.push({ key, value, label });
                    }
                    handleFiltersChange(newFilters);
                }}
            />

            {/* Grid de Direcciones */}
            <div className={styles.direccionesGrid}>
                {filteredDirecciones.map((direccion) => (
                    <DireccionCard
                        key={direccion.id}
                        direccion={direccion}
                        user={user}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            {/* Estado vacío */}
            {filteredDirecciones.length === 0 && !loading && (
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
                            onClick={openCreateModal}
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
                loading={formLoading}
                errors={errors}
            />



            {/* Modal de Confirmación Genérico */}
            <ConfirmModal
                isOpen={modalState.isOpen}
                onClose={hideConfirmModal}
                onConfirm={executeConfirm}
                title={modalState.title}
                message={modalState.message}
                confirmText={modalState.confirmText}
                cancelText={modalState.cancelText}
                type={modalState.type}
                icon={modalState.icon}
            />

            {/* Contenedor de Notificaciones */}
            <NotificationContainer
                notifications={notifications}
                onRemove={removeNotification}
            />
        </div>
    );
};

export default Direcciones; 