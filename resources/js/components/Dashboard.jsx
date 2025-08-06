import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { INTILED_COLORS, INTILED_GRADIENTS } from '../config/colors';

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

    const StatCard = ({ title, value, icon, gradient }) => (
        <div 
            className="p-6 rounded-2xl shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl relative overflow-hidden"
            style={{ 
                background: gradient,
                color: 'white'
            }}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm opacity-90 font-medium mb-2">{title}</p>
                    <p className="text-4xl font-bold mb-1">{value}</p>
                    <div className="w-12 h-1 rounded-full bg-white opacity-30"></div>
                </div>
                <div className="text-5xl opacity-80 drop-shadow-lg">
                    {icon}
                </div>
            </div>
        </div>
    );

    const QuickActionCard = ({ title, description, icon, hash, color }) => (
        <button
            onClick={() => handleNavigation(hash)}
            className="block w-full p-6 rounded-2xl shadow-lg transition-all duration-500 hover:shadow-2xl hover:scale-105 border border-gray-100 text-left bg-white"
        >
            <div className="flex items-center space-x-4">
                <div 
                    className="p-4 rounded-2xl text-white text-2xl shadow-lg drop-shadow-lg"
                    style={{ backgroundColor: color }}
                >
                    {icon}
                </div>
                <div className="flex-1">
                    <h3 
                        className="text-lg font-bold mb-2"
                        style={{ color: INTILED_COLORS.azul }}
                    >
                        {title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
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
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto mb-6"></div>
                    <p className="text-gray-600 text-lg font-medium">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="text-center">
                <h1 
                    className="text-5xl font-bold mb-4"
                    style={{ 
                        background: `linear-gradient(135deg, ${INTILED_COLORS.azul} 0%, ${INTILED_COLORS.azulClaro} 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}
                >
                    ¡Bienvenido, {user?.name}!
                </h1>
                <p className="text-xl text-gray-600 mb-4">
                    Sistema de Gestión de Documentación - Intranet Inti
                </p>
                <div className="w-32 h-1 mx-auto rounded-full" style={{ background: `linear-gradient(90deg, ${INTILED_COLORS.azul} 0%, ${INTILED_COLORS.naranja} 100%)` }}></div>
            </div>

            {/* Estadísticas */}
            {stats && (
                <div>
                    <h2 
                        className="text-3xl font-bold text-center mb-8"
                        style={{ color: INTILED_COLORS.azul }}
                    >
                        📊 Resumen General
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <StatCard
                            title="Total Documentos"
                            value={stats.total_documentos}
                            icon="📄"
                            gradient={INTILED_GRADIENTS.azul}
                        />
                        <StatCard
                            title="Documentos Públicos"
                            value={stats.documentos_publicos}
                            icon="🌐"
                            gradient={INTILED_GRADIENTS.verde}
                        />
                        <StatCard
                            title="Total Descargas"
                            value={stats.total_descargas}
                            icon="⬇️"
                            gradient={INTILED_GRADIENTS.naranja}
                        />
                        <StatCard
                            title="Direcciones Activas"
                            value={stats.por_direccion?.length || 0}
                            icon="🏢"
                            gradient={INTILED_GRADIENTS.morado}
                        />
                    </div>
                </div>
            )}

            {/* Acciones Rápidas */}
            <div>
                <h2 
                    className="text-3xl font-bold text-center mb-8"
                    style={{ color: INTILED_COLORS.azul }}
                >
                    ⚡ Acciones Rápidas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <QuickActionCard
                        title="Ver Direcciones"
                        description="Explora todas las direcciones y sus procesos de apoyo organizados"
                        icon="🏢"
                        hash="direcciones"
                        color={INTILED_COLORS.azul}
                    />
                    <QuickActionCard
                        title="Gestionar Documentos"
                        description="Sube, edita y organiza documentos de manera eficiente"
                        icon="📁"
                        hash="documentos"
                        color={INTILED_COLORS.verde}
                    />
                    <QuickActionCard
                        title="Buscar Documentos"
                        description="Encuentra documentos específicos con búsqueda avanzada"
                        icon="🔍"
                        hash="buscar"
                        color={INTILED_COLORS.naranja}
                    />
                    {user?.is_admin && (
                        <>
                            <QuickActionCard
                                title="Administración"
                                description="Gestiona usuarios, roles y configuraciones del sistema"
                                icon="⚙️"
                                hash="administracion"
                                color={INTILED_COLORS.naranja}
                            />
                            <QuickActionCard
                                title="Crear Proceso"
                                description="Añade nuevos procesos de apoyo a las direcciones"
                                icon="➕"
                                hash="procesos"
                                color={INTILED_COLORS.verde}
                            />
                            <QuickActionCard
                                title="Estadísticas"
                                description="Ver reportes detallados y análisis de uso"
                                icon="📊"
                                hash="estadisticas"
                                color={INTILED_COLORS.azul}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Documentos por Dirección */}
            {stats?.por_direccion && stats.por_direccion.length > 0 && (
                <div>
                    <h2 
                        className="text-3xl font-bold text-center mb-8"
                        style={{ color: INTILED_COLORS.azul }}
                    >
                        📈 Documentos por Dirección
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stats.por_direccion.map((direccion, index) => (
                            <div 
                                key={index}
                                className="p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-gray-200"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900">{direccion.nombre}</h3>
                                    <div 
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: direccion.color }}
                                    />
                                </div>
                                <p className="text-4xl font-bold mb-2" style={{ color: direccion.color }}>
                                    {direccion.total}
                                </p>
                                <p className="text-sm text-gray-500 mb-3">documentos</p>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="h-2 rounded-full transition-all duration-500"
                                        style={{ 
                                            backgroundColor: direccion.color,
                                            width: `${Math.min((direccion.total / Math.max(...stats.por_direccion.map(d => d.total), 1)) * 100, 100)}%`
                                        }}
                                    ></div>
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