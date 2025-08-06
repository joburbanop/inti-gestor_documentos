import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from './Dashboard';
import UserDashboard from './UserDashboard';
import Direcciones from './Direcciones';
import CreateDireccion from './crud/CreateDireccion';
import { INTILED_COLORS } from '../config/colors';

// Componente interno para manejar la navegación hash
const HashRouter = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState('dashboard');

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            
            // Si no hay hash o el hash está vacío, ir al dashboard
            if (!hash || hash === '') {
                setCurrentView('dashboard');
                // Limpiar cualquier hash residual
                if (window.location.hash) {
                    window.history.replaceState(null, null, window.location.pathname);
                }
                return;
            }
            
            // Si hay un hash válido, establecer esa vista
            setCurrentView(hash);
        };

        // Establecer vista inicial
        handleHashChange();

        // Escuchar cambios en el hash
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Renderizar la vista actual basada en hash
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
            case 'dashboard':
            default:
                // Mostrar UserDashboard para usuarios regulares, Dashboard para administradores
                return user?.is_admin ? <Dashboard /> : <UserDashboard />;
        }
    };

    // Para rutas hash, usar el sistema actual
    return (
        <div>
            {renderCurrentView()}
        </div>
    );
};

// Componente wrapper para manejar la navegación desde rutas React Router
const CreateDireccionWrapper = () => {
    const { user } = useAuth();
    
    // Función para manejar la navegación desde el navbar
    useEffect(() => {
        const handleHashNavigation = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash && hash !== 'direcciones') {
                // Si hay un hash diferente a 'direcciones', navegar a la página principal
                window.location.href = '/#' + hash;
            }
        };

        // Escuchar cambios en el hash
        window.addEventListener('hashchange', handleHashNavigation);
        return () => window.removeEventListener('hashchange', handleHashNavigation);
    }, []);

    return <CreateDireccion />;
};

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HashRouter />} />
                <Route path="/direcciones/crear" element={<CreateDireccionWrapper />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default AppRouter; 