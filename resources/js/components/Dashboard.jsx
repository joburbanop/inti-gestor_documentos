import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StatsSection from './dashboard/StatsSection';
import QuickActionsSection from './dashboard/QuickActionsSection';
import { DocumentIcon, BuildingIcon, ProcessIcon, AdminIcon } from './icons/DashboardIcons';
import styles from '../styles/components/Dashboard.module.css';
import DashboardHeader from './dashboard/DashboardHeader';
import { useHasPermission } from '../hooks/useAuthorization';
import { PERMISSIONS } from '../roles/permissions';

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

   

    const canManageUsers = useHasPermission(PERMISSIONS.MANAGE_USERS);
    const canManageDocs = useHasPermission(PERMISSIONS.MANAGE_DOCUMENTS);

    // Carga dinámica de conteos por tipo para construir acciones (rápido + cache backend)
    const [tipoCounts, setTipoCounts] = useState({});
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await apiRequest('/procesos/tipos/stats');
                if (res?.success && mounted) setTipoCounts(res.data || {});
            } catch {}
        })();
        return () => { mounted = false; };
    }, [apiRequest]);

    const actionsConfig = useMemo(() => {
        const items = [];
        const push = (title, desc, hash, icon, color) => items.push({ title, description: desc, hash, icon, colorClass: color });
        if (tipoCounts.estrategico > 0) push('Procesos Estratégicos', 'Explora procesos estratégicos.', 'procesos/estrategico', <BuildingIcon className="w-6 h-6" />, 'quickActionIconAzul');
        if (tipoCounts.misional > 0) push('Procesos Misionales', 'Explora procesos misionales.', 'procesos/misional', <ProcessIcon className="w-6 h-6" />, 'quickActionIconVerde');
        if (tipoCounts.apoyo > 0) push('Procesos de Apoyo', 'Procesos que soportan la operación.', 'procesos/apoyo', <ProcessIcon className="w-6 h-6" />, 'quickActionIconMorado');
        if (tipoCounts.evaluacion > 0) push('Procesos de Evaluación', 'Evaluación y mejora continua.', 'procesos/evaluacion', <ProcessIcon className="w-6 h-6" />, 'quickActionIconMorado');
        // Siempre documentos
        push('Formatos o Documentos', 'Crea y consulta documentos.', 'documentos', <DocumentIcon className="w-6 h-6" />, 'quickActionIconNaranja');
        if (canManageUsers) {
            push('Administración', 'Usuarios, roles y noticias/circulares.', 'administracion', <AdminIcon className="w-6 h-6" />, 'quickActionIconMorado');
        }
        return items;
    }, [tipoCounts, canManageUsers]);

    return (
        <div className={styles.dashboardContainer}>
            <DashboardHeader
                title="Panel de Control"
                subtitle="Documentos y procesos de la empresa organizados por tipo"
                rightSlot={(
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
                )}
            />

            {/* Contenido */}
            <div className={styles.dashboardContent}>
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