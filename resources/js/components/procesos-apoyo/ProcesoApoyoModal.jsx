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
            console.log('🔍 Modal abierto, cargando direcciones...');
            console.log('🔍 Modal - mode:', mode);
            console.log('🔍 Modal - formData completo:', formData);
            
            loadDireccionesOptions();
            
            // Verificar formData en modo edición
            if (mode === 'edit') {
                console.log('🔍 ProcesoApoyoModal - formData en modo editar:', formData);
                console.log('🔍 ProcesoApoyoModal - direccion_id en formData:', formData.direccion_id);
            }
        }
    }, [show, mode, formData]);

    const loadDireccionesOptions = async () => {
        try {
            console.log('🔍 Cargando direcciones...');
            const response = await apiRequest('/api/direcciones');
            
            console.log('🔍 Respuesta completa direcciones:', response);
            
            if (response.success) {
                console.log('✅ Direcciones cargadas:', response.data.length);
                setDireccionesOptions(response.data.map(direccion => ({
                    value: direccion.id,
                    label: `${direccion.nombre} (${direccion.codigo})`
                })));
            } else {
                console.error('❌ Error en respuesta direcciones:', response.message);
            }
        } catch (error) {
            console.error('❌ Error al cargar direcciones:', error);
        }
    };

    if (!show) return null;

    // Configuración de campos para procesos de apoyo
    const procesoApoyoFields = [
        {
            title: 'Información Básica',
            icon: ProcessIcon,
            fields: [
                {
                    name: 'nombre',
                    label: 'Nombre del Proceso',
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
                    label: 'Descripción del Proceso',
                    type: 'textarea',
                    placeholder: 'Describe las funciones principales, responsabilidades y objetivos de este proceso...',
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
                    options: direccionesOptions
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
                        {mode === 'create' ? 'Nuevo Proceso de Apoyo' : 'Editar Proceso de Apoyo'}
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