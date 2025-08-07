import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import styles from '../../styles/components/CreateForm.module.css';
import { 
    BuildingIcon, 
    ArrowLeftIcon, 
    SaveIcon, 
    CodeIcon, 
    DescriptionIcon,
    ProcessIcon,
    DocumentIcon,
    SettingsIcon,
    PlusIcon
} from '../icons/CrudIcons';

const CreateForm = ({ 
    entityType = 'direccion',
    title = 'Crear Nueva Entidad',
    subtitle = 'Completa la información básica',
    fields = [],
    onSubmit,
    onCancel,
    initialData = {},
    loading = false,
    errors = {},
    isModal = false
}) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialData);
    const [multiSelectOpen, setMultiSelectOpen] = useState(null);

    // Actualizar formData cuando cambie initialData
    useEffect(() => {
        console.log('🔍 CreateForm - initialData actualizado:', initialData);
        setFormData(initialData);
    }, [initialData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const toggleMultiSelect = (fieldName) => {
        setMultiSelectOpen(multiSelectOpen === fieldName ? null : fieldName);
    };

    const toggleOption = (fieldName, value) => {
        setFormData(prev => {
            const currentValues = prev[fieldName] || [];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            
            return {
                ...prev,
                [fieldName]: newValues
            };
        });
    };

    const removeSelectedItem = (fieldName, value) => {
        setFormData(prev => {
            const currentValues = prev[fieldName] || [];
            return {
                ...prev,
                [fieldName]: currentValues.filter(v => v !== value)
            };
        });
    };

    // Cerrar dropdown cuando se hace click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.multiSelectContainer')) {
                setMultiSelectOpen(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (onSubmit) {
            await onSubmit(formData);
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            // Navegación por defecto basada en el tipo de entidad
            const defaultRoute = getDefaultRoute(entityType);
            window.location.href = defaultRoute;
        }
    };

    const getDefaultRoute = (type) => {
        switch (type) {
            case 'direccion':
                return '/#direcciones';
            case 'proceso':
                return '/#procesos';
            case 'documento':
                return '/#documentos';
            default:
                return '/';
        }
    };

    const getEntityIcon = (type) => {
        switch (type) {
            case 'direccion':
                return <BuildingIcon className="w-5 h-5" />;
            case 'proceso':
                return <ProcessIcon className="w-5 h-5" />;
            case 'documento':
                return <DocumentIcon className="w-5 h-5" />;
            default:
                return <SettingsIcon className="w-5 h-5" />;
        }
    };

    const renderField = (field) => {
        const { 
            name, 
            label, 
            type = 'text', 
            placeholder, 
            required = false, 
            maxLength, 
            rows = 4,
            options = [],
            icon: FieldIcon
        } = field;

        const fieldError = errors[name];
        const fieldValue = formData[name] || '';

        // Debug para campos select
        if (type === 'select' && name === 'procesos_apoyo') {
            console.log('🔍 Renderizando campo procesos_apoyo:', {
                optionsCount: options.length,
                fieldValue,
                fieldValueType: typeof fieldValue,
                isArray: Array.isArray(fieldValue),
                optionsSample: options.slice(0, 3) // Solo mostrar los primeros 3
            });
            
            // Verificar si los valores seleccionados están en las opciones
            if (Array.isArray(fieldValue) && fieldValue.length > 0) {
                console.log('🔍 Valores seleccionados:', fieldValue);
                const selectedOptions = options.filter(opt => fieldValue.includes(opt.value));
                console.log('🔍 Opciones encontradas para valores seleccionados:', selectedOptions);
            }
        }

        switch (type) {
            case 'textarea':
                return (
                    <div className="formGroup" key={name}>
                        <label htmlFor={name} className="formLabel">
                            {label} {required && '*'}
                        </label>
                        <textarea
                            id={name}
                            name={name}
                            value={fieldValue}
                            onChange={handleInputChange}
                            className={`formTextarea ${fieldError ? 'inputError' : ''}`}
                            placeholder={placeholder}
                            rows={rows}
                            maxLength={maxLength}
                        />
                        {maxLength && (
                            <div className="textareaFooter">
                                <span className="charCount">
                                    {fieldValue.length}/{maxLength} caracteres
                                </span>
                            </div>
                        )}
                        {fieldError && (
                            <span className="errorText">{fieldError}</span>
                        )}
                    </div>
                );

            case 'select':
                if (field.multiple) {
                    return (
                        <div className="formGroup" key={name}>
                            <label htmlFor={name} className="formLabel">
                                {label} {required && '*'}
                            </label>
                            <div className="selectWithButton">
                                <div className={`multiSelectContainer ${multiSelectOpen === name ? 'open' : ''}`}>
                                    <div className="multiSelectDisplay" onClick={() => toggleMultiSelect(name)}>
                                        <div className="selectedItems">
                                            {fieldValue && fieldValue.length > 0 ? (
                                                fieldValue.map((value, index) => {
                                                    const option = options.find(opt => opt.value == value);
                                                    return option ? (
                                                        <span key={value} className="selectedItem">
                                                            {option.label}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeSelectedItem(name, value);
                                                                }}
                                                                className="removeItem"
                                                            >
                                                                ×
                                                            </button>
                                                        </span>
                                                    ) : null;
                                                })
                                            ) : (
                                                <span className="placeholder">{placeholder}</span>
                                            )}
                                        </div>
                                        <div className="multiSelectArrow">▼</div>
                                    </div>
                                    {multiSelectOpen === name && (
                                        <div className="multiSelectDropdown">
                                            {options.map((option) => (
                                                <div
                                                    key={option.value}
                                                    className={`multiSelectOption ${fieldValue && fieldValue.includes(option.value) ? 'selected' : ''}`}
                                                    onClick={() => toggleOption(name, option.value)}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={fieldValue && fieldValue.includes(option.value)}
                                                        readOnly
                                                    />
                                                    <span>{option.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {field.hasAddButton && (
                                    <button
                                        type="button"
                                        onClick={field.onAddClick}
                                        className="addButton"
                                        title={field.addButtonText}
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            {fieldError && (
                                <span className="errorText">{fieldError}</span>
                            )}
                        </div>
                    );
                }
                
                return (
                    <div className="formGroup" key={name}>
                        <label htmlFor={name} className="formLabel">
                            {label} {required && '*'}
                        </label>
                        <div className="selectWithButton">
                            <select
                                id={name}
                                name={name}
                                value={fieldValue}
                                onChange={handleInputChange}
                                className={`formSelect ${fieldError ? 'inputError' : ''}`}
                            >
                                <option value="">{placeholder}</option>
                                {options.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {field.hasAddButton && (
                                <button
                                    type="button"
                                    onClick={field.onAddClick}
                                    className="addButton"
                                    title={field.addButtonText}
                                >
                                    <PlusIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        {fieldError && (
                            <span className="errorText">{fieldError}</span>
                        )}
                    </div>
                );

            default: // text, number, email, password, etc.
                    return (
                        <div className="formGroup" key={name}>
                            <label htmlFor={name} className="formLabel">
                                {label} {required && '*'}
                            </label>
                            <div className="inputWithButton">
                                <input
                                    type={type}
                                    id={name}
                                    name={name}
                                    value={fieldValue}
                                    onChange={handleInputChange}
                                    className={`formInput ${fieldError ? 'inputError' : ''}`}
                                    placeholder={placeholder}
                                    maxLength={maxLength}
                                />
                                {field.hasAddButton && (
                                    <button
                                        type="button"
                                        onClick={field.onAddClick}
                                        className="addButton"
                                        title={field.addButtonText}
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            {fieldError && (
                                <span className="errorText">{fieldError}</span>
                            )}
                        </div>
                    );
        }
    };

    const renderSection = (section) => {
        const { title: sectionTitle, icon: SectionIcon, fields: sectionFields, extraContent } = section;
        
        return (
            <div className="formSection" key={sectionTitle}>
                <h3 className="sectionTitle">
                    {sectionTitle}
                </h3>
                
                {sectionFields.length === 1 ? (
                    renderField(sectionFields[0])
                ) : (
                    <div className="formGrid">
                        {sectionFields.map(renderField)}
                    </div>
                )}
                
                {extraContent && (
                    <div className="extraContent">
                        {extraContent}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`createFormContainer ${isModal ? 'modalMode' : ''}`}>
            {/* Header Compacto - Solo si no es modal */}
            {!isModal && (
                <div className="createHeader">
                    <div className="headerTop">
                        <button 
                            onClick={handleCancel}
                            className="backButton"
                            aria-label="Volver"
                        >
                            <ArrowLeftIcon className="w-3 h-3" />
                            <span>Volver</span>
                        </button>
                    </div>
                    
                    <div className="createTitleSection">
                        <h1 className="createTitle">{title}</h1>
                        <p className="createSubtitle">{subtitle}</p>
                    </div>
                </div>
            )}

            {/* Formulario Organizado */}
            <div className="formContainer">
                <form onSubmit={handleSubmit} className="createForm">
                    {/* Error general */}
                    {errors.general && (
                        <div className="errorMessage">
                            {errors.general}
                        </div>
                    )}

                    {/* Renderizar secciones */}
                    {fields.map(renderSection)}

                    {/* Botones de acción */}
                    <div className="formActions">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="cancelButton"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        
                        <button
                            type="submit"
                            className="submitButton"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="loadingSpinner"></div>
                            ) : (
                                <>
                                    <span>{isModal ? 'Guardar' : `Crear ${entityType}`}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateForm; 