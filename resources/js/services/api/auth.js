import apiClient from '../../lib/apiClient'; /**
 * Servicio de API para autenticación
 */
 class AuthService {
 /**
 * Iniciar sesión
 */
 async login(credentials) {
 try {
 const response = await apiClient.post('/login', credentials);
 if (response.data.success && response.data.token) {
 // Guardar token en localStorage
 localStorage.setItem('auth_token', response.data.token);
 localStorage.setItem('user', JSON.stringify(response.data.user));
 }
 return response.data;
 } catch (error) {
 console.error('❌ [AuthService] Error al iniciar sesión:', error);
 throw error;
 }
 }
 /**
 * Cerrar sesión
 */
 async logout() {
 try {
 const response = await apiClient.post('/auth/logout');
 // Limpiar localStorage
 localStorage.removeItem('auth_token');
 localStorage.removeItem('user');
 return response.data;
 } catch (error) {
 console.error('❌ [AuthService] Error al cerrar sesión:', error);
 // Limpiar localStorage incluso si hay error
 localStorage.removeItem('auth_token');
 localStorage.removeItem('user');
 throw error;
 }
 }
 /**
 * Obtener información del usuario actual
 */
 async getUser() {
 try {
 const response = await apiClient.get('/auth/user');
 return response.data;
 } catch (error) {
 console.error('❌ [AuthService] Error al obtener usuario:', error);
 throw error;
 }
 }
 /**
 * Verificar si el usuario está autenticado
 */
 async verifyAuth() {
 try {
 const response = await apiClient.get('/auth/verify');
 return response.data;
 } catch (error) {
 console.error('❌ [AuthService] Error al verificar autenticación:', error);
 throw error;
 }
 }
 /**
 * Obtener token del localStorage
 */
 getToken() {
 return localStorage.getItem('auth_token');
 }
 /**
 * Obtener usuario del localStorage
 */
 getUserFromStorage() {
 const user = localStorage.getItem('user');
 return user ? JSON.parse(user) : null;
 }
 /**
 * Verificar si hay un token válido
 */
 isAuthenticated() {
 const token = this.getToken();
 return !!token;
 }
 /**
 * Limpiar datos de autenticación
 */
 clearAuth() {
 localStorage.removeItem('auth_token');
 localStorage.removeItem('user');
 }
 /**
 * Renovar token (si es necesario)
 */
 async refreshToken() {
 try {
 const response = await apiClient.post('/auth/refresh');
 if (response.data.success && response.data.token) {
 localStorage.setItem('auth_token', response.data.token);
 }
 return response.data;
 } catch (error) {
 console.error('❌ [AuthService] Error al renovar token:', error);
 throw error;
 }
 }
 }
 export default new AuthService();