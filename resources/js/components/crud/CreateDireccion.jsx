import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CreateForm from './CreateForm';
import { BuildingIcon, CodeIcon, DescriptionIcon, ProcessIcon, PlusIcon } from '../icons/CrudIcons';

const CreateDireccion = () => {
    const { apiRequest } = useAuth();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [procesosOptions, setProcesosOptions] = useState([]);
    const [showProcessModal, setShowProcessModal] = useState(false);

    // Cargar opciones de procesos de apoyo
    useEffect(() => {
        const cargarProcesos = async () => {
            try {
                const response = await apiRequest('/api/procesos-apoyo/todos');
                if (response.success) {
                    setProcesosOptions(response.data);
                }
            } catch (error) {
                console.error('Error al cargar procesos de apoyo:', error);
            }
        };

        cargarProcesos();
    }, [apiRequest]);

    const validateForm = (formData) => {
        const newErrors = {};
        
        if (!formData.nombre?.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }
        
        if (!formData.codigo?.trim()) {
            newErrors.codigo = 'El código es requerido';
        }
        
        if (!formData.descripcion?.trim()) {
            newErrors.descripcion = 'La descripción es requerida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (formData) => {
        if (!validateForm(formData)) {
            return;
        }

        try {
            setLoading(true);
            
            const response = await apiRequest('/api/direcciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.success) {
                // Redirigir a la lista de direcciones con mensaje de éxito
                // Usar setTimeout para asegurar que la redirección sea suave
                setTimeout(() => {
                    window.location.href = '/#direcciones?success=created';
                }, 100);
            } else {
                setErrors({ general: response.message || 'Error al crear la dirección' });
            }
        } catch (error) {
            console.error('Error al crear dirección:', error);
            setErrors({ general: 'Error de conexión. Inténtalo de nuevo.' });
        } finally {
            setLoading(false);
        }
    };

    // Configuración de campos para direcciones
    const direccionFields = [
        {
            title: 'Información Básica',
            icon: BuildingIcon,
            fields: [
                {
                    name: 'nombre',
                    label: 'Nombre de la Dirección',
                    type: 'text',
                    placeholder: 'Ej: Dirección de Talento Humano',
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
            icon: DescriptionIcon,
            fields: [
                {
                    name: 'descripcion',
                    label: 'Descripción de la Dirección',
                    type: 'textarea',
                    placeholder: 'Describe las funciones principales, responsabilidades y objetivos de esta dirección...',
                    required: true,
                    maxLength: 500,
                    rows: 4
                }
            ]
        },
        {
            title: 'Procesos de Apoyo',
            icon: ProcessIcon,
            fields: [
                {
                    name: 'procesos_apoyo',
                    label: 'Procesos de Apoyo Asociados',
                    type: 'select',
                    placeholder: 'Selecciona los procesos de apoyo (opcional)',
                    required: false,
                    multiple: true,
                    options: procesosOptions,
                    hasAddButton: true,
                    addButtonText: 'Crear Nuevo Proceso',
                    onAddClick: () => setShowProcessModal(true)
                }
            ]
        }
    ];

    return (
        <>
            <CreateForm
                entityType="direccion"
                title="Crear Nueva Dirección"
                subtitle="Completa la información básica para crear una nueva dirección administrativa"
                fields={direccionFields}
                onSubmit={handleSubmit}
                loading={loading}
                errors={errors}
                initialData={{
                    nombre: '',
                    codigo: '',
                    descripcion: ''
                }}
            />
            
            {/* Modal para crear proceso de apoyo */}
            {showProcessModal && (
                <div className="modalOverlay">
                    <div className="processModal">
                        <div className="modalHeader">
                            <h3>Crear Nuevo Proceso de Apoyo</h3>
                            <button 
                                onClick={() => setShowProcessModal(false)}
                                className="closeButton"
                            >
                                ×
                            </button>
                        </div>
                        <div className="modalContent">
                            <p>Esta funcionalidad estará disponible próximamente.</p>
                            <p>Por ahora, puedes crear procesos de apoyo desde la sección de Procesos.</p>
                        </div>
                        <div className="modalActions">
                            <button 
                                onClick={() => window.location.href = '/#procesos'}
                                className="primaryButton"
                            >
                                Ir a Procesos
                            </button>
                            <button 
                                onClick={() => setShowProcessModal(false)}
                                className="secondaryButton"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CreateDireccion; 