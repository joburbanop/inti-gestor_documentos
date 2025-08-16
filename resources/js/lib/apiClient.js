import axios from 'axios'; // Axios client centralizado para toda la app
 // - baseURL apunta al proxy/backend Laravel
 // - inyecta token desde localStorage en cada request
 // - normaliza rutas con o sin prefijo /api
 const api = axios.create({
 baseURL: '/api',
 headers: {
 'X-Requested-With': 'XMLHttpRequest',
 Accept: 'application/json',
 },
 timeout: 20000,
 });
 // Interceptor de request: agrega Authorization si existe token
 api.interceptors.request.use((config) => {
 const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
 if (token) {
 config.headers = config.headers || {};
 config.headers.Authorization = `Bearer ${token}`;
 }
 // Normalizar URL: si llega '/api/...' quitar prefijo para evitar '/api/api/...'
 // También eliminar '/' inicial para que respete baseURL
 if (typeof config.url === 'string') {
 if (config.url.startsWith('/api/')) {
 config.url = config.url.replace(/^\/api\//', '');
 }
 if (config.url.startsWith('/')) {
 config.url = config.url.slice(1);
 }
 }
 // Si body es FormData dejar que axios maneje boundary
 if (config.data instanceof FormData) {
 console.log('📁 [apiClient] Detectado FormData:', config.data);
 console.log('📁 [apiClient] FormData entries:');
 for (let [key, value] of config.data.entries()) {
 if (value instanceof File) {
 console.log(`  - ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
 } else {
 console.log(`  - ${key}: ${value}`);
 }
 }
 if (config.headers && 'Content-Type' in config.headers) {
 delete config.headers['Content-Type'];
 }
 console.log('📁 [apiClient] Headers después de FormData:', config.headers);
 } else {
 // Asegurar JSON por defecto
 config.headers = config.headers || {};
 if (!config.headers['Content-Type']) {
 config.headers['Content-Type'] = 'application/json';
 }
 console.log('📋 [apiClient] Enviando datos JSON:', config.data);
 }
 return config;
 });
 // Interceptor de respuesta: dejar manejo en capas superiores
 api.interceptors.response.use(
 (response) => response,
 (error) => Promise.reject(error)
 );
 export default api;
 export const apiGet = (url, config) => api.get(url, config).then(r => r.data);
 export const apiPost = (url, data, config) => api.post(url, data, config).then(r => r.data);
 export const apiPut = (url, data, config) => api.put(url, data, config).then(r => r.data);
 export const apiPatch = (url, data, config) => api.patch(url, data, config).then(r => r.data);
 export const apiDelete = (url, config) => api.delete(url, config).then(r => r.data);