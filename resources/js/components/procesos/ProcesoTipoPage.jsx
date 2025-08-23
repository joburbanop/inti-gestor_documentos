import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTipoConfig } from '../../hooks/useTipoConfig';
import { getTipoConfig } from '../../utils/tipoConfig';
import { renderIcon } from '../../utils/iconMapping';
import { EditIcon, DeleteIcon } from '../icons/CrudIcons';
import ProcesoModal from './ProcesoModal';
import ConfirmModal from '../common/ConfirmModal';
import useConfirmModal from '../../hooks/useConfirmModal';
import styles from '../../styles/components/Documentos.module.css';
const ProcesoTipoPage = ({ tipo: propTipo }) => {
 const { tipo: paramTipo } = useParams();
 const navigate = useNavigate();
 const { apiRequest } = useAuth();
 // Usar el tipo de la prop si está disponible, sino usar el parámetro de URL
 const tipo = propTipo || paramTipo;
 const { configs, loading: configLoading, error: configError } = useTipoConfig();
 const config = getTipoConfig(tipo, configs);
 const [items, setItems] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [showProcesoModal, setShowProcesoModal] = useState(false);
 const [editingProceso, setEditingProceso] = useState(null);
 const { modalState, showConfirmModal, hideConfirmModal, executeConfirm } = useConfirmModal();
 useEffect(() => {
 let mounted = true;
 (async () => {
 try {
 setLoading(true);
 setError(null);
 const res = await apiRequest(`/procesos?tipo=${encodeURIComponent(config.key)}`);
 if (!res?.success) throw new Error(res?.message || 'Error al cargar procesos');
 if (mounted) {
 setItems(res.data || []);
 }
 } catch (e) {
 if (mounted) {
 setError(e.message || 'Error');
 }
 } finally {
 if (mounted) setLoading(false);
 }
 })();
 return () => { mounted = false; };
 }, [apiRequest, config.key]);

 const handleProcesoSuccess = (procesoData) => {
   console.log('✅ Proceso guardado exitosamente:', procesoData);
   
   if (editingProceso) {
     // Actualizar el proceso existente en la lista
     setItems(prev => prev.map(item => 
       item.id === editingProceso.id ? procesoData : item
     ));
   } else {
     // Agregar el nuevo proceso a la lista
     setItems(prev => [...prev, procesoData]);
   }
   
   setShowProcesoModal(false);
   setEditingProceso(null);
 };

 const handleCloseProcesoModal = () => {
   setShowProcesoModal(false);
   setEditingProceso(null);
 };

 const handleEditProceso = (proceso) => {
   setEditingProceso(proceso);
   setShowProcesoModal(true);
 };

 const handleDeleteProceso = (proceso) => {
   showConfirmModal({
     title: 'Eliminar Proceso',
     message: `¿Estás seguro de que deseas eliminar el proceso "${proceso.nombre}"?`,
     onConfirm: () => confirmDeleteProceso(proceso.id),
     onCancel: hideConfirmModal
   });
 };

 const confirmDeleteProceso = async (procesoId) => {
   try {
     console.log('🔄 [ProcesoTipoPage] Intentando eliminar proceso general ID:', procesoId);
     
     const response = await apiRequest(`/procesos-generales/${procesoId}`, {
       method: 'DELETE'
     });

     console.log('📋 [ProcesoTipoPage] Respuesta del servidor:', response);

     if (response.success) {
       console.log('✅ [ProcesoTipoPage] Proceso eliminado exitosamente');
       // Remover el proceso de la lista
       setItems(prev => prev.filter(p => p.id !== procesoId));
       hideConfirmModal();
     } else {
       console.error('❌ [ProcesoTipoPage] Error en respuesta del servidor:', response.message);
       alert('Error al eliminar el proceso: ' + response.message);
       hideConfirmModal();
     }
   } catch (error) {
     console.error('❌ [ProcesoTipoPage] Error al eliminar proceso:', error);
     console.log('🔍 [ProcesoTipoPage] Error completo:', error);
     console.log('🔍 [ProcesoTipoPage] Error response:', error.response);
     console.log('🔍 [ProcesoTipoPage] Error response data:', error.response?.data);
     
     // Extraer el mensaje de error específico del backend
     let errorMessage = 'Error al eliminar el proceso';
     if (error.response && error.response.data && error.response.data.message) {
       errorMessage = error.response.data.message;
       console.log('✅ [ProcesoTipoPage] Mensaje extraído del backend:', errorMessage);
     } else if (error.message) {
       errorMessage = error.message;
       console.log('⚠️ [ProcesoTipoPage] Usando mensaje genérico:', errorMessage);
     }
     
     alert(errorMessage);
     hideConfirmModal();
   }
 };

 return (
 <div className="min-h-screen bg-gray-50 pt-16">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
 <div className="flex items-center justify-between mb-6">
   <div className="flex items-center">
     <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
       {renderIcon('process', "w-6 h-6")}
     </div>
     <div>
       <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
       {config.subtitle && <p className="text-gray-600">{config.subtitle}</p>}
     </div>
   </div>
   <button
     onClick={() => setShowProcesoModal(true)}
     className={styles.createButton}
   >
     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
     </svg>
     Crear Nuevo Proceso
   </button>
 </div>
 {configLoading ? (
 <div className="text-center py-12">Cargando configuración...</div>
 ) : configError ? (
 <div className="text-center py-12 text-red-600">Error cargando configuración: {configError}</div>
 ) : loading ? (
 <div className="text-center py-12">Cargando procesos...</div>
 ) : error ? (
 <div className="text-center py-12 text-red-600">{String(error)}</div>
 ) : items.length === 0 ? (
 <div className="text-center py-12 text-gray-500">{config.emptyText}</div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {items.map((p) => (
   <div key={p.id} className="rounded-lg p-6 border bg-white hover:shadow-md transition-shadow">
     {/* Header con botones de acción */}
     <div className="flex justify-between items-start mb-3">
       <div className="flex items-start space-x-4 flex-1">
         {p.icono && (
           <div className="text-gray-600 flex-shrink-0">
             {renderIcon(p.icono, "w-8 h-8")}
           </div>
         )}
         <div className="flex-1">
           <Link 
             to={`/procesos/${config.key}/${p.id}`}
             className="text-lg font-semibold text-blue-600 hover:text-blue-800 transition-colors"
           >
             {p.nombre}
           </Link>
           {p.codigo && <div className="text-gray-500 text-sm">{p.codigo}</div>}
         </div>
       </div>
       
       {/* Botones de acción */}
       <div className={styles.cardActions}>
         <button
           onClick={(e) => {
             e.stopPropagation();
             handleEditProceso(p);
           }}
           className={styles.editButton}
           title="Editar proceso"
         >
           <EditIcon className="w-4 h-4" />
         </button>
         <button
           onClick={(e) => {
             e.stopPropagation();
             handleDeleteProceso(p);
           }}
           className={styles.deleteButton}
           title="Eliminar proceso"
         >
           <DeleteIcon className="w-4 h-4" />
         </button>
       </div>
     </div>
     
     {/* Descripción */}
     {p.descripcion && (
       <p className="text-gray-700 text-sm leading-relaxed">{p.descripcion}</p>
     )}
   </div>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* Modal para crear/editar proceso */}
 <ProcesoModal
   isOpen={showProcesoModal}
   onClose={handleCloseProcesoModal}
   onSuccess={handleProcesoSuccess}
   editingProceso={editingProceso}
 />

 {/* Modal de confirmación para eliminar */}
 <ConfirmModal
   isOpen={modalState.isOpen}
   onClose={hideConfirmModal}
   onConfirm={executeConfirm}
   title={modalState.title}
   message={modalState.message}
   confirmText={modalState.confirmText}
   cancelText={modalState.cancelText}
   type={modalState.type}
 />
 </div>
 );
 };
 export default ProcesoTipoPage;