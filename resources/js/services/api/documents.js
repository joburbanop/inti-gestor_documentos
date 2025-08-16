import apiClient from '../../lib/apiClient'; /**
 * Servicio de API para gestión de documentos
 */
 class DocumentService {
 /**
 * Obtener lista de documentos con filtros
 */
 async getDocuments(filters = {}) {
 try {
 const params = new URLSearchParams();
 // Agregar filtros a los parámetros
 Object.keys(filters).forEach(key => {
 if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
 params.append(key, filters[key]);
 }
 });
 const response = await apiClient.get(`/documents?${params.toString()}`);
 return response.data;
 } catch (error) {
 console.error('❌ [DocumentService] Error al obtener documentos:', error);
 throw error;
 }
 }
 /**
 * Obtener documento por ID
 */
 async getDocument(id) {
 try {
 const response = await apiClient.get(`/documents/${id}`);
 return response.data;
 } catch (error) {
 console.error('❌ [DocumentService] Error al obtener documento:', error);
 throw error;
 }
 }
 /**
 * Crear nuevo documento
 */
 async createDocument(formData) {
 try {
 console.log('📝 [DocumentService] Creando documento con FormData');
 const response = await apiClient.post('/documents', formData, {
 headers: {
 'Content-Type': 'multipart/form-data'
 }
 });
 console.log('✅ [DocumentService] Documento creado exitosamente');
 return response.data;
 } catch (error) {
 console.error('❌ [DocumentService] Error al crear documento:', error);
 throw error;
 }
 }
 /**
 * Actualizar documento
 */
 async updateDocument(id, data) {
 try {
 const response = await apiClient.put(`/documents/${id}`, data);
 return response.data;
 } catch (error) {
 console.error('❌ [DocumentService] Error al actualizar documento:', error);
 throw error;
 }
 }
 /**
 * Eliminar documento
 */
 async deleteDocument(id) {
 try {
 const response = await apiClient.delete(`/documents/${id}`);
 return response.data;
 } catch (error) {
 console.error('❌ [DocumentService] Error al eliminar documento:', error);
 throw error;
 }
 }
 /**
 * Descargar documento
 */
 async downloadDocument(id) {
 try {
 const response = await apiClient.post(`/documents/${id}/download`, {}, {
 responseType: 'blob'
 });
 return response.data;
 } catch (error) {
 console.error('❌ [DocumentService] Error al descargar documento:', error);
 throw error;
 }
 }
 /**
 * Buscar documentos
 */
 async searchDocuments(searchTerm, filters = {}) {
 try {
 const params = new URLSearchParams({
 q: searchTerm,
 ...filters
 });
 const response = await apiClient.get(`/documents/search?${params.toString()}`);
 return response.data;
 } catch (error) {
 console.error('❌ [DocumentService] Error al buscar documentos:', error);
 throw error;
 }
 }
 /**
 * Obtener documentos recientes
 */
 async getRecentDocuments(limit = 10) {
 try {
 const response = await apiClient.get(`/documents/recent?limit=${limit}`);
 return response.data;
 } catch (error) {
 console.error('❌ [DocumentService] Error al obtener documentos recientes:', error);
 throw error;
 }
 }
 /**
 * Obtener estadísticas de documentos
 */
 async getDocumentStats() {
 try {
 const response = await apiClient.get('/documents/stats');
 return response.data;
 } catch (error) {
 console.error('❌ [DocumentService] Error al obtener estadísticas:', error);
 throw error;
 }
 }
 }
 export default new DocumentService();