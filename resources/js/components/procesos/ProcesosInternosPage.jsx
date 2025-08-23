import React, { useState } from 'react';
import { useProcesosInternos } from '../../hooks/useProcesosInternos';
import { useAuth } from '../../contexts/AuthContext';
import { EditIcon, DeleteIcon, PlusIcon } from '../icons/CrudIcons';
import { renderIcon } from '../../utils/iconMapping';
import ProcesoInternoModal from './ProcesoInternoModal';
import ConfirmModal from '../common/ConfirmModal';
import useConfirmModal from '../../hooks/useConfirmModal';
import styles from '../../styles/components/ProcesosApoyo.module.css';
import documentStyles from '../../styles/components/Documentos.module.css';

const ProcesosInternosPage = () => {
  const { procesosInternos, loading, error, cargarProcesosInternos } = useProcesosInternos();
  const { apiRequest } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingProceso, setEditingProceso] = useState(null);
  const {
    modalState,
    showConfirmModal,
    hideConfirmModal,
    executeConfirm
  } = useConfirmModal();

  const handleCreateProceso = () => {
    setEditingProceso(null);
    setShowModal(true);
  };

  const handleEditProceso = (proceso) => {
    setEditingProceso(proceso);
    setShowModal(true);
  };

  const handleDeleteProceso = (proceso) => {
    showConfirmModal({
      title: 'Eliminar Proceso Interno',
      message: `¿Estás seguro de que deseas eliminar el proceso interno "${proceso.titulo}"?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: () => deleteProceso(proceso.id),
      type: 'danger'
    });
  };

  const deleteProceso = async (procesoId) => {
    try {
      const response = await apiRequest(`/processes/internals/${procesoId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        console.log('✅ Proceso interno eliminado exitosamente');
        cargarProcesosInternos();
        hideConfirmModal();
      } else {
        console.error('❌ Error al eliminar proceso interno:', response.message);
        alert('Error al eliminar el proceso interno: ' + response.message);
      }
    } catch (error) {
      console.error('❌ Error al eliminar proceso interno:', error);
      alert('Error al eliminar el proceso interno');
    }
  };

  const handleProcesoSuccess = (procesoData) => {
    console.log('✅ Proceso interno guardado exitosamente:', procesoData);
    setShowModal(false);
    setEditingProceso(null);
    cargarProcesosInternos();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProceso(null);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando procesos internos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p>❌ {error}</p>
          <button
            onClick={cargarProcesosInternos}
            className={styles.retryButton}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Procesos Internos</h1>
            <p className={styles.subtitle}>
              Gestiona los procesos internos de la organización
            </p>
          </div>
          <button
            onClick={handleCreateProceso}
            className={documentStyles.createButton}
            title="Crear nuevo proceso interno"
          >
            <PlusIcon className="w-5 h-5" />
            Nuevo Proceso Interno
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {procesosInternos.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>No hay procesos internos</h3>
            <p className={styles.emptyDescription}>
              Comienza creando tu primer proceso interno para organizar la documentación.
            </p>
            <button
              onClick={handleCreateProceso}
              className={styles.emptyButton}
            >
              <PlusIcon className="w-5 h-5" />
              Crear Primer Proceso Interno
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {procesosInternos.map((proceso) => (
              <div key={proceso.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon}>
                    {renderIcon(proceso.icono, "w-8 h-8")}
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      onClick={() => handleEditProceso(proceso)}
                      className={documentStyles.editButton}
                      title="Editar proceso interno"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProceso(proceso)}
                      className={documentStyles.deleteButton}
                      title="Eliminar proceso interno"
                    >
                      <DeleteIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{proceso.titulo}</h3>
                  <p className={styles.cardDescription}>{proceso.descripcion}</p>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardBadge}>
                      {proceso.nombre}
                    </span>
                    <span className={styles.cardStatus}>
                      {proceso.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para crear/editar proceso interno */}
      <ProcesoInternoModal
        isOpen={showModal}
        onClose={handleCloseModal}
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
        tipo={modalState.type}
      />
    </div>
  );
};

export default ProcesosInternosPage;
