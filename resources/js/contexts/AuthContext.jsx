import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { SESSION_CONFIG, getTimeRemaining, shouldShowWarning, isSessionExpired } from '../config/session';
 import { PERFORMANCE_CONFIG, isActivityMonitoringEnabled } from '../config/performance';
 import api from '../lib/apiClient';
 // Estados iniciales
 const initialState = {
 user: null,
 token: localStorage.getItem('auth_token') || null,
 isAuthenticated: false,
 isLoading: true,
 error: null,
 lastActivity: localStorage.getItem('last_activity') ? new Date(localStorage.getItem('last_activity')) : null
 };
 // Tipos de acciones
 const AUTH_ACTIONS = {
 LOGIN_START: 'LOGIN_START',
 LOGIN_SUCCESS: 'LOGIN_SUCCESS',
 LOGIN_FAILURE: 'LOGIN_FAILURE',
 LOGOUT: 'LOGOUT',
 SET_LOADING: 'SET_LOADING',
 SET_ERROR: 'SET_ERROR',
 CLEAR_ERROR: 'CLEAR_ERROR',
 UPDATE_ACTIVITY: 'UPDATE_ACTIVITY'
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
 error: null,
 lastActivity: new Date()
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
 error: null,
 lastActivity: null
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
 case AUTH_ACTIONS.UPDATE_ACTIVITY:
 // Solo actualizar si realmente cambió la actividad
 const newActivity = new Date();
 if (!state.lastActivity || Math.abs(newActivity.getTime() - state.lastActivity.getTime()) > 60000) {
 return {
 ...state,
 lastActivity: newActivity
 };
 }
 return state; // No cambiar el estado si no es necesario
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
 // Función para hacer peticiones a la API (axios)
 const apiRequest = async (url, options = {}) => {
 const token = state.token || localStorage.getItem('auth_token');
 if (!token) {
 localStorage.removeItem('auth_token');
 dispatch({ type: AUTH_ACTIONS.LOGOUT });
 throw new Error('No autenticado');
 }
 const method = (options.method || 'GET').toLowerCase();
 const ignoreAuthErrors = options.ignoreAuthErrors === true;
 // Preparar headers
 const headers = {
 'X-Requested-With': 'XMLHttpRequest',
 Accept: 'application/json',
 ...(ignoreAuthErrors ? { 'X-Ignore-Auth-Errors': '1' } : {}),
 ...options.headers,
 };
 // Preparar data
 let data = options.body;
 if (data && typeof data === 'string') {
 try { data = JSON.parse(data); } catch (_) {}
 }
 try {
 const axiosConfig = { headers };
 let response;
 const normalizedUrl = url; // apiClient normaliza prefijos
 switch (method) {
 case 'get':
 response = await api.get(normalizedUrl, axiosConfig);
 break;
 case 'post':
 response = await api.post(normalizedUrl, data, axiosConfig);
 break;
 case 'put':
 response = await api.put(normalizedUrl, data, axiosConfig);
 break;
 case 'patch':
 response = await api.patch(normalizedUrl, data, axiosConfig);
 break;
 case 'delete':
 response = await api.delete(normalizedUrl, axiosConfig);
 break;
 default:
 response = await api.request({ url: normalizedUrl, method, data, ...axiosConfig });
 }
 // Se asume respuesta JSON con shape { success, data, message }
 return response.data;
 } catch (error) {
 const status = error?.response?.status;
 if (status === 401 && !ignoreAuthErrors) {
 localStorage.removeItem('auth_token');
 dispatch({ type: AUTH_ACTIONS.LOGOUT });
 throw new Error('No autenticado');
 }
 const message = error?.response?.data?.message || error.message || 'Error en la petición';
 throw new Error(message);
 }
 };
 // Función de login usando axios
 const login = async (email, password) => {
 try {
 dispatch({ type: AUTH_ACTIONS.LOGIN_START });
 const data = await api.post('/login', { email, password }).then(r => r.data);
 if (data.success) {
 localStorage.setItem('auth_token', data.data.token);
 const now = new Date();
 localStorage.setItem('last_activity', now.toISOString());
 dispatch({
 type: AUTH_ACTIONS.LOGIN_SUCCESS,
 payload: {
 user: data.data.user,
 token: data.data.token
 }
 });
 window.location.href = '/#dashboard';
 return { success: true };
 } else {
 throw new Error(data.message || 'Error en el inicio de sesión');
 }
 } catch (error) {
 dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: error.message });
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
 console.error('Error en logout:', error);
 } finally {
 // Limpiar localStorage
 localStorage.removeItem('auth_token');
 localStorage.removeItem('last_activity');
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
 // Función para actualizar actividad del usuario (optimizada)
 const updateActivity = useCallback(() => {
 const now = new Date();
 localStorage.setItem('last_activity', now.toISOString());
 // Solo actualizar el estado si ha pasado más de 1 minuto desde la última actualización
 if (!state.lastActivity || now.getTime() - state.lastActivity.getTime() > 60000) {
 dispatch({ type: AUTH_ACTIONS.UPDATE_ACTIVITY });
 }
 }, [state.lastActivity]);
 // Función para verificar si el usuario ha estado inactivo
 const checkInactivity = () => {
 if (!state.lastActivity || !state.isAuthenticated) return false;
 if (isSessionExpired(state.lastActivity)) {
 logout();
 return true;
 }
 return false;
 };
 // Verificar token al cargar la aplicación
 useEffect(() => {
 // Verificar inactividad antes de verificar el token
 if (state.lastActivity && checkInactivity()) {
 return; // Si está inactivo, no verificar token
 }
 verifyToken();
 }, []);
 // Configurar monitoreo de actividad del usuario (COMPLETAMENTE DESHABILITADO)
 useEffect(() => {
 if (!state.isAuthenticated) {
 return;
 }
 // COMPLETAMENTE DESHABILITADO - NO HACER NADA
 // Solo actualizar actividad al cargar la página una vez
 if (!state.lastActivity) {
 updateActivity();
 }
 // NO configurar ningún event listener
 // NO configurar ningún intervalo
 // NO hacer nada más
 }, [state.isAuthenticated]); // Removido updateActivity de las dependencias
 // Ya no se sobreescribe fetch; el manejo de 401 se realiza en apiRequest/login
 const value = {
 ...state,
 login,
 logout,
 clearError,
 apiRequest,
 updateActivity,
 checkInactivity
 };
 return (
 <AuthContext.Provider value={value}>
 {children}
 </AuthContext.Provider>
 );
 };