import React, { useState, useEffect, useContext } from 'react';
import styles from '../../styles/components/Direcciones.module.css';
import { CloseIcon } from '../icons/DireccionesIcons';
import CreateForm from '../crud/CreateForm';
import { BuildingIcon, ProcessIcon, DocumentIcon } from '../icons/CrudIcons';
import { useAuth } from '../../contexts/AuthContext';

const DireccionModal = ({ 
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
    const [procesosOptions, setProcesosOptions] = useState([]);

                // Cargar categorías para el select
    useEffect(() => {
        if (show) {
            // Debug removido
            
            loadProcesosOptions();
            
            // Verificar formData en modo edición
            if (mode === 'edit') {
                // Debug removido
            }
        }
    }, [show, mode, formData]);

    const loadProcesosOptions = async () => {
        try {
            const response = await apiRequest('/api/procesos-apoyo/todos');
            if (response.success) {
                setProcesosOptions(response.data);
            } else {
                //
            }
        } catch (error) {
            //
        }
    };

    if (!show) return null;

    // Configuración de campos para procesos estratégicos (igual que en CreateDireccion)
    const direccionFields = [
        {
            title: 'Información Básica',
            icon: BuildingIcon,
            fields: [
                {
                    name: 'nombre',
                    label: 'Nombre del Proceso Estratégico',
                    type: 'text',
                    placeholder: 'Ej: Proceso Estratégico de Talento Humano',
                    required: true,
                    maxLength: 100
                },
                {
                    name: 'codigo',
                    label: 'Código',
                    type: 'text',
                    placeholder: 'Ej: DTH',
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
                    label: 'Descripción del Proceso Estratégico',
                    type: 'textarea',
                    placeholder: 'Describe las funciones principales, responsabilidades y objetivos de este proceso estratégico...',
                    required: true,
                    maxLength: 500,
                    rows: 4
                }
            ]
        },
        {
                            title: 'Categorías',
            icon: ProcessIcon,
            fields: [
                {
                    name: 'procesos_apoyo',
                    label: 'Categorías Asociadas',
                    type: 'select',
                    placeholder: 'Selecciona las categorías (opcional)',
                    required: false,
                    multiple: true,
                    options: procesosOptions
                    // Sin botón de agregar - eliminado por problemas de funcionalidad
                }
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
                        {mode === 'create' ? 'Nuevo Proceso Estratégico' : 'Editar Proceso Estratégico'}
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
                        entityType="direccion"
                        title=""
                        subtitle=""
                        fields={direccionFields}
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

export default DireccionModal; 