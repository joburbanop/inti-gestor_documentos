import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { INTILED_COLORS } from '../config/colors';
import styles from '../styles/components/Dashboard.module.css';

const Dashboard = () => {
    const { user, apiRequest } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentDocuments, setRecentDocuments] = useState([]);
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

                // Obtener documentos recientes
                const recentResponse = await apiRequest('/api/documentos/recientes');
                if (recentResponse.success) {
                    setRecentDocuments(recentResponse.data);
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

    const QuickActionCard = ({ title, description, icon, hash, colorClass }) => (
        <button
            onClick={() => handleNavigation(hash)}
            className={styles.quickActionCard}
        >
            <div className={styles.quickActionContent}>
                <div className={`${styles.quickActionIcon} ${styles[colorClass]}`}>
                    {icon}
                </div>
                <div className={styles.quickActionText}>
                    <h3>{title}</h3>
                    <p>{description}</p>
                </div>
                <div className="text-gray-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </button>
    );

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
            <div className={styles.statsGrid}>
                <StatCard
                    title="Total Documentos"
                    value={stats?.total_documentos || 0}
                    icon="📄"
                    gradientClass="statCardAzul"
                />

                <StatCard
                    title="Total Descargas"
                    value={stats?.total_descargas || 0}
                    icon="⬇️"
                    gradientClass="statCardNaranja"
                />
                <StatCard
                    title="Direcciones"
                    value={stats?.por_direccion?.length || 0}
                    icon="🏢"
                    gradientClass="statCardMorado"
                />
            </div>

            {/* Acciones Rápidas */}
            <div className={styles.quickActionsGrid}>
                <QuickActionCard
                    title="Gestionar Direcciones"
                    description="Administra las direcciones y departamentos de la organización"
                    icon="🏢"
                    hash="direcciones"
                    colorClass="quickActionIconAzul"
                />
                <QuickActionCard
                    title="Procesos de Apoyo"
                    description="Configura y gestiona los procesos de apoyo"
                    icon="⚙️"
                    hash="procesos"
                    colorClass="quickActionIconVerde"
                />
                <QuickActionCard
                    title="Documentos"
                    description="Accede y gestiona todos los documentos del sistema"
                    icon="📁"
                    hash="documentos"
                    colorClass="quickActionIconNaranja"
                />
                {user?.is_admin && (
                    <QuickActionCard
                        title="Administración"
                        description="Panel de administración del sistema"
                        icon="🔧"
                        hash="administracion"
                        colorClass="quickActionIconMorado"
                    />
                )}
            </div>

            {/* Documentos Recientes */}
            {recentDocuments.length > 0 && (
                <div className={styles.recentDocumentsSection}>
                    <div className={styles.recentDocumentsHeader}>
                        <h2 className={styles.recentDocumentsTitle}>Documentos Recientes</h2>
                        <button
                            onClick={() => handleNavigation('documentos')}
                            className={styles.viewAllButton}
                        >
                            Ver todos
                        </button>
                    </div>
                    <div className={styles.recentDocumentsList}>
                        {recentDocuments.slice(0, 5).map((doc) => (
                            <div key={doc.id} className={styles.documentItem}>
                                <div className={`${styles.documentIcon} ${styles[`documentIcon${doc.tipo_archivo?.toUpperCase()}`] || styles.documentIconDoc}`}>
                                    {doc.tipo_archivo === 'pdf' ? '📄' : doc.tipo_archivo === 'xlsx' ? '📊' : '📝'}
                                </div>
                                <div className={styles.documentInfo}>
                                    <div className={styles.documentTitle}>{doc.titulo}</div>
                                    <div className={styles.documentMeta}>
                                        {doc.direccion?.nombre} • {doc.proceso_apoyo?.nombre}
                                    </div>
                                </div>
                                <div className={styles.documentDate}>
                                    {new Date(doc.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard; 