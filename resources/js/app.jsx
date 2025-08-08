import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import AppRouter from './components/AppRouter';
import Layout from './components/Layout';
import './bootstrap';
import '../css/app.css';

const App = () => {
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Login />;
    }

    return (
        <Layout>
            <AppRouter />
        </Layout>
    );
};

// Renderizar la aplicación
const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />); 