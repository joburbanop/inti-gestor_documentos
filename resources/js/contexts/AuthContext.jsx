import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Estados iniciales
const initialState = {
    user: null,
    token: localStorage.getItem('auth_token') || null,
    isAuthenticated: false,
    isLoading: true,
    error: null
};

// Tipos de acciones
const AUTH_ACTIONS = {
    LOGIN_START: 'LOGIN_START',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    LOGOUT: 'LOGOUT',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer para manejar el estado
const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.LOGIN_START:
            return {
                ...state,
                isLoading: true,
                error: null
            };
        
        case AUTH_ACTIONS.LOGIN_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isLoading: false,
                error: null
            };
        
        case AUTH_ACTIONS.LOGIN_FAILURE:
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: action.payload
            };
        
        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: null
            };
        
        case AUTH_ACTIONS.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload
            };
        
        case AUTH_ACTIONS.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                isLoading: false
            };
        
        case AUTH_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null
            };
        
        default:
            return state;
    }
};

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Función para hacer peticiones a la API
    const apiRequest = async (url, options = {}) => {
        const token = state.token;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url.startsWith('/api') ? url : `/api${url}`, config);
            const data = await response.json();

            if (!response.ok) {
                // Si es un error 401, manejar específicamente
                if (response.status === 401) {
                    // Solo hacer logout si el mensaje indica que el token es inválido
                    if (data.message && (data.message.includes('No autenticado') || data.message.includes('Token'))) {
                        localStorage.removeItem('auth_token');
                        dispatch({ type: AUTH_ACTIONS.LOGOUT });
                    }
                }
                throw new Error(data.message || 'Error en la petición');
            }

            return data;
        } catch (error) {
            // No hacer logout automático aquí, dejar que el componente maneje el error
            throw error;
        }
    };

    // Función de login optimizada para máxima velocidad
    const login = async (email, password) => {
        try {
            dispatch({ type: AUTH_ACTIONS.LOGIN_START });

            // Optimización: Usar fetch directamente para máxima velocidad
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                // Guardar token inmediatamente para acceso rápido
                localStorage.setItem('auth_token', data.data.token);
                
                // Dispatch inmediato sin esperar verificaciones adicionales
                dispatch({
                    type: AUTH_ACTIONS.LOGIN_SUCCESS,
                    payload: {
                        user: data.data.user,
                        token: data.data.token
                    }
                });

                // Redirección inmediata sin verificaciones adicionales
                window.location.href = '/#dashboard';
                
                return { success: true };
            } else {
                throw new Error(data.message || 'Error en el inicio de sesión');
            }
        } catch (error) {
            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: error.message
            });
            return { success: false, error: error.message };
        }
    };

    // Función de logout
    const logout = async () => {
        try {
            if (state.token) {
                await apiRequest('/logout', { method: 'POST' });
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            // Limpiar localStorage
            localStorage.removeItem('auth_token');
            
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
    };

    // Función para verificar el token
    const verifyToken = async () => {
        if (!state.token) {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
            return;
        }

        try {
            const data = await apiRequest('/verify');
            
            if (data.success) {
                // Obtener información actualizada del usuario
                const userData = await apiRequest('/user');
                
                if (userData.success) {
                    dispatch({
                        type: AUTH_ACTIONS.LOGIN_SUCCESS,
                        payload: {
                            user: userData.data.user,
                            token: state.token
                        }
                    });
                }
            } else {
                throw new Error('Token inválido');
            }
        } catch (error) {
            console.error('Error verificando token:', error);
            localStorage.removeItem('auth_token');
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
        } finally {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
    };

    // Función para limpiar errores
    const clearError = () => {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    };

    // Verificar token al cargar la aplicación
    useEffect(() => {
        verifyToken();
    }, []);

    // Configurar interceptor para manejar errores de autenticación
    useEffect(() => {
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            const response = await originalFetch(...args);
            
            // Solo hacer logout si es una petición a la API y el status es 401
            if (response.status === 401 && args[0] && typeof args[0] === 'string' && args[0].includes('/api/')) {
                // Verificar si la respuesta es JSON antes de procesarla
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const data = await response.clone().json();
                        // Solo hacer logout si el mensaje indica que el token es inválido
                        if (data.message && (data.message.includes('No autenticado') || data.message.includes('Token'))) {
                            localStorage.removeItem('auth_token');
                            dispatch({ type: AUTH_ACTIONS.LOGOUT });
                        }
                    } catch (error) {
                        // Si no es JSON válido, no hacer logout automático
                        console.warn('Respuesta 401 no es JSON válido:', error);
                    }
                }
            }
            
            return response;
        };

        return () => {
            window.fetch = originalFetch;
        };
    }, []);

    const value = {
        ...state,
        login,
        logout,
        clearError,
        apiRequest
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 