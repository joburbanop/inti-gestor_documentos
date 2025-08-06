import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from './Dashboard';
import UserDashboard from './UserDashboard';
import Direcciones from './Direcciones';
import { INTILED_COLORS } from '../config/colors';

const AppRouter = () => {
    const { user } = useAuth();
    const [currentView, setCurrentView] = useState('dashboard');

    // Detectar la vista actual basada en el hash de la URL
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash) {
                setCurrentView(hash);
            } else {
                setCurrentView('dashboard');
            }
        };

        // Establecer vista inicial
        handleHashChange();

        // Escuchar cambios en el hash
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Función para cambiar de vista
    const changeView = (view) => {
        setCurrentView(view);
        window.location.hash = view;
    };

    // Renderizar la vista actual
    const renderCurrentView = () => {
        switch (currentView) {
            case 'direcciones':
                return <Direcciones />;
            case 'procesos':
                return <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4" style={{ color: INTILED_COLORS.azul }}>
                        Procesos de Apoyo
                    </h2>
                    <p className="text-gray-600">Componente en desarrollo...</p>
                </div>;
            case 'documentos':
                return <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4" style={{ color: INTILED_COLORS.azul }}>
                        Gestión de Documentos
                    </h2>
                    <p className="text-gray-600">Componente en desarrollo...</p>
                </div>;
            case 'buscar':
                return <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4" style={{ color: INTILED_COLORS.azul }}>
                        Búsqueda de Documentos
                    </h2>
                    <p className="text-gray-600">Componente en desarrollo...</p>
                </div>;
            case 'administracion':
                return <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4" style={{ color: INTILED_COLORS.azul }}>
                        Panel de Administración
                    </h2>
                    <p className="text-gray-600">Componente en desarrollo...</p>
                </div>;
            case 'estadisticas':
                return <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4" style={{ color: INTILED_COLORS.azul }}>
                        Estadísticas Detalladas
                    </h2>
                    <p className="text-gray-600">Componente en desarrollo...</p>
                </div>;
            default:
                // Mostrar UserDashboard para usuarios regulares, Dashboard para administradores
                return user?.is_admin ? <Dashboard /> : <UserDashboard />;
        }
    };

    return (
        <div>
            {renderCurrentView()}
        </div>
    );
};

export default AppRouter; 