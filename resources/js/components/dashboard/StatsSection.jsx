import React from 'react';
import { DocumentIcon, DownloadIcon, BuildingIcon } from '../icons/DashboardIcons';

const StatsSection = ({ 
    stats, 
    showDownloads = true, 
    showDirections = true,
    showDocuments = true,
    showProcesses = false,
    title = "Estadísticas del Sistema",
    subtitle = "Resumen de la actividad del sistema",
    statsConfig = [],
    styles = {},
    className = "",
    loading = false
}) => {
    // Configuración por defecto si no se proporciona statsConfig
    const defaultStatsConfig = [
        ...(showDocuments ? [{
            title: "Total Documentos",
            value: stats?.total_documentos || 0,
            icon: <DocumentIcon className="w-8 h-8" />,
            colorClass: "statCardAzul",
            description: "Documentos disponibles en el sistema"
        }] : []),
        ...(showDownloads ? [{
            title: "Total Descargas",
            value: stats?.total_descargas || 0,
            icon: <DownloadIcon className="w-8 h-8" />,
            colorClass: "statCardNaranja",
            description: "Descargas realizadas"
        }] : []),
        ...(showDirections ? [{
            title: "Direcciones",
            value: stats?.total_direcciones || 0,
            icon: <BuildingIcon className="w-8 h-8" />,
            colorClass: "statCardVerde",
            description: "Direcciones administrativas"
        }] : []),
        ...(showProcesses ? [{
            title: "Procesos de Apoyo",
            value: stats?.total_procesos || 0,
            icon: <BuildingIcon className="w-8 h-8" />,
            colorClass: "statCardMorado",
            description: "Procesos configurados"
        }] : [])
    ];

    const finalStatsConfig = statsConfig.length > 0 ? statsConfig : defaultStatsConfig;

    if (!stats && statsConfig.length === 0) {
        return null;
    }

    return (
        <div className={`${styles.statsSection || ''} ${className}`}>
            {(title && title.trim() !== '') || (subtitle && subtitle.trim() !== '') ? (
                <div className={styles.statsHeader || ''}>
                    {title && title.trim() !== '' && <h2 className={styles.statsTitle || ''}>{title}</h2>}
                    {subtitle && subtitle.trim() !== '' && <p className={styles.statsSubtitle || ''}>{subtitle}</p>}
                </div>
            ) : null}
            
            <div className={styles.statsGrid || ''}>
                {finalStatsConfig.map((stat, index) => (
                    <div 
                        key={index} 
                        className={`${styles.statCard || ''} ${styles[stat.colorClass] || ''}`}
                    >
                        <div className={styles.statContent || ''}>
                            <div className={styles.statInfo || ''}>
                                <h3>{stat.title}</h3>
                                <div className={styles.statValue || ''}>
                                    {loading ? '...' : (stat.value?.toLocaleString() || '0')}
                                </div>
                                {stat.description && (
                                    <p className={styles.statDescription || ''}>
                                        {stat.description}
                                    </p>
                                )}
                            </div>
                            <div className={styles.statIcon || ''}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatsSection; 