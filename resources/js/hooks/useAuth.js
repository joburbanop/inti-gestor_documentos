import { useState, useEffect, useCallback, createContext, useContext } from 'react'; import authService from '../services/api/auth';
 /**
 * Contexto de autenticación
 */
 const AuthContext = createContext();
 /**
 * Hook personalizado para gestión de autenticación
 */
 export const useAuth = () => {
 const context = useContext(AuthContext);
 if (!context) {
 throw new Error('useAuth debe ser usado dentro de un AuthProvider');
 }
 return context;
 };
 /**
 * Provider de autenticación
 */
 export const AuthProvider = ({ children }) => {
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [isAuthenticated, setIsAuthenticated] = useState(false);
 /**
 * Inicializar autenticación
 */
 const initializeAuth = useCallback(async () => {
 setLoading(true);
 try {
 // Verificar si hay token en localStorage
 const token = authService.getToken();
 const storedUser = authService.getUserFromStorage();
 if (token && storedUser) {
 // Verificar si el token es válido
 const response = await authService.verifyAuth();
 if (response.success) {
 setUser(response.data || storedUser);
 setIsAuthenticated(true);
 } else {
 // Token inválido, limpiar datos
 authService.clearAuth();
 setUser(null);
 setIsAuthenticated(false);
 }
 } else {
 setUser(null);
 setIsAuthenticated(false);
 }
 } catch (err) {
 console.error('❌ [useAuth] Error al inicializar autenticación:', err);
 authService.clearAuth();
 setUser(null);
 setIsAuthenticated(false);
 } finally {
 setLoading(false);
 }
 }, []);
 /**
 * Iniciar sesión
 */
 const login = useCallback(async (credentials) => {
 setLoading(true);
 setError(null);
 try {
 const response = await authService.login(credentials);
 if (response.success) {
 setUser(response.user);
 setIsAuthenticated(true);
 return response;
 } else {
 setError(response.message || 'Error al iniciar sesión');
 return response;
 }
 } catch (err) {
 setError(err.message || 'Error al iniciar sesión');
 console.error('❌ [useAuth] Error al iniciar sesión:', err);
 throw err;
 } finally {
 setLoading(false);
 }
 }, []);
 /**
 * Cerrar sesión
 */
 const logout = useCallback(async () => {
 setLoading(true);
 setError(null);
 try {
 const response = await authService.logout();
 // Limpiar estado local
 setUser(null);
 setIsAuthenticated(false);
 return response;
 } catch (err) {
 console.error('❌ [useAuth] Error al cerrar sesión:', err);
 // Limpiar estado local incluso si hay error
 setUser(null);
 setIsAuthenticated(false);
 throw err;
 } finally {
 setLoading(false);
 }
 }, []);
 /**
 * Obtener información del usuario actual
 */
 const getUser = useCallback(async () => {
 setLoading(true);
 setError(null);
 try {
 const response = await authService.getUser();
 if (response.success) {
 setUser(response.data);
 return response.data;
 } else {
 setError(response.message || 'Error al obtener información del usuario');
 return null;
 }
 } catch (err) {
 setError(err.message || 'Error al obtener información del usuario');
 console.error('❌ [useAuth] Error al obtener usuario:', err);
 return null;
 } finally {
 setLoading(false);
 }
 }, []);
 /**
 * Verificar autenticación
 */
 const verifyAuth = useCallback(async () => {
 try {
 const response = await authService.verifyAuth();
 if (response.success) {
 setIsAuthenticated(true);
 return true;
 } else {
 setIsAuthenticated(false);
 setUser(null);
 return false;
 }
 } catch (err) {
 console.error('❌ [useAuth] Error al verificar autenticación:', err);
 setIsAuthenticated(false);
 setUser(null);
 return false;
 }
 }, []);
 /**
 * Renovar token
 */
 const refreshToken = useCallback(async () => {
 try {
 const response = await authService.refreshToken();
 if (response.success) {
 return true;
 } else {
 // Token no se pudo renovar, hacer logout
 await logout();
 return false;
 }
 } catch (err) {
 console.error('❌ [useAuth] Error al renovar token:', err);
 await logout();
 return false;
 }
 }, [logout]);
 /**
 * Verificar permisos del usuario
 */
 const hasPermission = useCallback((permission) => {
 if (!user || !user.role) {
 return false;
 }
 // Verificar si el usuario tiene el permiso específico
 return user.role.permissions?.includes(permission) || false;
 }, [user]);
 /**
 * Verificar si el usuario tiene un rol específico
 */
 const hasRole = useCallback((roleName) => {
 if (!user || !user.role) {
 return false;
 }
 return user.role.name === roleName;
 }, [user]);
 /**
 * Verificar si el usuario es administrador
 */
 const isAdmin = useCallback(() => {
 return hasRole('admin') || hasRole('administrador');
 }, [hasRole]);
 /**
 * Limpiar error
 */
 const clearError = useCallback(() => {
 setError(null);
 }, []);
 // Inicializar autenticación al montar el componente
 useEffect(() => {
 initializeAuth();
 }, [initializeAuth]);
 const value = {
 user,
 loading,
 error,
 isAuthenticated,
 login,
 logout,
 getUser,
 verifyAuth,
 refreshToken,
 hasPermission,
 hasRole,
 isAdmin,
 clearError
 };
 return (
 <AuthContext.Provider value={value}>
 {children}
 </AuthContext.Provider>
 );
 };