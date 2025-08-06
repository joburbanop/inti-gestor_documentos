import React from 'react';
import styles from '../../styles/components/Dashboard.module.css';
import { DocumentIcon, DownloadIcon, BuildingIcon } from '../icons/DashboardIcons';

const StatCard = ({ title, value, icon, gradientClass }) => (
    <div className={`${styles.statCard} ${styles[gradientClass]}`}>
        <div className={styles.statContent}>
            <div className={styles.statInfo}>
                <h3>{title}</h3>
                <div className={styles.statValue}>{value}</div>
                <div className={styles.statDivider}></div>
            </div>
            <div className={styles.statIcon}>
                {icon}
            </div>
        </div>
    </div>
);

const StatsSection = ({ stats, showDownloads = true, showDirections = true }) => {
    return (
        <div className={styles.statsGrid}>
            <StatCard
                title="Total Documentos"
                value={stats?.total_documentos || 0}
                icon={<DocumentIcon className="w-12 h-12" />}
                gradientClass="statCardAzul"
            />

            {showDownloads && (
                <StatCard
                    title="Total Descargas"
                    value={stats?.total_descargas || 0}
                    icon={<DownloadIcon className="w-12 h-12" />}
                    gradientClass="statCardNaranja"
                />
            )}

            {showDirections && (
                <StatCard
                    title="Direcciones"
                    value={stats?.por_direccion?.length || 0}
                    icon={<BuildingIcon className="w-12 h-12" />}
                    gradientClass="statCardMorado"
                />
            )}
        </div>
    );
};

export default StatsSection; 