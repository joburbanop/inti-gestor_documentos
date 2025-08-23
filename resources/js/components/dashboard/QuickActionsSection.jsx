import React, { useState } from 'react'; 
import { useQuickActions } from '../../hooks/useQuickActions';
import {
 StrategicIcon,
 MissionIcon,
 SupportIcon,
 EvaluationIcon,
 ArrowRightIcon
} from '../icons/DashboardIcons';
import { PlusIcon, EditIcon, DeleteIcon } from '../icons/CrudIcons';
import TipoProcesoModal from '../procesos/TipoProcesoModal';
import ConfirmModal from '../common/ConfirmModal';
import useConfirmModal from '../../hooks/useConfirmModal';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/components/Dashboard.module.css';
import documentStyles from '../../styles/components/Documentos.module.css';
 const QuickActionsSection = () => {
 const {
 accionesRapidas,
 loading,
 error,
 cargarAccionesRapidas,
 handleAccionClick
 } = useQuickActions();
 
 const { apiRequest } = useAuth();
 const [showTipoProcesoModal, setShowTipoProcesoModal] = useState(false);
 const [editingTipo, setEditingTipo] = useState(null);
 const {
   modalState,
   showConfirmModal,
   hideConfirmModal,
   executeConfirm
 } = useConfirmModal();
 
 const handleCreateTipoProceso = (e) => {
   e.stopPropagation(); // Evitar que se active el click de la tarjeta
   setEditingTipo(null);
   setShowTipoProcesoModal(true);
 };

 const handleEditTipoProceso = (e, tipo) => {
   e.stopPropagation(); // Evitar que se active el click de la tarjeta
   setEditingTipo(tipo);
   setShowTipoProcesoModal(true);
 };

 const handleDeleteTipoProceso = (e, tipo) => {
   e.stopPropagation(); // Evitar que se activate el click de la tarjeta
   showConfirmModal({
     title: 'Eliminar Tipo de Proceso',
     message: `¿Estás seguro de que deseas eliminar el tipo de proceso "${tipo.titulo}"?`,
     confirmText: 'Eliminar',
     cancelText: 'Cancelar',
     onConfirm: () => deleteTipoProceso(tipo.id),
     type: 'danger'
   });
 };

 const deleteTipoProceso = async (tipoId) => {
   try {
     const response = await apiRequest(`/procesos-tipos/${tipoId}`, {
       method: 'DELETE'
     });

     if (response.success) {
       console.log('✅ Tipo de proceso eliminado exitosamente');
       cargarAccionesRapidas(); // Recargar la lista
       hideConfirmModal();
     } else {
       console.error('❌ Error al eliminar tipo de proceso:', response.message);
       alert('Error al eliminar el tipo de proceso: ' + response.message);
       hideConfirmModal();
     }
   } catch (error) {
     console.error('❌ Error al eliminar tipo de proceso:', error);
     
     // Extraer el mensaje de error específico del backend
     let errorMessage = 'Error al eliminar el tipo de proceso';
     if (error.response && error.response.data && error.response.data.message) {
       errorMessage = error.response.data.message;
     } else if (error.message) {
       errorMessage = error.message;
     }
     
     alert(errorMessage);
     hideConfirmModal();
   }
 };
 
 const handleTipoProcesoSuccess = (tipoData) => {
   console.log('✅ Tipo de proceso guardado exitosamente:', tipoData);
   setShowTipoProcesoModal(false);
   setEditingTipo(null);
   // Recargar las acciones rápidas para actualizar los tipos
   cargarAccionesRapidas();
 };
 
 const handleCloseTipoProcesoModal = () => {
   setShowTipoProcesoModal(false);
   setEditingTipo(null);
 };
 
 const getIconComponent = (iconName) => {
 const iconMap = {
 'building': StrategicIcon,
 'target': MissionIcon,
 'support': SupportIcon,
 'chart': EvaluationIcon
 };
 const IconComponent = iconMap[iconName] || StrategicIcon;
 return <IconComponent className="w-8 h-8" />;
 };
 if (loading) {
 return (
 <div className={styles.quickActionsSection}>
 <div className={styles.sectionHeader}>
 <h2>Acciones Rápidas</h2>
 <p>Accede rápidamente a las funciones principales</p>
 </div>
 <div className={styles.loadingContainer}>
 <div className={styles.loadingSpinner}></div>
 <p>Cargando acciones rápidas...</p>
 </div>
 </div>
 );
 }
 if (error) {
 return (
 <div className={styles.quickActionsSection}>
 <div className={styles.sectionHeader}>
 <h2>Acciones Rápidas</h2>
 <p>Accede rápidamente a las funciones principales</p>
 </div>
 <div className={styles.errorContainer}>
 <p>❌ {error}</p>
 <button
 onClick={cargarAccionesRapidas}
 className={styles.retryButton}
 >
 Reintentar
 </button>
 </div>
 </div>
 );
 }
 return (
 <div className={styles.quickActionsSection}>
 <div className={styles.sectionHeader}>
 <div className={styles.headerContent}>
 <div>
 <h2>Acciones Rápidas</h2>
 <p>Accede rápidamente a las funciones principales</p>
 </div>
 <button
 onClick={handleCreateTipoProceso}
 className={documentStyles.createButton}
 title="Crear nuevo tipo de proceso"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
 </svg>
 Nuevo Tipo de Proceso
 </button>
 </div>
 </div>
 <div className={styles.quickActionsGrid}>
 {accionesRapidas.map((accion) => (
 <div
 key={accion.id}
 className={styles.quickActionCard}
 onClick={() => handleAccionClick(accion)}
 style={{
 borderLeft: `4px solid ${accion.color}`,
 cursor: 'pointer'
 }}
 >
 <div className={styles.actionIcon} style={{ color: accion.color }}>
 {getIconComponent(accion.icono)}
 </div>
 <div className={styles.actionContent}>
 <h3 className={styles.actionTitle}>{accion.titulo}</h3>
 <p className={styles.actionDescription}>{accion.descripcion}</p>
 <div className={styles.actionStats}>
 <span className={styles.statBadge}>
 {accion.total_procesos} proceso{accion.total_procesos !== 1 ? 's' : ''}
 </span>
 </div>
 </div>
 <div className={styles.actionControls}>
 <div className={documentStyles.cardActions}>
 <button
 onClick={(e) => handleEditTipoProceso(e, accion)}
 className={documentStyles.editButton}
 title="Editar tipo de proceso"
 >
 <EditIcon className="w-4 h-4" />
 </button>
 <button
 onClick={(e) => handleDeleteTipoProceso(e, accion)}
 className={documentStyles.deleteButton}
 title="Eliminar tipo de proceso"
 >
 <DeleteIcon className="w-4 h-4" />
 </button>
 </div>
 <div className={styles.actionArrow}>
 <ArrowRightIcon className="w-6 h-6" />
 </div>
 </div>
 </div>
 ))}
 </div>
 
 {/* Modal para crear/editar tipo de proceso */}
 <TipoProcesoModal
 isOpen={showTipoProcesoModal}
 onClose={handleCloseTipoProcesoModal}
 onSuccess={handleTipoProcesoSuccess}
 editingTipo={editingTipo}
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
 tipo={modalState.type}
 />
 </div>
 );
 };
 export default QuickActionsSection;