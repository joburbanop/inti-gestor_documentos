import { useState, useEffect, useCallback } from 'react'; import { useAuth } from '../contexts/AuthContext';
 export const useQuickActions = () => {
 const { apiRequest } = useAuth();
 const [accionesRapidas, setAccionesRapidas] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const cargarAccionesRapidas = useCallback(async () => {
 try {
 setLoading(true);
 setError(null);
 const response = await apiRequest('/dashboard/acciones-rapidas');
 if (response.success) {
 setAccionesRapidas(response.data);
 } else {
 setError('Error al cargar las acciones rápidas');
 }
 } catch (error) {
 console.error('Error cargando acciones rápidas:', error);
 setError('Error al cargar las acciones rápidas');
 } finally {
 setLoading(false);
 }
 }, [apiRequest]);
 const handleAccionClick = useCallback((accion) => {
 // Navegar a la página de procesos con el tipo seleccionado
 window.location.href = `/procesos?tipo=${accion.key}`;
 }, []);
 const getAccionPorTipo = useCallback((tipo) => {
 return accionesRapidas.find(accion => accion.key === tipo);
 }, [accionesRapidas]);
 const getAccionesPorColor = useCallback((color) => {
 return accionesRapidas.filter(accion => accion.color === color);
 }, [accionesRapidas]);
 useEffect(() => {
 cargarAccionesRapidas();
 }, [cargarAccionesRapidas]);
 return {
 accionesRapidas,
 loading,
 error,
 cargarAccionesRapidas,
 handleAccionClick,
 getAccionPorTipo,
 getAccionesPorColor
 };
 };