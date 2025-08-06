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
                
                // Obtener estadísticas
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

    const handleNavigation = (hash) => {
        window.location.hash = hash;
    };

    if (loading) {
        return (
            <div className={styles.loadingSpinner}>
                <div className={styles.spinner}></div>
                <p className="text-gray-600 text-lg font-medium mt-4">Cargando dashboard...</p>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>Dashboard</h1>
                <p className={styles.subtitle}>
                    Bienvenido de vuelta, {user?.name}. Aquí tienes un resumen de tu actividad.
                </p>
            </div>

            {/* Estadísticas */}
            <StatsSection 
                stats={stats}
                showDownloads={true}
                showDirections={true}
            />

            {/* Acciones Rápidas */}
            <QuickActionsSection 
                user={user}
                showAdmin={true}
                showDirections={true}
                showProcesses={true}
                showDocuments={true}
                onActionClick={handleNavigation}
            />
        </div>
    );
};

export default Dashboard; 