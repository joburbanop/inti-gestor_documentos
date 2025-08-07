import React from 'react';
import styles from '../../styles/components/ProcesosApoyo.module.css';

const ProcesoApoyoCard = ({ proceso, onEdit, onDelete }) => {
    const handleEdit = (e) => {
        e.stopPropagation();
        onEdit(proceso);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(proceso);
    };

    return (
        <div className={styles.procesoCard}>
            {/* Header con botones de acción */}
            <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <div className={styles.cardActions}>
                    <button
                        onClick={handleEdit}
                        className={styles.editButton}
                        title="Editar proceso"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={handleDelete}
                        className={styles.deleteButton}
                        title="Eliminar proceso"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Contenido principal */}
            <div className={styles.cardContent}>
                <h3 className={styles.procesoTitle}>{proceso.nombre}</h3>
                
                <div className={styles.procesoCodigo}>
                    {proceso.codigo}
                </div>
                
                {proceso.descripcion && (
                    <p className={styles.procesoDescripcion}>
                        {proceso.descripcion}
                    </p>
                )}

                {/* Dirección asociada */}
                {proceso.direccion && (
                    <div className={styles.direccionInfo}>
                        <span className={styles.direccionLabel}>Dirección:</span>
                        <span 
                            className={styles.direccionNombre}
                            style={{ 
                                color: proceso.direccion.color || '#1F448B',
                                backgroundColor: `${proceso.direccion.color || '#1F448B'}20`
                            }}
                        >
                            {proceso.direccion.nombre}
                        </span>
                    </div>
                )}
            </div>

            {/* Estadísticas */}
            <div className={styles.cardStats}>
                <div className={styles.statItem}>
                    <span className={styles.statNumber}>
                        {proceso.estadisticas?.total_documentos || 0}
                    </span>
                    <span className={styles.statLabel}>DOCUMENTOS</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statNumber}>
                        {proceso.orden || 0}
                    </span>
                    <span className={styles.statLabel}>ORDEN</span>
                </div>
            </div>
        </div>
    );
};

export default ProcesoApoyoCard; 