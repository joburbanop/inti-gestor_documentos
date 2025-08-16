import React from 'react'; import { useQuickActions } from '../../hooks/useQuickActions';
 import {
 StrategicIcon,
 MissionIcon,
 SupportIcon,
 EvaluationIcon,
 ArrowRightIcon
 } from '../icons/DashboardIcons';
 import styles from '../../styles/components/Dashboard.module.css';
 const QuickActionsSection = () => {
 const {
 accionesRapidas,
 loading,
 error,
 cargarAccionesRapidas,
 handleAccionClick
 } = useQuickActions();
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
 <h2>Acciones Rápidas</h2>
 <p>Accede rápidamente a las funciones principales</p>
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
 <div className={styles.actionArrow}>
 <ArrowRightIcon className="w-6 h-6" />
 </div>
 </div>
 ))}
 </div>
 </div>
 );
 };
 export default QuickActionsSection;