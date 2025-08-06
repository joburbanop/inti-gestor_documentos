import React from 'react';
import styles from '../../styles/components/Direcciones.module.css';
import { EditIcon, DeleteIcon } from '../icons/DireccionesIcons';

const DireccionCard = ({ 
    direccion, 
    user, 
    onEdit, 
    onDelete, 
    onViewDetails 
}) => {
    const handleCardClick = (e) => {
        // Evitar que se active si se hace clic en los botones de acción
        if (e.target.closest('button')) {
            return;
        }
        onViewDetails(direccion);
    };

    return (
        <div 
            className={styles.direccionCard}
            style={{ 
                '--direccion-color': direccion.color,
                '--direccion-color-light': direccion.color + '20'
            }}
            onClick={handleCardClick}
        >
            {/* Header de la tarjeta */}
            <div className={styles.cardHeader}>
                <div 
                    className={styles.colorIndicator}
                    style={{ backgroundColor: direccion.color }}
                />
                {user?.is_admin && (
                    <div className={styles.actionButtons}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(direccion);
                            }}
                            className={`${styles.actionButton} ${styles.editButton}`}
                            title="Editar dirección"
                        >
                            <EditIcon className="w-3 h-3" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(direccion);
                            }}
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            title="Eliminar dirección"
                        >
                            <DeleteIcon className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>

            {/* Contenido */}
            <div className={styles.cardContent}>
                <h3>{direccion.nombre}</h3>
                
                {direccion.codigo && (
                    <div className={styles.cardCode}>
                        {direccion.codigo}
                    </div>
                )}
                
                {direccion.descripcion && (
                    <p className={styles.cardDescription}>
                        {direccion.descripcion}
                    </p>
                )}
            </div>

            {/* Estadísticas - Sin iconos */}
            <div className={styles.statsSection}>
                <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                        <div className={styles.statValue}>
                            {direccion.estadisticas?.total_procesos || 0}
                        </div>
                        <div className={styles.statLabel}>
                            Procesos
                        </div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statValue}>
                            {direccion.estadisticas?.total_documentos || 0}
                        </div>
                        <div className={styles.statLabel}>
                            Documentos
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DireccionCard; 