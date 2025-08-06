import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/components/CreateForm.module.css';
import { 
    BuildingIcon, 
    ArrowLeftIcon, 
    SaveIcon, 
    CodeIcon, 
    DescriptionIcon, 
    ColorIcon,
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
                return <BuildingIcon className="w-6 h-6" />;
            case 'proceso':
                return <ProcessIcon className="w-6 h-6" />;
            case 'documento':
                return <DocumentIcon className="w-6 h-6" />;
            default:
                return <SettingsIcon className="w-6 h-6" />;
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
                    <div className={styles.formGroup} key={name}>
                        <label htmlFor={name} className={styles.formLabel}>
                            {FieldIcon && <FieldIcon className="w-4 h-4 inline mr-1" />}
                            {label} {required && '*'}
                        </label>
                        <textarea
                            id={name}
                            name={name}
                            value={fieldValue}
                            onChange={handleInputChange}
                            className={`${styles.formTextarea} ${fieldError ? styles.inputError : ''}`}
                            placeholder={placeholder}
                            rows={rows}
                            maxLength={maxLength}
                        />
                        {maxLength && (
                            <div className={styles.textareaFooter}>
                                <span className={styles.charCount}>
                                    {fieldValue.length}/{maxLength} caracteres
                                </span>
                            </div>
                        )}
                        {fieldError && (
                            <span className={styles.errorText}>{fieldError}</span>
                        )}
                    </div>
                );

            case 'color':
                return (
                    <div className={styles.formGroup} key={name}>
                        <label htmlFor={name} className={styles.formLabel}>
                            {FieldIcon && <FieldIcon className="w-4 h-4 inline mr-1" />}
                            {label}
                        </label>
                        <div className={styles.colorInputContainer}>
                            <input
                                type="color"
                                id={name}
                                name={name}
                                value={fieldValue}
                                onChange={handleInputChange}
                                className={styles.colorInput}
                            />
                            <div className={styles.colorPreview}>
                                <span className={styles.colorValue}>{fieldValue}</span>
                                <div 
                                    className={styles.colorSwatch}
                                    style={{ backgroundColor: fieldValue }}
                                ></div>
                            </div>
                        </div>
                        {field.helpText && (
                            <p className={styles.colorHelp}>{field.helpText}</p>
                        )}
                    </div>
                );

            case 'select':
                return (
                    <div className={styles.formGroup} key={name}>
                        <label htmlFor={name} className={styles.formLabel}>
                            {FieldIcon && <FieldIcon className="w-4 h-4 inline mr-1" />}
                            {label} {required && '*'}
                        </label>
                        <select
                            id={name}
                            name={name}
                            value={fieldValue}
                            onChange={handleInputChange}
                            className={`${styles.formSelect} ${fieldError ? styles.inputError : ''}`}
                        >
                            <option value="">{placeholder}</option>
                            {options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {fieldError && (
                            <span className={styles.errorText}>{fieldError}</span>
                        )}
                    </div>
                );

            default:
                return (
                    <div className={styles.formGroup} key={name}>
                        <label htmlFor={name} className={styles.formLabel}>
                            {FieldIcon && <FieldIcon className="w-4 h-4 inline mr-1" />}
                            {label} {required && '*'}
                        </label>
                        <input
                            type={type}
                            id={name}
                            name={name}
                            value={fieldValue}
                            onChange={handleInputChange}
                            className={`${styles.formInput} ${fieldError ? styles.inputError : ''}`}
                            placeholder={placeholder}
                            maxLength={maxLength}
                        />
                        {fieldError && (
                            <span className={styles.errorText}>{fieldError}</span>
                        )}
                    </div>
                );
        }
    };

    const renderSection = (section) => {
        const { title: sectionTitle, icon: SectionIcon, fields: sectionFields } = section;
        
        return (
            <div className={styles.formSection} key={sectionTitle}>
                <h3 className={styles.sectionTitle}>
                    {SectionIcon && <SectionIcon className="w-5 h-5" />}
                    {sectionTitle}
                </h3>
                
                {sectionFields.length === 1 ? (
                    renderField(sectionFields[0])
                ) : (
                    <div className={styles.formGrid}>
                        {sectionFields.map(renderField)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={styles.createFormContainer}>
            {/* Header Compacto */}
            <div className={styles.createHeader}>
                <div className={styles.headerTop}>
                    <button 
                        onClick={handleCancel}
                        className={styles.backButton}
                        aria-label="Volver"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span>Volver</span>
                    </button>
                    
                    <div className={styles.createIcon}>
                        {getEntityIcon(entityType)}
                    </div>
                </div>
                
                <div className={styles.createTitleSection}>
                    <h1 className={styles.createTitle}>{title}</h1>
                    <p className={styles.createSubtitle}>{subtitle}</p>
                </div>
            </div>

            {/* Formulario Organizado */}
            <div className={styles.formContainer}>
                <form onSubmit={handleSubmit} className={styles.createForm}>
                    {/* Error general */}
                    {errors.general && (
                        <div className={styles.errorMessage}>
                            {errors.general}
                        </div>
                    )}

                    {/* Renderizar secciones */}
                    {fields.map(renderSection)}

                    {/* Botones de acción */}
                    <div className={styles.formActions}>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className={styles.cancelButton}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className={styles.loadingSpinner}></div>
                            ) : (
                                <>
                                    <SaveIcon className="w-5 h-5" />
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