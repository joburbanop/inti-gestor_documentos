import { useAuth } from '../contexts/AuthContext'; import { useState, useEffect } from 'react';
 // Configuración por defecto mínima (solo para fallback)
 const DEFAULT_CONFIG = {};
 // Hook para obtener configuración desde la base de datos
 export const useTipoConfig = () => {
 const { apiRequest } = useAuth();
 const [configs, setConfigs] = useState(DEFAULT_CONFIG);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 useEffect(() => {
 const loadConfigs = async () => {
 try {
 setLoading(true);
 const response = await apiRequest('/procesos/tipos/config');
 if (response.success) {
 setConfigs(response.data);
 } else {
 setConfigs(DEFAULT_CONFIG);
 }
 } catch (error) {
 setError(error.message);
 setConfigs(DEFAULT_CONFIG);
 } finally {
 setLoading(false);
 }
 };
 loadConfigs();
 }, [apiRequest]);
 return { configs, loading, error };
 };
 // Función para obtener configuración de un tipo específico
 export const getTipoConfig = (tipo, configs = DEFAULT_CONFIG) => {
 // Si tenemos configuración desde la BD, usarla
 if (configs[tipo]) {
 return configs[tipo];
 }
 // Fallback si no hay configuración
 return {
 key: tipo,
 title: `Procesos: ${tipo}`,
 subtitle: '',
 emptyText: 'No hay procesos registrados.'
 };
 };