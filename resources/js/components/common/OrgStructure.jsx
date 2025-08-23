import React, { useEffect, useState } from 'react'; 
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/components/OrgStructure.module.css';
import { StructureIcon, DirectionIcon, ProcessNodeIcon } from '../icons/OrgIcons';
 const OrgStructure = () => {
 const { apiRequest } = useAuth();
 const [tiposProcesos, setTiposProcesos] = useState([]);
 const [procesosGenerales, setProcesosGenerales] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 useEffect(() => {
 let mounted = true;
 const fetchData = async () => {
 try {
 setLoading(true);
 setError(null);
 
 // Cargar tipos de procesos
 const resTipos = await apiRequest('/procesos-generales/tipos/disponibles');
 if (!resTipos?.success) throw new Error(resTipos?.message || 'Error al obtener tipos de procesos');
 const tipos = Array.isArray(resTipos.data) ? resTipos.data : [];
 
 // Cargar procesos generales
 const resProcesos = await apiRequest('/procesos-generales');
 if (!resProcesos?.success) throw new Error(resProcesos?.message || 'Error al obtener procesos generales');
 const baseProcesos = Array.isArray(resProcesos.data) ? resProcesos.data : resProcesos.data?.data || [];
 
 if (mounted) {
 setTiposProcesos(tipos);
 setProcesosGenerales(baseProcesos);
 }
 } catch (e) {
 if (mounted) setError(e.message || 'Error cargando estructura');
 } finally {
 if (mounted) setLoading(false);
 }
 };
 fetchData();
 return () => { mounted = false; };
 }, [apiRequest]);
 if (loading) {
 return (
 <div className={styles.stateBox}>
 <div className={styles.spinner} />
 <p>Cargando estructura organizacional…</p>
 </div>
 );
 }
 if (error) {
 return (
 <div className={styles.stateBox}>
 <p className={styles.errorText}>{error}</p>
 </div>
 );
 }
 // Preparar datos para la estructura jerárquica
 const sortedProcesosGeneralesForView = [...procesosGenerales].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
 
 // Agrupar procesos generales por tipo
 const procesosPorTipo = {};
 tiposProcesos.forEach(tipo => {
 procesosPorTipo[tipo.nombre] = sortedProcesosGeneralesForView.filter(proc => 
 proc.tipo_proceso?.nombre === tipo.nombre
 );
 });
 return (
 <section className={styles.container}>
 <header className={styles.header}>
 <StructureIcon className={styles.headerIcon} />
 <div>
 <h2 className={styles.title}>Documentación Sistema de Gestión de Calidad</h2>
 </div>
 </header>
 <div className={styles.hierarchicalStructure}>
 {tiposProcesos.map((tipo, index) => {
 const procesosDelTipo = procesosPorTipo[tipo.nombre] || [];
 if (procesosDelTipo.length === 0) return null;
 
 return (
 <React.Fragment key={tipo.nombre}>
 {/* Nivel de Tipo de Proceso */}
 <div className={styles.strategicLevel}>
 <div className={styles.levelHeader}>
 <h3 className={styles.levelTitle}>Procesos {tipo.titulo?.toUpperCase()}</h3>
 </div>
 <div className={styles.strategicNodes}>
 {procesosDelTipo.map((proc) => (
 <div key={proc.id} className={styles.strategicNode}>
 <div className={styles.nodeContent}>
 <DirectionIcon className={styles.nodeIcon} />
 <h4>{proc.nombre}</h4>
 {proc.descripcion && <p>{proc.descripcion}</p>}
 </div>
 </div>
 ))}
 </div>
 </div>
 
 {/* Conectores entre niveles */}
 {index < tiposProcesos.length - 1 && (
 <div className={styles.connectors}>
 <div className={styles.verticalLine}></div>
 </div>
 )}
 </React.Fragment>
 );
 })}
 

 </div>
 </section>
 );
 };
 OrgStructure.propTypes = {
 };
 export default OrgStructure;