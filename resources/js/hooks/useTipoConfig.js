import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

console.log('📋 [useTipoConfig.js] Importando hook para configuración de tipos de procesos');

// Configuración por defecto mínima (solo para fallback)
const DEFAULT_CONFIG = {};

// Hook para obtener configuración desde la base de datos
export const useTipoConfig = () => {
  const { apiRequest } = useAuth();
  const [configs, setConfigs] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🔄 [useTipoConfig.js] Cargando configuración de tipos desde la base de datos');
    
    const loadConfigs = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('/procesos/tipos/config');
        
        if (response.success) {
          console.log('✅ [useTipoConfig.js] Configuración cargada desde BD:', response.data);
          setConfigs(response.data);
        } else {
          console.log('⚠️ [useTipoConfig.js] Error al cargar configuración, usando valores por defecto');
          setConfigs(DEFAULT_CONFIG);
        }
      } catch (error) {
        console.log('❌ [useTipoConfig.js] Error al cargar configuración:', error.message);
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
  console.log('🔍 [useTipoConfig.js] Obteniendo configuración para tipo:', tipo);
  
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
