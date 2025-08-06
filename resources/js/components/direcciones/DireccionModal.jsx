import React from 'react';
import styles from '../../styles/components/Direcciones.module.css';
import { CloseIcon, CodeIcon, DescriptionIcon, ColorIcon } from '../icons/DireccionesIcons';

const DireccionModal = ({ 
    show, 
    mode, 
    formData, 
    onClose, 
    onSubmit, 
    onChange 
}) => {
    if (!show) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
    };

    const handleInputChange = (field, value) => {
        onChange({ ...formData, [field]: value });
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        {mode === 'create' ? 'Nueva Dirección' : 'Editar Dirección'}
                    </h2>
                    <button
                        onClick={onClose}
                        className={styles.closeButton}
                        title="Cerrar modal"
                    >
                        <CloseIcon />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            Nombre *
                        </label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => handleInputChange('nombre', e.target.value)}
                            className={styles.formInput}
                            placeholder="Ingrese el nombre de la dirección"
                            required
                        />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <CodeIcon className="w-4 h-4 inline mr-2" />
                            Código
                        </label>
                        <input
                            type="text"
                            value={formData.codigo}
                            onChange={(e) => handleInputChange('codigo', e.target.value)}
                            className={styles.formInput}
                            placeholder="Ej: DIR-001"
                        />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <DescriptionIcon className="w-4 h-4 inline mr-2" />
                            Descripción
                        </label>
                        <textarea
                            value={formData.descripcion}
                            onChange={(e) => handleInputChange('descripcion', e.target.value)}
                            className={styles.formTextarea}
                            placeholder="Descripción de la dirección y sus responsabilidades..."
                            rows="3"
                        />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <ColorIcon className="w-4 h-4 inline mr-2" />
                            Color de identificación
                        </label>
                        <input
                            type="color"
                            value={formData.color}
                            onChange={(e) => handleInputChange('color', e.target.value)}
                            className={styles.colorInput}
                            title="Seleccionar color"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Este color se usará para identificar la dirección en el sistema
                        </p>
                    </div>
                    
                    <div className={styles.modalButtons}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.cancelButton}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={styles.submitButton}
                        >
                            {mode === 'create' ? 'Crear Dirección' : 'Actualizar Dirección'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DireccionModal; 