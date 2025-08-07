import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StatsSection from './dashboard/StatsSection';
import QuickActionsSection from './dashboard/QuickActionsSection';
import { DocumentIcon, BuildingIcon, ProcessIcon, ChartIcon } from './icons/DashboardIcons';
import styles from '../styles/components/Dashboard.module.css';

const Dashboard = () => {
    const { apiRequest } = useAuth();
    const [stats, setStats] = useState({
        total_documentos: 0,
        total_direcciones: 0,
        total_procesos: 0
    });
    const [loading, setLoading] = useState(true);

    // Cargar estadísticas optimizadas
    const fetchDashboardData = useMemo(() => async () => {
        try {
            setLoading(true);
            
            // Usar AbortController para cancelar peticiones si es necesario
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
            
            const response = await apiRequest('/documentos/estadisticas');
            
            clearTimeout(timeoutId);
            
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
            // Usar datos por defecto si falla
            setStats({
                total_documentos: 0,
                total_direcciones: 0,
                total_procesos: 0
            });
        } finally {
            setLoading(false);
        }
    }, [apiRequest]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Configuración optimizada de estadísticas
    const statsConfig = useMemo(() => [
        {
            title: 'Total Documentos',
            value: stats.total_documentos,
            subtitle: 'Documentos disponibles en el sistema',
            icon: <DocumentIcon />
        },
        {
            title: 'Direcciones',
            value: stats.total_direcciones,
            subtitle: 'Direcciones administrativas',
            icon: <BuildingIcon />
        },
        {
            title: 'Procesos de Apoyo',
            value: stats.total_procesos,
            subtitle: 'Procesos configurados',
            icon: <ProcessIcon />
        }
    ], [stats]);

    // Configuración optimizada de acciones rápidas
    const actionsConfig = useMemo(() => [
        {
            title: 'Organigrama',
            description: 'Ver estructura organizacional',
            icon: <ChartIcon />,
            action: () => window.location.hash = 'organigrama',
            color: 'blue'
        },
        {
            title: 'Direcciones',
            description: 'Gestionar direcciones administrativas',
            icon: <BuildingIcon />,
            action: () => window.location.hash = 'direcciones',
            color: 'green'
        },
        {
            title: 'Procesos de Apoyo',
            description: 'Administrar procesos de apoyo',
            icon: <ProcessIcon />,
            action: () => window.location.hash = 'procesos',
            color: 'purple'
        },
        {
            title: 'Documentos/Formatos',
            description: 'Gestionar documentos y formatos',
            icon: <DocumentIcon />,
            action: () => window.location.hash = 'documentos',
            color: 'orange'
        }
    ], []);

    return (
        <div className={styles.dashboardContainer}>
            {/* Header optimizado */}
            <div className={styles.dashboardHeader}>
                <h1 className={styles.dashboardTitle}>
                    Panel de Administración
                </h1>
                <p className={styles.dashboardSubtitle}>
                    Gestiona la información documental de la empresa
                </p>
            </div>

            {/* Contenido optimizado con lazy loading */}
            <div className={styles.dashboardContent}>
                {/* Estadísticas con loading optimizado */}
                <StatsSection
                    statsConfig={statsConfig}
                    loading={loading}
                    styles={styles}
                    showDownloads={false}
                    title=""
                    subtitle=""
                />

                {/* Acciones rápidas */}
                <QuickActionsSection
                    actionsConfig={actionsConfig}
                    styles={styles}
                    isUserDashboard={false}
                />
            </div>
        </div>
    );
};

export default Dashboard; 