import api from '../../lib/apiClient.js';

export const processesService = {
    // ========================================
    // TIPOS DE PROCESOS
    // ========================================
    
    // Obtener todos los tipos de procesos
    getTypes: async (params = {}) => {
        try {
            const response = await api.get('/procesos-tipos', { params });
            return response.data;
        } catch (error) {
            console.error('Error obteniendo tipos de procesos:', error);
            throw error;
        }
    },

    // Obtener tipo de proceso por ID
    getTypeById: async (id) => {
        try {
            const response = await api.get(`/procesos-tipos/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo tipo de proceso:', error);
            throw error;
        }
    },

    // Crear nuevo tipo de proceso
    createType: async (typeData) => {
        try {
            const response = await api.post('/procesos-tipos', typeData);
            return response.data;
        } catch (error) {
            console.error('Error creando tipo de proceso:', error);
            throw error;
        }
    },

    // Actualizar tipo de proceso
    updateType: async (id, typeData) => {
        try {
            const response = await api.put(`/procesos-tipos/${id}`, typeData);
            return response.data;
        } catch (error) {
            console.error('Error actualizando tipo de proceso:', error);
            throw error;
        }
    },

    // Eliminar tipo de proceso
    deleteType: async (id) => {
        try {
            const response = await api.delete(`/procesos-tipos/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error eliminando tipo de proceso:', error);
            throw error;
        }
    },

    // Obtener procesos generales por tipo
    getGeneralsByType: async (typeId) => {
        try {
            const response = await api.get(`/procesos-tipos/${typeId}/procesos-generales`);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo procesos generales por tipo:', error);
            throw error;
        }
    },

    // Obtener estadísticas de tipos
    getTypeStats: async () => {
        try {
            const response = await api.get('/procesos/tipos/stats');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo estadísticas de tipos:', error);
            throw error;
        }
    },

    // Obtener configuración de tipos
    getTypeConfig: async () => {
        try {
            const response = await api.get('/procesos/tipos/config');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo configuración de tipos:', error);
            throw error;
        }
    },

    // Obtener configuración de tipo específico
    getTypeSpecificConfig: async (type) => {
        try {
            const response = await api.get(`/procesos/tipos/${type}/config`);
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
            const response = await api.get('/procesos-generales', { params });
            return response.data;
        } catch (error) {
            console.error('Error obteniendo procesos generales:', error);
            throw error;
        }
    },

    // Obtener proceso general por ID
    getGeneralById: async (id) => {
        try {
            const response = await api.get(`/procesos-generales/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo proceso general:', error);
            throw error;
        }
    },

    // Crear nuevo proceso general
    createGeneral: async (generalData) => {
        try {
            console.log('📋 [processes.js] Enviando datos para crear proceso general:', generalData);
            const response = await api.post('/procesos-generales', generalData);
            return response.data;
        } catch (error) {
            console.error('Error creando proceso general:', error);
            throw error;
        }
    },

    // Actualizar proceso general
    updateGeneral: async (id, generalData) => {
        try {
            const response = await api.put(`/procesos-generales/${id}`, generalData);
            return response.data;
        } catch (error) {
            console.error('Error actualizando proceso general:', error);
            throw error;
        }
    },

    // Eliminar proceso general
    deleteGeneral: async (id) => {
        try {
            const response = await api.delete(`/procesos-generales/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error eliminando proceso general:', error);
            throw error;
        }
    },

    // Obtener documentos por proceso general
    getDocumentsByGeneral: async (id) => {
        try {
            const response = await api.get(`/procesos-generales/${id}/documentos`);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo documentos por proceso general:', error);
            throw error;
        }
    },

    // Obtener tipos disponibles para procesos generales
    getAvailableTypes: async () => {
        try {
            const response = await api.get('/procesos-generales/tipos/disponibles');
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
            const response = await api.get('/procesos-internos', { params });
            return response.data;
        } catch (error) {
            console.error('Error obteniendo procesos internos:', error);
            throw error;
        }
    },

    // Obtener proceso interno por ID
    getInternalById: async (id) => {
        try {
            const response = await api.get(`/procesos-internos/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo proceso interno:', error);
            throw error;
        }
    },

    // Crear nuevo proceso interno
    createInternal: async (internalData) => {
        try {
            const response = await api.post('/procesos-internos', internalData);
            return response.data;
        } catch (error) {
            console.error('Error creando proceso interno:', error);
            throw error;
        }
    },

    // Actualizar proceso interno
    updateInternal: async (id, internalData) => {
        try {
            const response = await api.put(`/procesos-internos/${id}`, internalData);
            return response.data;
        } catch (error) {
            console.error('Error actualizando proceso interno:', error);
            throw error;
        }
    },

    // Eliminar proceso interno
    deleteInternal: async (id) => {
        try {
            const response = await api.delete(`/procesos-internos/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error eliminando proceso interno:', error);
            throw error;
        }
    },

    // Obtener procesos internos por proceso general
    getInternalsByGeneral: async (processGeneralId) => {
        try {
            const response = await api.get(`/procesos-generales/${processGeneralId}/procesos-internos`);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo procesos internos por proceso general:', error);
            throw error;
        }
    }
};

export default processesService;