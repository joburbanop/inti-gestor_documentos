import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import styles from '../styles/components/ProcesosApoyo.module.css';
import ProcesoApoyoCard from './procesos-apoyo/ProcesoApoyoCard';
import ProcesoApoyoModal from './procesos-apoyo/ProcesoApoyoModal';
import ConfirmModal from './common/ConfirmModal';
import NotificationContainer from './common/NotificationContainer';
import useConfirmModal from '../hooks/useConfirmModal';
import useNotifications from '../hooks/useNotifications';
import SearchFilterBar from './common/SearchFilterBar';
import { WarningIcon } from './icons/ModalIcons';

const ProcesosApoyo = () => {
    const { apiRequest } = useAuth();
    const location = useLocation();
    const [procesosApoyo, setProcesosApoyo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [selectedProceso, setSelectedProceso] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('edit');
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        codigo: '',
        direccion_id: ''
    });

    // Estados para filtrado y búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState([]);
    const [filteredProcesos, setFilteredProcesos] = useState([]);
    const [direccionesOptions, setDireccionesOptions] = useState([]);
    const [categoriasOptions, setCategoriasOptions] = useState([]);
    const [selectedDireccion, setSelectedDireccion] = useState('');

    const { modalState, showConfirmModal, hideConfirmModal } = useConfirmModal();
    const { notifications, showSuccess, showError, showWarning, removeNotification } = useNotifications();
    const [deletingIds, setDeletingIds] = useState(new Set());

    // Manejar filtro por dirección cuando se navega desde direcciones
    useEffect(() => {
        if (location.state?.filterByDireccion) {
            const direccionId = location.state.filterByDireccion;
            const direccionName = location.state.direccionName;
            
            // Aplicar filtro por dirección
            const newFilters = [{ 
                key: 'direccion_id', 
                value: direccionId.toString(), 
                label: `Dirección: ${direccionName}` 
            }];
            
            setActiveFilters(newFilters);
            
            // Mostrar notificación
            showSuccess(`Filtrado por dirección: ${direccionName}`);
            
            // Limpiar el estado de navegación
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [location.state]);

    // Cargar categorías
    const fetchProcesosApoyo = async () => {
        try {
            setLoading(true);
            const response = await apiRequest('/api/procesos-apoyo');
            
            if (response.success) {
                setProcesosApoyo(response.data);
                setFilteredProcesos(response.data);
            }
        } catch (error) {
            //
        } finally {
            setLoading(false);
        }
    };

    // Cargar opciones de direcciones para filtros
    const fetchDireccionesOptions = async () => {
        try {
            const response = await apiRequest('/api/direcciones');
            if (response.success) {
                const options = [
                    { value: '', label: 'Todas las direcciones' },
                    { value: 'null', label: 'Sin dirección' },
                    ...response.data.map(d => ({
                        value: d.id.toString(),
                        label: d.nombre
                    }))
                ];
                setDireccionesOptions(options);
            }
        } catch (error) {
            //
        }
    };

    // Generar opciones de categorías basadas en la dirección seleccionada
    const generateCategoriasOptions = (direccionId) => {
        let categoriasFiltradas = [];
        
        if (direccionId === '') {
            // Todas las direcciones - mostrar todas las categorías
            categoriasFiltradas = procesosApoyo;
        } else if (direccionId === 'null') {
            // Sin dirección - mostrar solo categorías sin dirección
            categoriasFiltradas = procesosApoyo.filter(p => !p.direccion);
        } else {
            // Dirección específica - mostrar solo categorías de esa dirección
            categoriasFiltradas = procesosApoyo.filter(p => p.direccion?.id.toString() === direccionId);
        }
        
        const options = [
            { value: '', label: 'Todas las categorías' },
            ...categoriasFiltradas.map(cat => ({
                value: cat.id.toString(),
                label: cat.nombre
            }))
        ];
        
        setCategoriasOptions(options);
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

    // Utilidad para computar filtrado sobre una lista
    const computeFiltered = (list, search, filters) => {
        let filtered = [...list];
        
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(proceso =>
                proceso.nombre.toLowerCase().includes(searchLower) ||
                proceso.codigo.toLowerCase().includes(searchLower) ||
                proceso.descripcion?.toLowerCase().includes(searchLower) ||
                proceso.direccion?.nombre.toLowerCase().includes(searchLower)
            );
        }
        
        filters.forEach(filter => {
            if (filter.key === 'direccion_id') {
                const beforeCount = filtered.length;
                
                filtered = filtered.filter(p => {
                    let match = false;
                    
                    if (filter.value === 'null') {
                        // Filtrar categorías sin dirección
                        match = p.direccion === null || p.direccion === undefined;
                    } else if (filter.value === '') {
                        // Mostrar todas las direcciones
                        match = true;
                    } else {
                        // Filtrar por dirección específica
                        match = p.direccion?.id.toString() === filter.value || p.direccion?.id == filter.value;
                    }
                    
                    return match;
                });
                
                console.log(`🔍 Filtro direccion_id: ${beforeCount} → ${filtered.length} elementos`);
            }

            if (filter.key === 'categoria_id') {
                const beforeCount = filtered.length;
                
                filtered = filtered.filter(p => {
                    if (filter.value === '') {
                        return true; // Mostrar todas las categorías
                    } else {
                        return p.id.toString() === filter.value;
                    }
                });
                
                console.log(`🔍 Filtro categoria_id: ${beforeCount} → ${filtered.length} elementos`);
            }

        });
        
        return filtered;
    };

    // Aplicar filtros
    const applyFilters = (search, filters) => {
        const result = computeFiltered(procesosApoyo, search, filters);
        setFilteredProcesos(result);
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        fetchProcesosApoyo();
        fetchDireccionesOptions();
    }, []);

    // Aplicar filtros cuando cambien los filtros, búsqueda o datos
    useEffect(() => {
        if (procesosApoyo.length > 0) {
            applyFilters(searchTerm, activeFilters);
        }
    }, [activeFilters, searchTerm, procesosApoyo]);

    // Actualizar opciones de categorías cuando cambie la dirección seleccionada
    useEffect(() => {
        if (procesosApoyo.length > 0) {
            generateCategoriasOptions(selectedDireccion);
        }
    }, [selectedDireccion, procesosApoyo]);

    // Manejar envío del formulario
    const handleSubmit = async (formData) => {
        try {
            setFormLoading(true);
            setErrors({});
            
            //
            
            let response;
            
            if (modalMode === 'create') {
                //
                response = await apiRequest('/api/procesos-apoyo', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
            } else {
                //
                response = await apiRequest(`/api/procesos-apoyo/${selectedProceso.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
            }
            
            if (response.success) {
                setShowModal(false);
                resetForm();
                // Limpiar búsqueda y filtros para que el nuevo elemento sea visible
                setSearchTerm('');
                setActiveFilters([]);
                // Recargar lista y aplicar filtros vacíos
                await fetchProcesosApoyo();
                
                const action = modalMode === 'create' ? 'creado' : 'actualizado';
                showSuccess(`Categoría "${formData.nombre}" ${action} exitosamente`);
            }
        } catch (error) {
            //
            
            if (error.message === 'Error de validación' && error.errors) {
                setErrors(error.errors);
            } else {
                            setErrors({ general: 'Error al guardar la categoría' });
            showError('Error al guardar la categoría');
            }
        } finally {
            setFormLoading(false);
        }
    };

    // Manejar edición
    const handleEdit = (proceso) => {
        //
        setSelectedProceso(proceso);
        setFormData({
            nombre: proceso.nombre,
            descripcion: proceso.descripcion || '',
            codigo: proceso.codigo || '',
            direccion_id: proceso.direccion?.id || ''
        });
        setModalMode('edit');
        setShowModal(true);
    };

    // Manejar eliminación
    const handleDelete = (proceso) => {
        //
        
                    // Verificar si la categoría tiene documentos asociados antes de mostrar el modal
        const hasDocuments = proceso.estadisticas?.total_documentos > 0;
        
        if (hasDocuments) {
            // Si tiene documentos, mostrar notificación de advertencia
            showWarning(`No se puede eliminar la categoría "${proceso.nombre}" porque tiene ${proceso.estadisticas.total_documentos} documento(s) asociado(s).\n\nPrimero debes eliminar o mover todos los documentos asociados a esta categoría.`);
            return;
        }
        
        const deleteProceso = async () => {
            try {
                // Evitar dobles clics/duplicados
                if (deletingIds.has(proceso.id)) return;
                setDeletingIds(prev => new Set(prev).add(proceso.id));

                const response = await apiRequest(`/api/procesos-apoyo/${proceso.id}`, { method: 'DELETE' });

                if (response.success) {
                    // Actualización optimista sin esperar fetch completo
                    setProcesosApoyo(prev => {
                        const updated = prev.filter(p => p.id !== proceso.id);
                        setFilteredProcesos(computeFiltered(updated, searchTerm, activeFilters));
                        return updated;
                    });
                    showSuccess(`Categoría "${proceso.nombre}" eliminada exitosamente`);
                }
            } catch (error) {
                // Si el backend responde "no encontrado", lo tratamos como eliminado (idempotente)
                const msg = (error?.message || '').toLowerCase();
                if (msg.includes('no encontrado')) {
                    setProcesosApoyo(prev => {
                        const updated = prev.filter(p => p.id !== proceso.id);
                        setFilteredProcesos(computeFiltered(updated, searchTerm, activeFilters));
                        return updated;
                    });
                    showSuccess(`Categoría "${proceso.nombre}" ya no existe. Lista actualizada.`);
                } else {
                                console.error('Error al eliminar categoría:', error);
            showError(`Error al eliminar categoría: ${error.message}`);
                }
            } finally {
                setDeletingIds(prev => {
                    const next = new Set(prev);
                    next.delete(proceso.id);
                    return next;
                });
                hideConfirmModal();
            }
        };

        showConfirmModal({
            title: 'Eliminar Categoría',
            message: `¿Estás seguro de que quieres eliminar la categoría "${proceso.nombre}"? Esta acción no se puede deshacer.`,
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
            direccion_id: ''
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
                    Cargando categorías...
                </p>
            </div>
        );
    }

    return (
        <div className={styles.procesosApoyoContainer}>

            
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                                        <h1 className={styles.title}>Categorías</h1>
                <p className={styles.subtitle}>
                    Gestiona las categorías de la organización
                </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className={styles.createButton}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nueva Categoría
                    </button>
                </div>
            </div>

            {/* Barra de búsqueda y filtros */}
            <SearchFilterBar
                onSearch={handleSearch}
                onFiltersChange={handleFiltersChange}
                placeholder="Buscar categorías por nombre, código, descripción o dirección..."
                searchValue={searchTerm}
                loading={loading}
                showAdvancedFilters={true}
                advancedFilters={[
                    {
                        key: 'direccion_id',
                        label: 'Dirección',
                        type: 'select',
                        value: activeFilters.find(f => f.key === 'direccion_id')?.value || '',
                        options: direccionesOptions
                    },
                    {
                        key: 'categoria_id',
                        label: 'Categoría',
                        type: 'select',
                        value: activeFilters.find(f => f.key === 'categoria_id')?.value || '',
                        options: categoriasOptions
                    }
                ]}
                onAdvancedFilterChange={(key, value) => {
                    const newFilters = activeFilters.filter(f => f.key !== key);
                    
                    if (key === 'direccion_id') {
                        // Si cambia la dirección, limpiar el filtro de categoría
                        setSelectedDireccion(value);
                        const filtersWithoutCategoria = newFilters.filter(f => f.key !== 'categoria_id');
                        
                        if (value) {
                            const label = direccionesOptions.find(d => d.value === value)?.label || 'Dirección';
                            filtersWithoutCategoria.push({ key, value, label });
                        }
                        
                        handleFiltersChange(filtersWithoutCategoria);
                    } else if (key === 'categoria_id') {
                        if (value) {
                            const label = categoriasOptions.find(c => c.value === value)?.label || 'Categoría';
                            newFilters.push({ key, value, label });
                        }
                        handleFiltersChange(newFilters);
                    }
                }}
            />

            {/* Indicador de filtro activo */}
            {activeFilters.length > 0 && (
                <div className={styles.activeFilters}>
                    <span className={styles.activeFiltersLabel}>Filtros activos:</span>
                    {activeFilters.map((filter, index) => (
                        <span key={index} className={styles.activeFilterTag}>
                            {filter.label}
                            <button
                                onClick={() => {
                                    const newFilters = activeFilters.filter((_, i) => i !== index);
                                    handleFiltersChange(newFilters);
                                }}
                                className={styles.removeFilterButton}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Cargando categorías...</p>
                </div>
            ) : (
                <>
                    {/* Lista de categorías */}
                    <div className={styles.procesosGrid}>
                        {filteredProcesos.map((proceso) => (
                            <ProcesoApoyoCard
                                key={proceso.id}
                                proceso={proceso}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>

                    {/* Mensaje cuando no hay categorías */}
                    {filteredProcesos.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay categorías</h3>
                                                            <p className="text-gray-500 mb-4">Comienza creando tu primera categoría.</p>
                            <button
                                onClick={openCreateModal}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Crear Primera Categoría
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

            {/* Contenedor de notificaciones */}
            <NotificationContainer 
                notifications={notifications} 
                onRemove={removeNotification} 
            />
        </div>
    );
};

export default ProcesosApoyo; 