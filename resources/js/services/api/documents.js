import api from '../../lib/apiClient.js';

export const documentsService = {
    // Obtener todos los documentos
    getAll: async (params = {}) => {
        try {
            const response = await api.get('/documents', { params });
            return response.data;
        } catch (error) {
            console.error('Error obteniendo documentos:', error);
            throw error;
        }
    },

    // Obtener documento por ID
    getById: async (id) => {
        try {
            const response = await api.get(`/documents/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo documento:', error);
            throw error;
        }
    },

    // Crear nuevo documento
    create: async (documentData) => {
        try {
            const response = await api.post('/documents', documentData);
            return response.data;
        } catch (error) {
            console.error('Error creando documento:', error);
            throw error;
        }
    },

    // Actualizar documento
    update: async (id, documentData) => {
        try {
            const response = await api.put(`/documents/${id}`, documentData);
            return response.data;
        } catch (error) {
            console.error('Error actualizando documento:', error);
            throw error;
        }
    },

    // Eliminar documento
    delete: async (id) => {
        try {
            const response = await api.delete(`/documents/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error eliminando documento:', error);
            throw error;
        }
    },

    // Buscar documentos
    search: async (params = {}) => {
        try {
            const response = await api.get('/documents/search', { params });
            return response.data;
        } catch (error) {
            console.error('Error buscando documentos:', error);
            throw error;
        }
    },

    // Obtener documentos recientes
    getRecent: async (params = {}) => {
        try {
            const response = await api.get('/documents/recent', { params });
            return response.data;
        } catch (error) {
            console.error('Error obteniendo documentos recientes:', error);
            throw error;
        }
    },

    // Descargar documento
    download: async (id) => {
        try {
            const response = await api.post(`/documents/${id}/download`);
            return response.data;
        } catch (error) {
            console.error('Error descargando documento:', error);
            throw error;
        }
    },

    // Vista previa de documento
    preview: async (id) => {
        try {
            const response = await api.get(`/documents/${id}/preview`);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo vista previa:', error);
            throw error;
        }
    },

    // Obtener estadísticas
    getStats: async () => {
        try {
            const response = await api.get('/documents/stats');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            throw error;
        }
    },

    // Obtener estadísticas de extensiones
    getExtensionStats: async () => {
        try {
            const response = await api.get('/documents/stats/extensions');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo estadísticas de extensiones:', error);
            throw error;
        }
    },

    // Obtener extensiones disponibles
    getAvailableExtensions: async () => {
        try {
            const response = await api.get('/documents/extensions/available');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo extensiones disponibles:', error);
            throw error;
        }
    },

    // Obtener etiquetas
    getTags: async () => {
        try {
            const response = await api.get('/documents/tags');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo etiquetas:', error);
            throw error;
        }
    },

    // Obtener sugerencias de etiquetas
    getTagSuggestions: async (params = {}) => {
        try {
            const response = await api.get('/documents/tags/suggestions', { params });
            return response.data;
        } catch (error) {
            console.error('Error obteniendo sugerencias de etiquetas:', error);
            throw error;
        }
    },

    // Obtener tipos de documentos
    getTypes: async () => {
        try {
            const response = await api.get('/documents/types');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo tipos de documentos:', error);
            throw error;
        }
    }
};