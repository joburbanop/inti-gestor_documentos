import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useProcesosInternos = () => {
  const { apiRequest } = useAuth();
  const [procesosInternos, setProcesosInternos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarProcesosInternos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [useProcesosInternos] Cargando procesos internos...');
      const response = await apiRequest('/processes/internals');
      console.log('📊 [useProcesosInternos] Respuesta:', response);
      if (response?.success) {
        const data = Array.isArray(response.data) ? response.data : [];
        console.log('✅ [useProcesosInternos] Procesos internos cargados:', data);
        setProcesosInternos(data);
      } else {
        console.error('❌ [useProcesosInternos] Error en respuesta:', response);
        setError('Error al cargar los procesos internos');
      }
    } catch (error) {
      console.error('❌ [useProcesosInternos] Error cargando procesos internos:', error);
      setError('Error al cargar los procesos internos');
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  const getProcesoInternoByName = useCallback((nombre) => {
    return procesosInternos.find(proceso => proceso.nombre === nombre);
  }, [procesosInternos]);

  const getProcesoInternoById = useCallback((id) => {
    return procesosInternos.find(proceso => proceso.id === id);
  }, [procesosInternos]);

  useEffect(() => {
    cargarProcesosInternos();
  }, [cargarProcesosInternos]);

  return {
    procesosInternos,
    loading,
    error,
    cargarProcesosInternos,
    getProcesoInternoByName,
    getProcesoInternoById
  };
};
