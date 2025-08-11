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
    onChange,
    initialData = {},
    loading = false,
    errors = {},
    isModal = false
}) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialData);
    const [multiSelectOpen, setMultiSelectOpen] = useState(null);
    const [etiquetasDisponibles, setEtiquetasDisponibles] = useState([]);
    const [showEtiquetasDropdown, setShowEtiquetasDropdown] = useState(false);

    // Componente interno para gestionar entrada de etiquetas con píldoras
    const TagsInput = ({ name, value = [], placeholder, disabled = false }) => {
        const [inputValue, setInputValue] = useState('');
        const [showDropdown, setShowDropdown] = useState(false);

        const addTag = (raw) => {
            if (!raw) return;
            const tag = String(raw).trim();
            if (tag.length === 0) return;
            setFormData(prev => {
                const current = Array.isArray(prev[name]) ? prev[name] : [];
                if (current.some(t => String(t).toLowerCase() === tag.toLowerCase())) {
                    return prev;
                }
                const updated = { ...prev, [name]: [...current, tag] };
                if (onChange) { try { onChange(updated); } catch (_) {} }
                return updated;
            });
            setInputValue('');
            setShowDropdown(false);
        };

        const removeTag = (tagToRemove) => {
            setFormData(prev => {
                const current = Array.isArray(prev[name]) ? prev[name] : [];
                const updated = { ...prev, [name]: current.filter(t => t !== tagToRemove) };
                if (onChange) { try { onChange(updated); } catch (_) {} }
                return updated;
            });
        };

        const onKeyDown = (e) => {
            if (disabled) return;
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addTag(inputValue);
            } else if (e.key === 'Backspace' && inputValue === '') {
                // Borrar la última etiqueta con backspace si input está vacío
                const current = Array.isArray(value) ? value : [];
                if (current.length > 0) removeTag(current[current.length - 1]);
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                // Manejar navegación del dropdown
                e.preventDefault();
            }
        };

        const handleInputChange = (e) => {
            const newValue = e.target.value;
            setInputValue(newValue);
            setShowDropdown(newValue.length > 0);
        };

        const handleInputFocus = () => {
            if (inputValue.length > 0) {
                setShowDropdown(true);
            }
        };

        const handleInputBlur = () => {
            // Delay para permitir clicks en el dropdown
            setTimeout(() => {
                setShowDropdown(false);
                if (inputValue.trim()) {
                    addTag(inputValue);
                }
            }, 300);
        };

        // Filtrar etiquetas disponibles basadas en el input
        const filteredEtiquetas = etiquetasDisponibles.filter(etiqueta =>
            etiqueta.toLowerCase().includes(inputValue.toLowerCase())
        );

        return (
            <div className="tagsContainer" style={{ position: 'relative' }}>
                <div className="tagsPills">
                    {(Array.isArray(value) ? value : []).map((tag) => (
                        <span key={tag} className="tagPill">
                            {tag}
                            <button type="button" className="tagRemove" onClick={() => removeTag(tag)} aria-label={`Eliminar etiqueta ${tag}`}>×</button>
                        </span>
                    ))}
                    <input
                        type="text"
                        className="tagsInput"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={onKeyDown}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder={placeholder}
                        disabled={disabled}
                    />
                </div>
                
                {/* Dropdown de etiquetas disponibles */}
                {showDropdown && filteredEtiquetas.length > 0 && (
                    <div 
                        className="etiquetasDropdown" 
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            zIndex: 1002,
                            maxHeight: '200px',
                            overflowY: 'auto',
                            marginTop: '4px'
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        {filteredEtiquetas.map((etiqueta) => {
                            const isSelected = value.some(v => v.toLowerCase() === etiqueta.toLowerCase());
                            return (
                                <div
                                    key={etiqueta}
                                    className="etiquetaOption"
                                    style={{
                                        padding: '8px 12px',
                                        cursor: isSelected ? 'default' : 'pointer',
                                        borderBottom: '1px solid #f3f4f6',
                                        backgroundColor: isSelected ? '#f0f9ff' : 'white',
                                        color: isSelected ? '#1F448B' : '#374151',
                                        opacity: isSelected ? 0.6 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        if (!isSelected) {
                                            addTag(etiqueta);
                                        }
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) {
                                            e.target.style.backgroundColor = '#f8f9fa';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) {
                                            e.target.style.backgroundColor = 'white';
                                        }
                                    }}
                                >
                                    <span>{etiqueta}</span>
                                    {isSelected && (
                                        <span style={{
                                            fontSize: '0.75rem',
                                            color: '#1F448B',
                                            fontWeight: '500'
                                        }}>
                                            ✓ Seleccionada
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                        {inputValue && !filteredEtiquetas.some(e => e.toLowerCase() === inputValue.toLowerCase()) && !value.some(v => v.toLowerCase() === inputValue.toLowerCase()) && (
                            <div
                                className="etiquetaOption"
                                style={{
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #f3f4f6',
                                    backgroundColor: '#f0f9ff',
                                    color: '#1F448B',
                                    fontWeight: '500'
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    addTag(inputValue);
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#e0f2fe'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#f0f9ff'}
                            >
                                Crear "{inputValue}"
                            </div>
                        )}
                        {inputValue && filteredEtiquetas.length === 0 && !value.some(v => v.toLowerCase() === inputValue.toLowerCase()) && (
                            <div
                                style={{
                                    padding: '8px 12px',
                                    color: '#6b7280',
                                    fontSize: '0.875rem',
                                    fontStyle: 'italic',
                                    textAlign: 'center'
                                }}
                            >
                                No se encontraron etiquetas que coincidan con "{inputValue}"
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Actualizar formData cuando cambie initialData
    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormData(initialData);
        }
    }, [initialData]);

    // Cargar etiquetas disponibles
    useEffect(() => {
        const loadEtiquetas = async () => {
            try {
                const response = await fetch('/api/documentos/etiquetas', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setEtiquetasDisponibles(data.data || []);
                }
            } catch (error) {
                console.error('Error al cargar etiquetas:', error);
            }
        };
        
        loadEtiquetas();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            const file = files && files.length > 0 ? files[0] : null;
            setFormData(prev => {
                const updated = { ...prev, [name]: file };
                if (onChange) {
                    try { onChange(updated); } catch (_) {}
                }
                return updated;
            });
            return;
        }
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            if (onChange) {
                try { onChange(updated); } catch (_) {}
            }
            return updated;
        });
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

        // Debug removido para campos select
        if (type === 'select' && name === 'procesos_apoyo') {
            //
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

            case 'tags':
                return (
                    <div className="formGroup" key={name}>
                        <label htmlFor={name} className="formLabel">
                            {label} {required && '*'}
                        </label>
                        <TagsInput
                            name={name}
                            value={Array.isArray(fieldValue) ? fieldValue : []}
                            placeholder={placeholder}
                            disabled={field.disabled}
                        />
                        {fieldError && (
                            <span className="errorText">{fieldError}</span>
                        )}
                    </div>
                );

            case 'multiselect':
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
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (field.onAddClick) {
                                            field.onAddClick();
                                        }
                                    }}
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
                                {(() => {
                                    console.log('🔍 CreateForm: field.hasAddButton para', name, ':', field.hasAddButton);
                                    return field.hasAddButton;
                                })() && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            console.log('🔍 CreateForm: Botón de agregar clickeado para campo múltiple:', name);
                                            console.log('🔍 CreateForm: field.onAddClick existe:', !!field.onAddClick);
                                            console.log('🔍 CreateForm: field.onAddClick tipo:', typeof field.onAddClick);
                                            if (field.onAddClick) {
                                                console.log('🔍 CreateForm: Ejecutando field.onAddClick');
                                                console.log('🔍 CreateForm: field.onAddClick.toString():', field.onAddClick.toString());
                                                try {
                                                    field.onAddClick();
                                                    console.log('🔍 CreateForm: field.onAddClick ejecutado sin errores');
                                                } catch (error) {
                                                    console.error('🔍 CreateForm: Error al ejecutar field.onAddClick:', error);
                                                }
                                            }
                                        }}
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
                                disabled={field.disabled}
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

            case 'file':
                return (
                    <div className="formGroup" key={name}>
                        <label htmlFor={name} className="formLabel">
                            {label} {required && '*'}
                        </label>
                        <input
                            type="file"
                            id={name}
                            name={name}
                            onChange={handleInputChange}
                            className={`formInput ${fieldError ? 'inputError' : ''}`}
                            accept={field.accept}
                        />
                        {field.helpText && (
                            <div className="helpText">
                                {field.helpText}
                            </div>
                        )}
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
                                    disabled={field.disabled}
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