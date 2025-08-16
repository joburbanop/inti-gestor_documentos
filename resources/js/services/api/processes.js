import apiClient from '../../lib/apiClient'; /**
 * Servicio de API para gestión de procesos
 */
 class ProcessService {
 /**
 * Obtener tipos de procesos
 */
 async getProcessTypes() {
 try {
 const response = await apiClient.get('/processes/types');
 return response.data;
 } catch (error) {
 console.error('❌ [ProcessService] Error al obtener tipos de procesos:', error);
 throw error;
 }
 }
 /**
 * Obtener procesos generales por tipo
 */
 async getGeneralProcessesByType(tipoId) {
 try {
 const response = await apiClient.get(`/processes/types/${tipoId}/generals`);
 return response.data;
 } catch (error) {
 console.error('❌ [ProcessService] Error al obtener procesos generales:', error);
 throw error;
 }
 }
 /**
 * Obtener procesos internos por proceso general
 */
 async getInternalProcessesByGeneral(generalId) {
 try {
 const response = await apiClient.get(`/processes/generals/${generalId}/internals`);
 return response.data;
 } catch (error) {
 console.error('❌ [ProcessService] Error al obtener procesos internos:', error);
 throw error;
 }
 }
 /**
 * Obtener procesos internos únicos (categorías universales)
 */
 async getUniqueInternalProcesses() {
 try {
 const response = await apiClient.get('/processes/internals');
 return response.data;
 } catch (error) {
 console.error('❌ [ProcessService] Error al obtener procesos internos únicos:', error);
 throw error;
 }
 }
 /**
 * Crear nuevo tipo de proceso
 */
 async createProcessType(data) {
 try {
 const response = await apiClient.post('/processes/types', data);
 return response.data;
 } catch (error) {
 console.error('❌ [ProcessService] Error al crear tipo de proceso:', error);
 throw error;
 }
 }
 /**
 * Crear nuevo proceso general
 */
 async createGeneralProcess(data) {
 try {
 const response = await apiClient.post('/processes/generals', data);
 return response.data;
 } catch (error) {
 console.error('❌ [ProcessService] Error al crear proceso general:', error);
 throw error;
 }
 }
 /**
 * Crear nuevo proceso interno
 */
 async createInternalProcess(data) {
 try {
 const response = await apiClient.post('/processes/internals', data);
 return response.data;
 } catch (error) {
 console.error('❌ [ProcessService] Error al crear proceso interno:', error);
 throw error;
 }
 }
 /**
 * Actualizar tipo de proceso
 */
 async updateProcessType(id, data) {
 try {
 const response = await apiClient.put(`/processes/types/${id}`, data);
 return response.data;
 } catch (error) {
 console.error('❌ [ProcessService] Error al actualizar tipo de proceso:', error);
 throw error;
 }
 }
 /**
 * Actualizar proceso general
 */
 async updateGeneralProcess(id, data) {
 try {
 const response = await apiClient.put(`/processes/generals/${id}`, data);
 return response.data;
 } catch (error) {
 console.error('❌ [ProcessService] Error al actualizar proceso general:', error);
 throw error;
 }
 }
 /**
 * Actualizar proceso interno
 */
 async updateInternalProcess(id, data) {
 try {
 const response = await apiClient.put(`/processes/internals/${id}`, data);
 return response.data;
 } catch (error) {
 console.error('❌ [ProcessService] Error al actualizar proceso interno:', error);
 throw error;
 }
 }
 /**
 * Eliminar tipo de proceso
 */
 async deleteProcessType(id) {
 try {
 const response = await apiClient.delete(`/processes/types/${id}`);
 return response.data;
 } catch (error) {
 console.error('❌ [ProcessService] Error al eliminar tipo de proceso:', error);
 throw error;
 }
 }
 /**
 * Eliminar proceso general
 */
 async deleteGeneralProcess(id) {
 try {
 const response = await apiClient.delete(`/processes/generals/${id}`);
 return response.data;
 } catch (error) {
 console.error('❌ [ProcessService] Error al eliminar proceso general:', error);
 throw error;
 }
 }
 /**
 * Eliminar proceso interno
 */
 async deleteInternalProcess(id) {
 try {
 const response = await apiClient.delete(`/processes/internals/${id}`);
 return response.data;
 } catch (error) {
 console.error('❌ [ProcessService] Error al eliminar proceso interno:', error);
 throw error;
 }
 }
 /**
 * Obtener jerarquía completa de procesos
 */
 async getProcessHierarchy() {
 try {
 const [types, internals] = await Promise.all([
 this.getProcessTypes(),
 this.getUniqueInternalProcesses()
 ]);
 return {
 types: types.data || [],
 internals: internals.data || []
 };
 } catch (error) {
 console.error('❌ [ProcessService] Error al obtener jerarquía de procesos:', error);
 throw error;
 }
 }
 }
 export default new ProcessService();