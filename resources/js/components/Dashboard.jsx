import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/components/Dashboard.module.css';

// Componentes modulares
import StatsSection from './dashboard/StatsSection';
import QuickActionsSection from './dashboard/QuickActionsSection';

const Dashboard = () => {
    const { user, apiRequest } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                
                // Obtener estadísticas del sistema
                const statsResponse = await apiRequest('/api/documentos/estadisticas');
                if (statsResponse.success) {
                    setStats(statsResponse.data);
                }
            } catch (error) {
                console.error('Error al cargar datos del dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [apiRequest]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p className="text-gray-600 text-lg font-medium mt-4">
                    Cargando panel de administración...
                </p>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>Panel de Administración</h1>
                <p className={styles.subtitle}>
                    Bienvenido, {user?.name}. Gestiona la estructura organizacional y la información documental de la empresa.
                </p>
            </div>

            {/* Estadísticas del sistema */}
            <StatsSection 
                stats={stats}
                showDownloads={false}
                showDirections={true}
                showDocuments={true}
                showProcesses={true}
                title=""
                subtitle=""
                styles={styles}
            />

            {/* Acciones rápidas para administradores */}
            <QuickActionsSection 
                user={user}
                showAdmin={true}
                showDirections={true}
                showProcesses={true}
                showDocuments={true}
                isUserDashboard={false}
                styles={styles}
                onActionClick={(hash) => {
                    // Navegar a la sección correspondiente
                    window.location.hash = hash;
                }}
            />
        </div>
    );
};

export default Dashboard; 