import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StatsSection from './dashboard/StatsSection';
import QuickActionsSection from './dashboard/QuickActionsSection';
import { DocumentIcon, BuildingIcon, ProcessIcon, AdminIcon } from './icons/DashboardIcons';
import styles from '../styles/components/Dashboard.module.css';

const Dashboard = () => {
    const { apiRequest } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_documentos: 0,
        total_direcciones: 0,
        total_procesos: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar estadísticas optimizadas con useCallback
    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Usar AbortController para cancelar peticiones si es necesario
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // Reducido a 3 segundos
            
            const response = await apiRequest('/documentos/estadisticas', {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error al cargar estadísticas:', error);
                setError('Error al cargar datos');
                // Usar datos por defecto si falla
                setStats({
                    total_documentos: 0,
                    total_direcciones: 0,
                    total_procesos: 0
                });
            }
        } finally {
            setLoading(false);
        }
    }, [apiRequest]);

    useEffect(() => {
        // Cargar datos solo al montar el componente
        fetchDashboardData();
        
        // No actualizar automáticamente para evitar recargas
        // El usuario puede actualizar manualmente si es necesario
    }, [fetchDashboardData]);

    // Función para actualizar manualmente
    const handleRefresh = useCallback(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Configuración optimizada de estadísticas con memoización
    const statsConfig = useMemo(() => [
        {
            title: 'Total Documentos',
            value: stats.total_documentos,
            subtitle: 'Documentos disponibles en el sistema',
            icon: <DocumentIcon className="w-8 h-8" />,
            colorClass: 'statCardAzul'
        },
        {
            title: 'Direcciones',
            value: stats.total_direcciones,
            subtitle: 'Direcciones administrativas',
            icon: <BuildingIcon className="w-8 h-8" />,
            colorClass: 'statCardVerde'
        },
        {
            title: 'Procesos de Apoyo',
            value: stats.total_procesos,
            subtitle: 'Procesos configurados',
            icon: <ProcessIcon className="w-8 h-8" />,
            colorClass: 'statCardMorado'
        }
    ], [stats.total_documentos, stats.total_direcciones, stats.total_procesos]);

    // Configuración optimizada de acciones rápidas con memoización
    const actionsConfig = useMemo(() => [
        {
            title: 'Direcciones',
            description: 'Crear, editar y eliminar direcciones administrativas. Organiza la estructura de la empresa evitando carpetas desordenadas.',
            icon: <BuildingIcon className="w-6 h-6" />,
            hash: 'direcciones',
            colorClass: 'quickActionIconAzul'
        },
        {
            title: 'Procesos de Apoyo',
            description: 'Crear, editar y eliminar procesos dentro de cada dirección. Define flujos de trabajo y procedimientos administrativos.',
            icon: <ProcessIcon className="w-6 h-6" />,
            hash: 'procesos',
            colorClass: 'quickActionIconVerde'
        },
        {
            title: 'Formatos o Documentos',
            description: 'Crear, editar y eliminar documentos del sistema. Organiza la información por dirección y proceso para fácil acceso.',
            icon: <DocumentIcon className="w-6 h-6" />,
            hash: 'documentos',
            colorClass: 'quickActionIconNaranja'
        },
        {
            title: 'Administración',
            description: 'Crear, editar y eliminar usuarios y permisos. Gestiona el acceso y mantiene la seguridad del sistema.',
            icon: <AdminIcon className="w-6 h-6" />,
            hash: 'administracion',
            colorClass: 'quickActionIconMorado'
        }
    ], []); // Memoizado sin dependencias ya que es estático

    return (
        <div className={styles.dashboardContainer}>
            {/* Header optimizado */}
            <div className={styles.dashboardHeader}>
                <div className={styles.headerContent}>
                    <div>
                        <h1 className={styles.dashboardTitle}>
                            Panel de Administración
                        </h1>
                        <p className={styles.dashboardSubtitle}>
                            Gestiona la información documental de la empresa
                        </p>
                    </div>
                    <button
                        onClick={fetchDashboardData}
                        disabled={loading}
                        className={styles.refreshButton}
                        title="Actualizar datos"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {loading ? 'Actualizando...' : 'Actualizar'}
                    </button>
                </div>
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
                    onActionClick={(hash) => { if (hash) navigate(hash.startsWith('/') ? hash : `/${hash}`); }}
                />
            </div>
        </div>
    );
};

export default Dashboard; 