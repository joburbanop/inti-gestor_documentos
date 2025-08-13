import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/components/OrgStructure.module.css';
import { StructureIcon, DirectionIcon, ProcessNodeIcon } from '../icons/OrgIcons';

const OrgStructure = () => {
  const { apiRequest } = useAuth();
  const [direcciones, setDirecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const resDirs = await apiRequest('/api/direcciones');
        if (!resDirs?.success) throw new Error(resDirs?.message || 'Error al obtener direcciones');
        const baseDirecciones = Array.isArray(resDirs.data) ? resDirs.data : resDirs.data?.data || [];

        // Traer procesos por dirección en paralelo
        const sortedDirecciones = [...baseDirecciones].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
        const withProcesos = await Promise.all(
          sortedDirecciones.map(async (dir) => {
            try {
              const resProcs = await apiRequest(`/api/direcciones/${dir.id}/procesos-apoyo`);
              const procesos = resProcs?.success ? (resProcs.data || []) : [];
              return { ...dir, procesos_apoyo: procesos };
            } catch (_) {
              return { ...dir, procesos_apoyo: [] };
            }
          })
        );

        if (mounted) setDirecciones(withProcesos);
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
  const sortedDireccionesForView = [...direcciones].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
  const procesoIdToInfo = new Map();
  sortedDireccionesForView.forEach((dir) => {
    (dir.procesos_apoyo || []).forEach((p) => {
      const key = p.id ?? `${p.nombre}`;
      if (!procesoIdToInfo.has(key)) {
        procesoIdToInfo.set(key, { ...p, direcciones: [dir.nombre].filter(Boolean) });
      } else {
        const entry = procesoIdToInfo.get(key);
        if (dir.nombre && !entry.direcciones.includes(dir.nombre)) entry.direcciones.push(dir.nombre);
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
        {/* Nivel 1: Procesos Estratégicos */}
        <div className={styles.strategicLevel}>
          <div className={styles.levelHeader}>
            <h3 className={styles.levelTitle}>Procesos ESTRATÉGICOS</h3>
          </div>
          <div className={styles.strategicNodes}>
            <div className={styles.strategicNode}>
              <div className={styles.nodeContent}>
                <h4>Planeación Estratégica</h4>
              </div>
            </div>
            <div className={styles.strategicNode}>
              <div className={styles.nodeContent}>
                <h4>Gestión Ordenamiento Territorial</h4>
              </div>
            </div>
            <div className={styles.strategicNode}>
              <div className={styles.nodeContent}>
                <h4>Seguridad y Privacidad de la Información</h4>
              </div>
            </div>
            <div className={styles.strategicNode}>
              <div className={styles.nodeContent}>
                <h4>Comunicaciones</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Conectores */}
        <div className={styles.connectors}>
          <div className={styles.verticalLine}></div>
        </div>

        {/* Nivel 2: Procesos Misionales */}
        <div className={styles.misionalLevel}>
          <div className={styles.levelHeader}>
            <h3 className={styles.levelTitle}>Procesos MISIONALES</h3>
          </div>
          <div className={styles.misionalNodes}>
            {sortedDireccionesForView.map((dir) => (
              <div key={dir.id} className={styles.misionalNode}>
                <div className={styles.nodeContent}>
                  <DirectionIcon className={styles.nodeIcon} />
                  <h4>{dir.nombre}</h4>
                  {dir.descripcion && <p>{dir.descripcion}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conectores */}
        <div className={styles.connectors}>
          <div className={styles.verticalLine}></div>
        </div>

        {/* Nivel 3: Procesos de Apoyo */}
        <div className={styles.supportLevel}>
          <div className={styles.levelHeader}>
            <h3 className={styles.levelTitle}>Procesos DE APOYO</h3>
          </div>
          <div className={styles.supportNodes}>
            {allProcesos.map((proc) => (
              <div key={proc.id || proc.nombre} className={styles.supportNode}>
                <div className={styles.nodeContent}>
                  <ProcessNodeIcon className={styles.nodeIcon} />
                  <h4>{proc.nombre}</h4>
                  {proc.descripcion && <p>{proc.descripcion}</p>}
                  {Array.isArray(proc.direcciones) && proc.direcciones.length > 0 && (
                    <div className={styles.chips}>
                      {proc.direcciones.map((dn, idx) => (
                        <span key={idx} className={styles.chip}>{dn}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

OrgStructure.propTypes = {
};

export default OrgStructure;
