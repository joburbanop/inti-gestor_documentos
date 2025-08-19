import axios from 'axios';

// Configuración base del cliente API
const apiClient = axios.create({
    baseURL: '/api/v1', // Cambiar a rutas versionadas v1
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Normalizar URLs para evitar duplicación de '/api/'
        if (typeof config.url === 'string') {
            if (config.url.startsWith('/api/')) {
                config.url = config.url.slice(5); // Remover '/api/' completo
            } else if (config.url.startsWith('/')) {
                config.url = config.url.slice(1); // Remover solo '/' inicial
            }
        }

        // Log para debugging - solo para datos JSON
        if (config.data && !(config.data instanceof FormData)) {
            console.log('📋 [apiClient] Enviando datos JSON:', config.data);
        } else if (config.data instanceof FormData) {
            console.log('📁 [apiClient] Enviando FormData con archivos');
        }
        
        return config;
    },
    (error) => {
        console.error('❌ [apiClient] Error en request:', error);
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas
apiClient.interceptors.response.use(
    (response) => {
        // Log para debugging
        console.log('✅ [apiClient] Respuesta exitosa:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('❌ [apiClient] Error en respuesta:', error.response?.status, error.response?.data);
        
        // Manejar errores de autenticación
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

// Funciones helper para diferentes tipos de requests
export const api = {
    // GET request
    get: (url, config = {}) => apiClient.get(url, config),
    
    // POST request
    post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
    
    // PUT request
    put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
    
    // PATCH request
    patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
    
    // DELETE request
    delete: (url, config = {}) => apiClient.delete(url, config),
    
    // Upload de archivos
    upload: (url, formData, config = {}) => {
        return apiClient.post(url, formData, {
            ...config,
            headers: {
                ...config.headers,
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};

export default apiClient;