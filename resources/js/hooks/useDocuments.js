import { useState, useEffect, useCallback } from 'react'; import documentService from '../services/api/documents';
 /**
 * Hook personalizado para gestión de documentos
 */
 export const useDocuments = () => {
 const [documents, setDocuments] = useState([]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);
 const [pagination, setPagination] = useState({
 current_page: 1,
 last_page: 1,
 per_page: 15,
 total: 0
 });
 /**
 * Cargar documentos con filtros
 */
 const loadDocuments = useCallback(async (filters = {}) => {
 setLoading(true);
 setError(null);
 try {
 const response = await documentService.getDocuments(filters);
 if (response.success) {
 setDocuments(response.data.data || []);
 setPagination({
 current_page: response.data.current_page || 1,
 last_page: response.data.last_page || 1,
 per_page: response.data.per_page || 15,
 total: response.data.total || 0
 });
 } else {
 setError(response.message || 'Error al cargar documentos');
 }
 } catch (err) {
 setError(err.message || 'Error al cargar documentos');
 console.error('❌ [useDocuments] Error:', err);
 } finally {
 setLoading(false);
 }
 }, []);
 /**
 * Crear nuevo documento
 */
 const createDocument = useCallback(async (formData) => {
 setLoading(true);
 setError(null);
 try {
 const response = await documentService.createDocument(formData);
 if (response.success) {
 // Recargar documentos después de crear uno nuevo
 await loadDocuments();
 return response;
 } else {
 setError(response.message || 'Error al crear documento');
 return response;
 }
 } catch (err) {
 setError(err.message || 'Error al crear documento');
 console.error('❌ [useDocuments] Error al crear:', err);
 throw err;
 } finally {
 setLoading(false);
 }
 }, [loadDocuments]);
 /**
 * Actualizar documento
 */
 const updateDocument = useCallback(async (id, data) => {
 setLoading(true);
 setError(null);
 try {
 const response = await documentService.updateDocument(id, data);
 if (response.success) {
 // Actualizar documento en la lista
 setDocuments(prev =>
 prev.map(doc =>
 doc.id === id ? { ...doc, ...response.data } : doc
 )
 );
 return response;
 } else {
 setError(response.message || 'Error al actualizar documento');
 return response;
 }
 } catch (err) {
 setError(err.message || 'Error al actualizar documento');
 console.error('❌ [useDocuments] Error al actualizar:', err);
 throw err;
 } finally {
 setLoading(false);
 }
 }, []);
 /**
 * Eliminar documento
 */
 const deleteDocument = useCallback(async (id) => {
 setLoading(true);
 setError(null);
 try {
 const response = await documentService.deleteDocument(id);
 if (response.success) {
 // Remover documento de la lista
 setDocuments(prev => prev.filter(doc => doc.id !== id));
 return response;
 } else {
 setError(response.message || 'Error al eliminar documento');
 return response;
 }
 } catch (err) {
 setError(err.message || 'Error al eliminar documento');
 console.error('❌ [useDocuments] Error al eliminar:', err);
 throw err;
 } finally {
 setLoading(false);
 }
 }, []);
 /**
 * Buscar documentos
 */
 const searchDocuments = useCallback(async (searchTerm, filters = {}) => {
 setLoading(true);
 setError(null);
 try {
 const response = await documentService.searchDocuments(searchTerm, filters);
 if (response.success) {
 setDocuments(response.data.data || []);
 setPagination({
 current_page: response.data.current_page || 1,
 last_page: response.data.last_page || 1,
 per_page: response.data.per_page || 15,
 total: response.data.total || 0
 });
 } else {
 setError(response.message || 'Error al buscar documentos');
 }
 } catch (err) {
 setError(err.message || 'Error al buscar documentos');
 console.error('❌ [useDocuments] Error en búsqueda:', err);
 } finally {
 setLoading(false);
 }
 }, []);
 /**
 * Obtener documentos recientes
 */
 const getRecentDocuments = useCallback(async (limit = 10) => {
 setLoading(true);
 setError(null);
 try {
 const response = await documentService.getRecentDocuments(limit);
 if (response.success) {
 return response.data;
 } else {
 setError(response.message || 'Error al obtener documentos recientes');
 return [];
 }
 } catch (err) {
 setError(err.message || 'Error al obtener documentos recientes');
 console.error('❌ [useDocuments] Error al obtener recientes:', err);
 return [];
 } finally {
 setLoading(false);
 }
 }, []);
 /**
 * Obtener estadísticas
 */
 const getStats = useCallback(async () => {
 try {
 const response = await documentService.getDocumentStats();
 if (response.success) {
 return response.data;
 } else {
 setError(response.message || 'Error al obtener estadísticas');
 return null;
 }
 } catch (err) {
 setError(err.message || 'Error al obtener estadísticas');
 console.error('❌ [useDocuments] Error al obtener stats:', err);
 return null;
 }
 }, []);
 /**
 * Descargar documento
 */
 const downloadDocument = useCallback(async (id) => {
 try {
 const blob = await documentService.downloadDocument(id);
 // Crear URL del blob y descargar
 const url = window.URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `documento_${id}.pdf`; // Nombre por defecto
 document.body.appendChild(a);
 a.click();
 window.URL.revokeObjectURL(url);
 document.body.removeChild(a);
 return true;
 } catch (err) {
 setError(err.message || 'Error al descargar documento');
 console.error('❌ [useDocuments] Error al descargar:', err);
 throw err;
 }
 }, []);
 return {
 documents,
 loading,
 error,
 pagination,
 loadDocuments,
 createDocument,
 updateDocument,
 deleteDocument,
 searchDocuments,
 getRecentDocuments,
 getStats,
 downloadDocument
 };
 };