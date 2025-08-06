import React, { useState } from 'react';
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
    SettingsIcon
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
    errors = {}
}) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialData);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

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

        switch (type) {
            case 'textarea':
                return (
                    <div className="formGroup" key={name}>
                        <label htmlFor={name} className="formLabel">
                            {FieldIcon && <FieldIcon className="w-3 h-3 inline mr-1" />}
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
                return (
                    <div className="formGroup" key={name}>
                        <label htmlFor={name} className="formLabel">
                            {FieldIcon && <FieldIcon className="w-3 h-3 inline mr-1" />}
                            {label} {required && '*'}
                        </label>
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
                        {fieldError && (
                            <span className="errorText">{fieldError}</span>
                        )}
                    </div>
                );

            default:
                return (
                    <div className="formGroup" key={name}>
                        <label htmlFor={name} className="formLabel">
                            {FieldIcon && <FieldIcon className="w-3 h-3 inline mr-1" />}
                            {label} {required && '*'}
                        </label>
                        <input
                            id={name}
                            name={name}
                            type={type}
                            value={fieldValue}
                            onChange={handleInputChange}
                            className={`formInput ${fieldError ? 'inputError' : ''}`}
                            placeholder={placeholder}
                            maxLength={maxLength}
                        />
                        {fieldError && (
                            <span className="errorText">{fieldError}</span>
                        )}
                    </div>
                );
        }
    };

    const renderSection = (section) => {
        const { title: sectionTitle, icon: SectionIcon, fields: sectionFields } = section;
        
        return (
            <div className="formSection" key={sectionTitle}>
                <h3 className="sectionTitle">
                    {SectionIcon && <SectionIcon className="w-4 h-4" />}
                    {sectionTitle}
                </h3>
                
                {sectionFields.length === 1 ? (
                    renderField(sectionFields[0])
                ) : (
                    <div className="formGrid">
                        {sectionFields.map(renderField)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="createFormContainer">
            {/* Header Compacto */}
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
                    
                    <div className="createIcon">
                        {getEntityIcon(entityType)}
                    </div>
                </div>
                
                <div className="createTitleSection">
                    <h1 className="createTitle">{title}</h1>
                    <p className="createSubtitle">{subtitle}</p>
                </div>
            </div>

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
                                    <SaveIcon className="w-4 h-4" />
                                    <span>Crear {entityType}</span>
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