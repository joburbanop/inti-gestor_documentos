import { useState, useEffect, useCallback } from 'react';
import processService from '../services/api/processes';
 /**
 * Hook personalizado para gestión de procesos
 */
 export const useProcesses = () => {
 const [processTypes, setProcessTypes] = useState([]);
 const [generalProcesses, setGeneralProcesses] = useState([]);
 const [internalProcesses, setInternalProcesses] = useState([]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);
 /**
 * Cargar tipos de procesos
 */
 const loadProcessTypes = useCallback(async () => {
 setLoading(true);
 setError(null);
 try {
 const response = await processService.getTypes();
 if (response.success) {
 setProcessTypes(response.data || []);
 } else {
 setError(response.message || 'Error al cargar tipos de procesos');
 }
 } catch (err) {
 setError(err.message || 'Error al cargar tipos de procesos');
 console.error('❌ [useProcesses] Error al cargar tipos:', err);
 } finally {
 setLoading(false);
 }
 }, []);
 /**
 * Cargar procesos generales por tipo
 */
 const loadGeneralProcesses = useCallback(async (tipoId) => {
 if (!tipoId) {
 setGeneralProcesses([]);
 return;
 }
 setLoading(true);
 setError(null);
 try {
 const response = await processService.getGeneralsByType(tipoId);
 if (response.success) {
 setGeneralProcesses(response.data || []);
 } else {
 setError(response.message || 'Error al cargar procesos generales');
 setGeneralProcesses([]);
 }
 } catch (err) {
 setError(err.message || 'Error al cargar procesos generales');
 console.error('❌ [useProcesses] Error al cargar generales:', err);
 setGeneralProcesses([]);
 } finally {
 setLoading(false);
 }
 }, []);
 /**
 * Cargar procesos internos por proceso general
 */
 const loadInternalProcesses = useCallback(async (generalId) => {
 if (!generalId) {
 setInternalProcesses([]);
 return;
 }
 setLoading(true);
 setError(null);
 try {
 const response = await processService.getInternalsByGeneral(generalId);
 if (response.success) {
 setInternalProcesses(response.data || []);
 } else {
 setError(response.message || 'Error al cargar procesos internos');
 setInternalProcesses([]);
 }
 } catch (err) {
 setError(err.message || 'Error al cargar procesos internos');
 console.error('❌ [useProcesses] Error al cargar internos:', err);
 setInternalProcesses([]);
 } finally {
 setLoading(false);
 }
 }, []);
 /**
 * Cargar procesos internos únicos (categorías universales)
 */
 const loadUniqueInternalProcesses = useCallback(async () => {
 setLoading(true);
 setError(null);
 try {
 const response = await processService.getInternals();
 if (response.success) {
 setInternalProcesses(response.data || []);
 } else {
 setError(response.message || 'Error al cargar procesos internos únicos');
 }
 } catch (err) {
 setError(err.message || 'Error al cargar procesos internos únicos');
 console.error('❌ [useProcesses] Error al cargar únicos:', err);
 } finally {
 setLoading(false);
 }
 }, []);
 /**
 * Cargar jerarquía completa de procesos
 */
 const loadProcessHierarchy = useCallback(async () => {
 setLoading(true);
 setError(null);
 try {
 const response = await processService.getProcessHierarchy();
 if (response) {
 setProcessTypes(response.types || []);
 setInternalProcesses(response.internals || []);
 } else {
 setError('Error al cargar jerarquía de procesos');
 }
 } catch (err) {
 setError(err.message || 'Error al cargar jerarquía de procesos');
 console.error('❌ [useProcesses] Error al cargar jerarquía:', err);
 } finally {
 setLoading(false);
 }
 }, []);
 /**
 * Crear tipo de proceso
 */
 const createProcessType = useCallback(async (data) => {
 setLoading(true);
 setError(null);
 try {
 const response = await processService.createType(data);
 if (response.success) {
 // Recargar tipos de procesos
 await loadProcessTypes();
 
 // Emitir evento para notificar a otros componentes
 localStorage.setItem('process_types_updated', Date.now().toString());
 window.dispatchEvent(new StorageEvent('storage', {
 key: 'process_types_updated',
 newValue: Date.now().toString()
 }));
 
 return response;
 } else {
 setError(response.message || 'Error al crear tipo de proceso');
 return response;
 }
 } catch (err) {
 setError(err.message || 'Error al crear tipo de proceso');
 console.error('❌ [useProcesses] Error al crear tipo:', err);
 throw err;
 } finally {
 setLoading(false);
 }
 }, [loadProcessTypes]);
 /**
 * Crear proceso general
 */
 const createGeneralProcess = useCallback(async (data) => {
 setLoading(true);
 setError(null);
 try {
 const response = await processService.createGeneral(data);
 if (response.success) {
 // Recargar procesos generales del tipo correspondiente
 await loadGeneralProcesses(data.tipo_proceso_id);
 return response;
 } else {
 setError(response.message || 'Error al crear proceso general');
 return response;
 }
 } catch (err) {
 setError(err.message || 'Error al crear proceso general');
 console.error('❌ [useProcesses] Error al crear general:', err);
 throw err;
 } finally {
 setLoading(false);
 }
 }, [loadGeneralProcesses]);
 /**
 * Crear proceso interno
 */
 const createInternalProcess = useCallback(async (data) => {
 setLoading(true);
 setError(null);
 try {
 const response = await processService.createInternal(data);
 if (response.success) {
 // Recargar procesos internos del general correspondiente
 await loadInternalProcesses(data.proceso_general_id);
 return response;
 } else {
 setError(response.message || 'Error al crear proceso interno');
 return response;
 }
 } catch (err) {
 setError(err.message || 'Error al crear proceso interno');
 console.error('❌ [useProcesses] Error al crear interno:', err);
 throw err;
 } finally {
 setLoading(false);
 }
 }, [loadInternalProcesses]);
 /**
 * Actualizar tipo de proceso
 */
 const updateProcessType = useCallback(async (id, data) => {
 setLoading(true);
 setError(null);
 try {
 const response = await processService.updateType(id, data);
 if (response.success) {
 // Actualizar en la lista
 setProcessTypes(prev =>
 prev.map(type =>
 type.id === id ? { ...type, ...response.data } : type
 )
 );
 return response;
 } else {
 setError(response.message || 'Error al actualizar tipo de proceso');
 return response;
 }
 } catch (err) {
 setError(err.message || 'Error al actualizar tipo de proceso');
 console.error('❌ [useProcesses] Error al actualizar tipo:', err);
 throw err;
 } finally {
 setLoading(false);
 }
 }, []);
 /**
 * Actualizar proceso general
 */
 const updateGeneralProcess = useCallback(async (id, data) => {
 setLoading(true);
 setError(null);
 try {
 const response = await processService.updateGeneral(id, data);
 if (response.success) {
 // Actualizar en la lista
 setGeneralProcesses(prev =>
 prev.map(process =>
 process.id === id ? { ...process, ...response.data } : process
 )
 );
 return response;
 } else {
 setError(response.message || 'Error al actualizar proceso general');
 return response;
 }
 } catch (err) {
 setError(err.message || 'Error al actualizar proceso general');
 console.error('❌ [useProcesses] Error al actualizar general:', err);
 throw err;
 } finally {
 setLoading(false);
 }
 }, []);
 /**
 * Actualizar proceso interno
 */
 const updateInternalProcess = useCallback(async (id, data) => {
 setLoading(true);
 setError(null);
 try {
 const response = await processService.updateInternal(id, data);
 if (response.success) {
 // Actualizar en la lista
 setInternalProcesses(prev =>
 prev.map(process =>
 process.id === id ? { ...process, ...response.data } : process
 )
 );
 return response;
 } else {
 setError(response.message || 'Error al actualizar proceso interno');
 return response;
 }
 } catch (err) {
 setError(err.message || 'Error al actualizar proceso interno');
 console.error('❌ [useProcesses] Error al actualizar interno:', err);
 throw err;
 } finally {
 setLoading(false);
 }
 }, []);
 /**
 * Eliminar tipo de proceso
 */
 const deleteProcessType = useCallback(async (id) => {
 setLoading(true);
 setError(null);
 try {
 const response = await processService.deleteType(id);
 if (response.success) {
 // Remover de la lista
 setProcessTypes(prev => prev.filter(type => type.id !== id));
 
 // Emitir evento para notificar a otros componentes
 localStorage.setItem('process_types_deleted', Date.now().toString());
 window.dispatchEvent(new StorageEvent('storage', {
 key: 'process_types_deleted',
 newValue: Date.now().toString()
 }));
 
 return response;
 } else {
 setError(response.message || 'Error al eliminar tipo de proceso');
 return response;
 }
 } catch (err) {
 // Extraer el mensaje de error específico del backend
 let errorMessage = 'Error al eliminar tipo de proceso';
 if (err.response && err.response.data && err.response.data.message) {
 errorMessage = err.response.data.message;
 } else if (err.message) {
 errorMessage = err.message;
 }
 setError(errorMessage);
 console.error('❌ [useProcesses] Error al eliminar tipo:', err);
 throw err;
 } finally {
 setLoading(false);
 }
 }, []);
 /**
 * Eliminar proceso general
 */
 const deleteGeneralProcess = useCallback(async (id) => {
 setLoading(true);
 setError(null);
 try {
 const response = await processService.deleteGeneral(id);
 if (response.success) {
 // Remover de la lista
 setGeneralProcesses(prev => prev.filter(process => process.id !== id));
 return response;
 } else {
 setError(response.message || 'Error al eliminar proceso general');
 return response;
 }
 } catch (err) {
 // Extraer el mensaje de error específico del backend
 let errorMessage = 'Error al eliminar proceso general';
 if (err.response && err.response.data && err.response.data.message) {
 errorMessage = err.response.data.message;
 } else if (err.message) {
 errorMessage = err.message;
 }
 setError(errorMessage);
 console.error('❌ [useProcesses] Error al eliminar general:', err);
 throw err;
 } finally {
 setLoading(false);
 }
 }, []);
 /**
 * Eliminar proceso interno
 */
 const deleteInternalProcess = useCallback(async (id) => {
 setLoading(true);
 setError(null);
 try {
 const response = await processService.deleteInternal(id);
 if (response.success) {
 // Remover de la lista
 setInternalProcesses(prev => prev.filter(process => process.id !== id));
 return response;
 } else {
 setError(response.message || 'Error al eliminar proceso interno');
 return response;
 }
 } catch (err) {
 // Extraer el mensaje de error específico del backend
 let errorMessage = 'Error al eliminar proceso interno';
 if (err.response && err.response.data && err.response.data.message) {
 errorMessage = err.response.data.message;
 } else if (err.message) {
 errorMessage = err.message;
 }
 setError(errorMessage);
 console.error('❌ [useProcesses] Error al eliminar interno:', err);
 throw err;
 } finally {
 setLoading(false);
 }
 }, []);
 return {
 processTypes,
 generalProcesses,
 internalProcesses,
 loading,
 error,
 loadProcessTypes,
 loadGeneralProcesses,
 loadInternalProcesses,
 loadUniqueInternalProcesses,
 loadProcessHierarchy,
 createProcessType,
 createGeneralProcess,
 createInternalProcess,
 updateProcessType,
 updateGeneralProcess,
 updateInternalProcess,
 deleteProcessType,
 deleteGeneralProcess,
 deleteInternalProcess
 };
 };