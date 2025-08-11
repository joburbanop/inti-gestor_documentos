import React, { useState, useEffect, useContext } from 'react';
import styles from '../../styles/components/ProcesosApoyo.module.css';
import { CloseIcon } from '../icons/DireccionesIcons';
import CreateForm from '../crud/CreateForm';
import { BuildingIcon, ProcessIcon, DocumentIcon } from '../icons/CrudIcons';
import { useAuth } from '../../contexts/AuthContext';

const ProcesoApoyoModal = ({ 
    show, 
    mode, 
    formData, 
    onClose, 
    onSubmit, 
    onChange,
    loading = false,
    errors = {}
}) => {
    const { apiRequest } = useAuth();
    const [direccionesOptions, setDireccionesOptions] = useState([]);

    // Cargar direcciones para el select
    useEffect(() => {
        if (show) {
            // Debug removido
            
            loadDireccionesOptions();
            
            // Verificar formData en modo edición
            if (mode === 'edit') {
                // Debug removido
            }
        }
    }, [show, mode, formData]);

    const loadDireccionesOptions = async () => {
        try {
            //
            const response = await apiRequest('/api/direcciones');

            if (response.success) {
                setDireccionesOptions(response.data.map(direccion => ({
                    value: direccion.id,
                    label: `${direccion.nombre} (${direccion.codigo})`
                })));
            } else {
                //
            }
        } catch (error) {
            //
        }
    };

    const handleAddDireccion = async () => {
        const nombre = window.prompt('Escribe el nombre de la nueva dirección:');
        if (!nombre) return;
        
        const codigo = window.prompt('Escribe el código de la dirección (opcional):');
        
        try {
            const response = await apiRequest('/api/direcciones', {
                method: 'POST',
                body: JSON.stringify({
                    nombre: nombre.trim(),
                    codigo: codigo ? codigo.trim() : null,
                    descripcion: '',
                    color: '#1F448B'
                })
            });

            if (response.success) {
                // Agregar la nueva dirección a las opciones
                const nuevaDireccion = {
                    value: response.data.id,
                    label: `${response.data.nombre} (${response.data.codigo})`
                };
                setDireccionesOptions(prev => [...prev, nuevaDireccion]);
                
                alert('Dirección creada exitosamente');
            } else {
                alert(response.message || 'Error al crear la dirección');
            }
        } catch (error) {
            console.error('Error al crear dirección:', error);
            alert('Error al crear la dirección: ' + error.message);
        }
    };

    if (!show) return null;

                // Configuración de campos para categorías
    const procesoApoyoFields = [
        {
            title: 'Información Básica',
            icon: ProcessIcon,
            fields: [
                {
                    name: 'nombre',
                    label: 'Nombre de la Categoría',
                    type: 'text',
                    placeholder: 'Ej: Gestión de Recursos Humanos',
                    required: true,
                    maxLength: 100
                },
                {
                    name: 'codigo',
                    label: 'Código',
                    type: 'text',
                    placeholder: 'Ej: GRH',
                    required: true,
                    maxLength: 10
                }
            ]
        },
        {
            title: 'Descripción y Funciones',
            icon: DocumentIcon,
            fields: [
                {
                    name: 'descripcion',
                    label: 'Descripción de la Categoría',
                    type: 'textarea',
                    placeholder: 'Describe las funciones principales, responsabilidades y objetivos de esta categoría...',
                    required: true,
                    maxLength: 500,
                    rows: 4
                }
            ]
        },
        {
            title: 'Asociación',
            icon: BuildingIcon,
            fields: [
                {
                    name: 'direccion_id',
                    label: 'Dirección Asociada',
                    type: 'select',
                    placeholder: 'Selecciona la dirección a la que pertenece',
                    required: true,
                    options: direccionesOptions,
                    hasAddButton: true,
                    addButtonText: 'Agregar dirección',
                    onAddClick: handleAddDireccion
                },
                
            ]
        }
    ];

    const handleFormSubmit = async (formData) => {
        if (onSubmit) {
            await onSubmit(formData);
        }
    };

    const handleFormChange = (newFormData) => {
        if (onChange) {
            onChange(newFormData);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {/* Header del Modal */}
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        {mode === 'create' ? 'Nueva Categoría' : 'Editar Categoría'}
                    </h2>
                    <button
                        onClick={onClose}
                        className={styles.closeButton}
                        title="Cerrar modal"
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Contenido del Modal usando CreateForm */}
                <div className={styles.modalBody}>
                    <CreateForm
                        entityType="proceso"
                        title=""
                        subtitle=""
                        fields={procesoApoyoFields}
                        onSubmit={handleFormSubmit}
                        onCancel={onClose}
                        initialData={formData}
                        loading={loading}
                        errors={errors}
                        isModal={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProcesoApoyoModal; 