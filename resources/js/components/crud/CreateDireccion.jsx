import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CreateForm from './CreateForm';
import { BuildingIcon, CodeIcon, DescriptionIcon } from '../icons/CrudIcons';

const CreateDireccion = () => {
    const { apiRequest } = useAuth();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

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
                window.location.href = '/#direcciones?success=created';
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
        }
    ];

    return (
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
    );
};

export default CreateDireccion; 