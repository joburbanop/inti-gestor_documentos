import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { renderIcon } from '../utils/iconMapping';

export const useProcessTypes = () => {
  const { apiRequest } = useAuth();
  const [processTypes, setProcessTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarTiposProceso = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [useProcessTypes] Cargando tipos de proceso...');
      // Agregar timestamp para evitar cache del navegador
      const response = await apiRequest('/procesos-tipos?_t=' + Date.now());
      console.log('📊 [useProcessTypes] Respuesta:', response);
      
      if (response?.success) {
        const data = Array.isArray(response.data) ? response.data : [];
        console.log('✅ [useProcessTypes] Tipos cargados:', data.length, 'tipos');
        
        // Verificar si hay tipos inesperados (como "nuevo" o "CREACION")
        const tiposInesperados = data.filter(tipo => 
          tipo.nombre === 'nuevo' || 
          tipo.nombre === 'CREACION' || 
          !['estrategico', 'misional', 'apoyo', 'evaluacion'].includes(tipo.nombre)
        );
        
        if (tiposInesperados.length > 0) {
          console.warn('⚠️ [useProcessTypes] Tipos inesperados detectados:', tiposInesperados);
          // Forzar recarga sin cache
          const responseSinCache = await apiRequest('/procesos-tipos?_t=' + Date.now() + '&nocache=1');
          if (responseSinCache?.success) {
            const dataSinCache = Array.isArray(responseSinCache.data) ? responseSinCache.data : [];
            console.log('✅ [useProcessTypes] Tipos recargados sin cache:', dataSinCache.length, 'tipos');
            setProcessTypes(dataSinCache);
          } else {
            setProcessTypes(data);
          }
        } else {
          setProcessTypes(data);
        }
      } else {
        console.error('❌ [useProcessTypes] Error en respuesta:', response);
        setError('Error al cargar los tipos de proceso');
      }
    } catch (error) {
      console.error('❌ [useProcessTypes] Error cargando tipos de proceso:', error);
      setError('Error al cargar los tipos de proceso');
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  const getProcessTypeByName = useCallback((nombre) => {
    return processTypes.find(tipo => tipo.nombre === nombre);
  }, [processTypes]);

  const getProcessTypeById = useCallback((id) => {
    return processTypes.find(tipo => tipo.id === id);
  }, [processTypes]);

  useEffect(() => {
    cargarTiposProceso();
  }, [cargarTiposProceso]);

  return {
    processTypes,
    loading,
    error,
    cargarTiposProceso,
    getProcessTypeByName,
    getProcessTypeById
  };
};
