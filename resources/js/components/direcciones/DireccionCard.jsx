import React from 'react';
import { EditIcon, DeleteIcon } from '../icons/CrudIcons';
import styles from '../../styles/components/Direcciones.module.css';

const DireccionCard = ({ 
    direccion, 
    user, 
    onEdit, 
    onDelete
}) => {

    return (
        <div 
            className={styles.direccionCard}
            style={{ 
                '--direccion-color': direccion.color,
                '--direccion-color-light': direccion.color + '20'
            }}
        >
            {/* Header de la tarjeta */}
            <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                {user?.is_admin && (
                    <div className={styles.cardActions}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(direccion);
                            }}
                            className={styles.editButton}
                            title="Editar dirección"
                        >
                            <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(direccion);
                            }}
                            className={styles.deleteButton}
                            title="Eliminar dirección"
                        >
                            <DeleteIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Contenido */}
            <div className={styles.cardContent}>
                <h3 className={styles.direccionTitle}>{direccion.nombre}</h3>
                
                {direccion.codigo && (
                    <div className={styles.direccionCodigo}>
                        {direccion.codigo}
                    </div>
                )}
                
                {direccion.descripcion && (
                    <p className={styles.direccionDescripcion}>
                        {direccion.descripcion}
                    </p>
                )}
            </div>

            {/* Estadísticas */}
            <div className={styles.direccionStats}>
                <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                        <div className={styles.statValue}>
                            {direccion.estadisticas?.total_procesos || 0}
                        </div>
                        <div className={styles.statLabel}>
                            Categorías
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