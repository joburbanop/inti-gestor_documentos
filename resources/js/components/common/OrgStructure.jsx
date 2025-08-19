import React, { useEffect, useState } from 'react'; import PropTypes from 'prop-types';
 import { useAuth } from '../../contexts/AuthContext';
 import styles from '../../styles/components/OrgStructure.module.css';
 import { StructureIcon, DirectionIcon, ProcessNodeIcon } from '../icons/OrgIcons';
 const OrgStructure = () => {
 const { apiRequest } = useAuth();
 const [procesosGenerales, setProcesosGenerales] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 useEffect(() => {
 let mounted = true;
 const fetchData = async () => {
 try {
 setLoading(true);
 setError(null);
 const resProcesos = await apiRequest('/procesos-generales');
 if (!resProcesos?.success) throw new Error(resProcesos?.message || 'Error al obtener procesos generales');
 const baseProcesos = Array.isArray(resProcesos.data) ? resProcesos.data : resProcesos.data?.data || [];
 // Traer procesos internos por proceso general en paralelo
 const sortedProcesos = [...baseProcesos].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
 const withProcesosInternos = await Promise.all(
 sortedProcesos.map(async (proceso) => {
 try {
 const resProcs = await apiRequest(`/procesos-generales/${proceso.id}/procesos-internos`);
 const procesosInternos = resProcs?.success ? (resProcs.data || []) : [];
 return { ...proceso, procesos_internos: procesosInternos };
 } catch (_) {
 return { ...proceso, procesos_internos: [] };
 }
 })
 );
 if (mounted) setProcesosGenerales(withProcesosInternos);
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
 const procesoIdToInfo = new Map();
 sortedProcesosGeneralesForView.forEach((proc) => {
 (proc.procesos_internos || []).forEach((p) => {
 const key = p.id ?? `${p.nombre}`;
 if (!procesoIdToInfo.has(key)) {
 procesoIdToInfo.set(key, { ...p, procesos_generales: [proc.nombre].filter(Boolean) });
 } else {
 const entry = procesoIdToInfo.get(key);
 if (proc.nombre && !entry.procesos_generales.includes(proc.nombre)) entry.procesos_generales.push(proc.nombre);
 }
 });
 });
 const allProcesos = Array.from(procesoIdToInfo.values()).sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
 return (
 <section className={styles.container}>
 <header className={styles.header}>
 <StructureIcon className={styles.headerIcon} />
 <div>
 <h2 className={styles.title}>Documentación Sistema de Gestión de Calidad</h2>
 </div>
 </header>
 <div className={styles.hierarchicalStructure}>
 {/* Nivel 1: Procesos Estratégicos (Direcciones) */}
 <div className={styles.strategicLevel}>
 <div className={styles.levelHeader}>
 <h3 className={styles.levelTitle}>Procesos ESTRATÉGICOS</h3>
 </div>
 <div className={styles.strategicNodes}>
 {sortedProcesosGeneralesForView.map((proc) => (
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
 {/* Conectores */}
 <div className={styles.connectors}>
 <div className={styles.verticalLine}></div>
 </div>
 {/* Nivel 2: Procesos Misionales (Procesos de Apoyo) */}
 <div className={styles.misionalLevel}>
 <div className={styles.levelHeader}>
 <h3 className={styles.levelTitle}>Procesos MISIONALES</h3>
 </div>
 <div className={styles.misionalNodes}>
 {allProcesos.map((proc) => (
 <div key={proc.id || proc.nombre} className={styles.misionalNode}>
 <div className={styles.nodeContent}>
 <ProcessNodeIcon className={styles.nodeIcon} />
 <h4>{proc.nombre}</h4>
 {proc.descripcion && <p>{proc.descripcion}</p>}
 {Array.isArray(proc.procesos_generales) && proc.procesos_generales.length > 0 && (
 <div className={styles.chips}>
 {proc.procesos_generales.map((dn, idx) => (
 <span key={idx} className={styles.chip}>{dn}</span>
 ))}
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 {/* Conectores */}
 <div className={styles.connectors}>
 <div className={styles.verticalLine}></div>
 </div>
 {/* Eliminado nivel de "Procesos de Apoyo" para Calidad; los procesos de apoyo se muestran como misionales */}
 </div>
 </section>
 );
 };
 OrgStructure.propTypes = {
 };
 export default OrgStructure;