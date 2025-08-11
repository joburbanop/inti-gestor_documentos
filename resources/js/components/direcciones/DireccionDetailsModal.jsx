import React from 'react';
import styles from '../../styles/components/Direcciones.module.css';
import { CloseIcon, CodeIcon, DescriptionIcon, StatsIcon, ProcessIcon, DocumentIcon } from '../icons/DireccionesIcons';

const DireccionDetailsModal = ({ 
    direccion, 
    onClose 
}) => {
    if (!direccion) return null;

    return (
        <div className={styles.detailsModalOverlay} onClick={onClose}>
            <div 
                className={styles.detailsModal} 
                onClick={(e) => e.stopPropagation()}
                style={{ 
                    '--direccion-color': direccion.color
                }}
            >
                <div className={styles.detailsHeader}>
                    <h2 className={styles.detailsTitle}>
                        {direccion.nombre}
                    </h2>
                    <button
                        onClick={onClose}
                        className={styles.closeButton}
                        title="Cerrar modal"
                    >
                        <CloseIcon />
                    </button>
                </div>
                
                <div className={styles.detailsContent}>
                    {direccion.codigo && (
                        <div className={styles.detailSection}>
                            <h3>
                                <CodeIcon className="w-4 h-4 inline mr-2" />
                                Código
                            </h3>
                            <p>{direccion.codigo}</p>
                        </div>
                    )}
                    
                    {direccion.descripcion && (
                        <div className={styles.detailSection}>
                            <h3>
                                <DescriptionIcon className="w-4 h-4 inline mr-2" />
                                Descripción
                            </h3>
                            <p>{direccion.descripcion}</p>
                        </div>
                    )}
                    
                    <div className={styles.detailSection}>
                        <h3>
                            <StatsIcon className="w-4 h-4 inline mr-2" />
                            Estadísticas
                        </h3>
                        <div className={styles.detailsStats}>
                            <div className={styles.detailStat}>
                                <div className={styles.detailStatValue}>
                                    {direccion.estadisticas?.total_procesos || 0}
                                </div>
                                <div className={styles.detailStatLabel}>
                                    <ProcessIcon className="w-4 h-4 inline mr-1" />
                                    Categorías
                                </div>
                            </div>
                            <div className={styles.detailStat}>
                                <div className={styles.detailStatValue}>
                                    {direccion.estadisticas?.total_documentos || 0}
                                </div>
                                <div className={styles.detailStatLabel}>
                                    <DocumentIcon className="w-4 h-4 inline mr-1" />
                                    Documentos
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información adicional */}
                    <div className={styles.detailSection}>
                        <h3>
                            <StatsIcon className="w-4 h-4 inline mr-2" />
                            Información General
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Fecha de creación:</p>
                                <p className="text-sm text-gray-900">
                                    {new Date(direccion.created_at).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Última actualización:</p>
                                <p className="text-sm text-gray-900">
                                    {new Date(direccion.updated_at).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Color de identificación */}
                    <div className={styles.detailSection}>
                        <h3>Color de identificación</h3>
                        <div className="flex items-center gap-3">
                            <div 
                                className="w-8 h-8 rounded-full border-2 border-gray-200"
                                style={{ backgroundColor: direccion.color }}
                            />
                            <span className="text-sm font-mono text-gray-600">
                                {direccion.color}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DireccionDetailsModal; 