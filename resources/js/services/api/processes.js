import api from '../../lib/apiClient.js';

export const processesService = {
    // ========================================
    // TIPOS DE PROCESOS
    // ========================================
    
    // Obtener todos los tipos de procesos
    getTypes: async (params = {}) => {
        try {
            const response = await api.get('/processes/types', { params });
            return response.data;
        } catch (error) {
            console.error('Error obteniendo tipos de procesos:', error);
            throw error;
        }
    },

    // Obtener tipo de proceso por ID
    getTypeById: async (id) => {
        try {
            const response = await api.get(`/processes/types/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo tipo de proceso:', error);
            throw error;
        }
    },

    // Crear nuevo tipo de proceso
    createType: async (typeData) => {
        try {
            const response = await api.post('/processes/types', typeData);
            return response.data;
        } catch (error) {
            console.error('Error creando tipo de proceso:', error);
            throw error;
        }
    },

    // Actualizar tipo de proceso
    updateType: async (id, typeData) => {
        try {
            const response = await api.put(`/processes/types/${id}`, typeData);
            return response.data;
        } catch (error) {
            console.error('Error actualizando tipo de proceso:', error);
            throw error;
        }
    },

    // Eliminar tipo de proceso
    deleteType: async (id) => {
        try {
            const response = await api.delete(`/processes/types/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error eliminando tipo de proceso:', error);
            throw error;
        }
    },

    // Obtener procesos generales por tipo
    getGeneralsByType: async (typeId) => {
        try {
            const response = await api.get(`/processes/types/${typeId}/generals`);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo procesos generales por tipo:', error);
            throw error;
        }
    },

    // Obtener estadísticas de tipos
    getTypeStats: async () => {
        try {
            const response = await api.get('/processes/types/stats');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo estadísticas de tipos:', error);
            throw error;
        }
    },

    // Obtener configuración de tipos
    getTypeConfig: async () => {
        try {
            const response = await api.get('/processes/types/config');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo configuración de tipos:', error);
            throw error;
        }
    },

    // Obtener configuración de tipo específico
    getTypeSpecificConfig: async (type) => {
        try {
            const response = await api.get(`/processes/types/${type}/config`);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo configuración específica de tipo:', error);
            throw error;
        }
    },

    // ========================================
    // PROCESOS GENERALES
    // ========================================
    
    // Obtener todos los procesos generales
    getGenerals: async (params = {}) => {
        try {
            const response = await api.get('/processes/generals', { params });
            return response.data;
        } catch (error) {
            console.error('Error obteniendo procesos generales:', error);
            throw error;
        }
    },

    // Obtener proceso general por ID
    getGeneralById: async (id) => {
        try {
            const response = await api.get(`/processes/generals/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo proceso general:', error);
            throw error;
        }
    },

    // Crear nuevo proceso general
    createGeneral: async (generalData) => {
        try {
            const response = await api.post('/processes/generals', generalData);
            return response.data;
        } catch (error) {
            console.error('Error creando proceso general:', error);
            throw error;
        }
    },

    // Actualizar proceso general
    updateGeneral: async (id, generalData) => {
        try {
            const response = await api.put(`/processes/generals/${id}`, generalData);
            return response.data;
        } catch (error) {
            console.error('Error actualizando proceso general:', error);
            throw error;
        }
    },

    // Eliminar proceso general
    deleteGeneral: async (id) => {
        try {
            const response = await api.delete(`/processes/generals/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error eliminando proceso general:', error);
            throw error;
        }
    },

    // Obtener documentos por proceso general
    getDocumentsByGeneral: async (id) => {
        try {
            const response = await api.get(`/processes/generals/${id}/documents`);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo documentos por proceso general:', error);
            throw error;
        }
    },

    // Obtener tipos disponibles para procesos generales
    getAvailableTypes: async () => {
        try {
            const response = await api.get('/processes/generals/types/available');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo tipos disponibles:', error);
            throw error;
        }
    },

    // ========================================
    // PROCESOS INTERNOS
    // ========================================
    
    // Obtener todos los procesos internos
    getInternals: async (params = {}) => {
        try {
            const response = await api.get('/processes/internals', { params });
            return response.data;
        } catch (error) {
            console.error('Error obteniendo procesos internos:', error);
            throw error;
        }
    },

    // Obtener proceso interno por ID
    getInternalById: async (id) => {
        try {
            const response = await api.get(`/processes/internals/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo proceso interno:', error);
            throw error;
        }
    },

    // Crear nuevo proceso interno
    createInternal: async (internalData) => {
        try {
            const response = await api.post('/processes/internals', internalData);
            return response.data;
        } catch (error) {
            console.error('Error creando proceso interno:', error);
            throw error;
        }
    },

    // Actualizar proceso interno
    updateInternal: async (id, internalData) => {
        try {
            const response = await api.put(`/processes/internals/${id}`, internalData);
            return response.data;
        } catch (error) {
            console.error('Error actualizando proceso interno:', error);
            throw error;
        }
    },

    // Eliminar proceso interno
    deleteInternal: async (id) => {
        try {
            const response = await api.delete(`/processes/internals/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error eliminando proceso interno:', error);
            throw error;
        }
    },

    // Obtener procesos internos por proceso general
    getInternalsByGeneral: async (processGeneralId) => {
        try {
            const response = await api.get(`/processes/generals/${processGeneralId}/internals`);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo procesos internos por proceso general:', error);
            throw error;
        }
    }
};