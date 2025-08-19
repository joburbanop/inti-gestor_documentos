import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api/auth.js';
import { api } from '../lib/apiClient.js';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState(null);

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
                // Token inválido, limpiar datos
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
            setError(null); // Limpiar errores anteriores
            
            const response = await authService.login(credentials);
            
            if (response.success) {
                // Guardar token y datos del usuario
                localStorage.setItem('auth_token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                setUser(response.data.user);
                setIsAuthenticated(true);
                setError(null);
                
                return { success: true, message: response.message };
            } else {
                setError(response.message || 'Error en el inicio de sesión');
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Error en login:', error);
            const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
            setError(errorMessage);
            return { 
                success: false, 
                message: errorMessage
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            // Intentar hacer logout en el servidor
            await authService.logout();
        } catch (error) {
            console.error('Error en logout del servidor:', error);
        } finally {
            // Limpiar datos locales
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
            setError(null);
        }
    };

    // Cliente API unificado para el frontend
    const apiRequest = async (url, options = {}) => {
        const { method = 'GET', body = undefined, headers = {}, signal, ignoreAuthErrors = false } = options;
        try {
            const upper = (method || 'GET').toUpperCase();
            let response;
            if (upper === 'GET') {
                response = await api.get(url, { signal, headers });
            } else if (upper === 'POST') {
                if (body instanceof FormData) {
                    response = await api.upload(url, body, { signal, headers });
                } else {
                    response = await api.post(url, body ?? {}, { signal, headers });
                }
            } else if (upper === 'PUT') {
                response = await api.put(url, body ?? {}, { signal, headers });
            } else if (upper === 'PATCH') {
                response = await api.patch(url, body ?? {}, { signal, headers });
            } else if (upper === 'DELETE') {
                response = await api.delete(url, { signal, headers, data: body });
            } else {
                // Fallback a POST si llega un método no soportado
                response = await api.post(url, body ?? {}, { signal, headers });
            }
            return response.data;
        } catch (error) {
            if (!ignoreAuthErrors && error?.response?.status === 401) {
                await logout();
            }
            throw error;
        }
    };

    const refreshUser = async () => {
        try {
            const response = await authService.getUser();
            if (response.success) {
                setUser(response.data);
                localStorage.setItem('user', JSON.stringify(response.data));
            }
        } catch (error) {
            console.error('Error refrescando usuario:', error);
        }
    };

    const clearError = () => {
        setError(null);
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        error,
        login,
        logout,
        apiRequest,
        refreshUser,
        checkAuth,
        clearError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};