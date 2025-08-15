import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import AppRouter from './components/AppRouter';
import Layout from './components/Layout';
import './bootstrap';
import '../css/app.css';

console.log('🚀 [app.jsx] Iniciando aplicación React');

const App = () => {
    console.log('📱 [app.jsx] Renderizando componente App');
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
};

const AppContent = () => {
    const { isAuthenticated, isLoading } = useAuth();
    
    console.log('🔄 [app.jsx] AppContent - Estado de autenticación:', { isAuthenticated, isLoading });

    if (isLoading) {
        console.log('⏳ [app.jsx] Mostrando pantalla de carga');
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        console.log('🔐 [app.jsx] Usuario no autenticado, mostrando Login');
        return <Login />;
    }

    console.log('🏠 [app.jsx] Usuario autenticado, mostrando Layout con AppRouter');
    return (
        <Layout>
            <AppRouter />
        </Layout>
    );
};

// Renderizar la aplicación
console.log('🎯 [app.jsx] Montando aplicación en el DOM');
const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />); 