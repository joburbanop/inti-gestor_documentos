import api from '../../lib/apiClient.js';

export const authService = {
    // Login
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    },

    // Logout
    logout: async () => {
        try {
            const response = await api.post('/auth/logout');
            return response.data;
        } catch (error) {
            console.error('Error en logout:', error);
            throw error;
        }
    },

    // Verificar token
    verify: async () => {
        try {
            const response = await api.get('/auth/verify');
            return response.data;
        } catch (error) {
            console.error('Error verificando token:', error);
            throw error;
        }
    },

    // Obtener usuario actual
    getUser: async () => {
        try {
            const response = await api.get('/auth/user');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            throw error;
        }
    }
};