import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api/auth.js';

const AuthContextMinimal = createContext();

export const useAuthMinimal = () => {
    const context = useContext(AuthContextMinimal);
    if (!context) {
        throw new Error('useAuthMinimal debe ser usado dentro de un AuthProviderMinimal');
    }
    return context;
};

export const AuthProviderMinimal = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Verificar autenticación al cargar
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await authService.verify();
            if (response.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
            } else {
                logout();
            }
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            setLoading(true);
            const response = await authService.login(credentials);
            
            if (response.success) {
                localStorage.setItem('auth_token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                setUser(response.data.user);
                setIsAuthenticated(true);
                
                return { success: true, message: response.message };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Error en login:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Error al iniciar sesión' 
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Error en logout del servidor:', error);
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        checkAuth
    };

    return (
        <AuthContextMinimal.Provider value={value}>
            {children}
        </AuthContextMinimal.Provider>
    );
};