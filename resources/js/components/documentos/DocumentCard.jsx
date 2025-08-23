import React from 'react';
import { EditIcon, DeleteIcon, EyeIcon, DownloadIcon } from '../icons/CrudIcons';
import styles from '../../styles/components/Documentos.module.css';
import { getFileCompatibilityInfo } from '../../utils/fileCompatibility';

const DocumentCard = ({ documento, onView, onEdit, onDelete, onDownload, busy = false }) => {
  const compatibilityInfo = getFileCompatibilityInfo(documento.extension, documento.mime_type);

  return (
    <div className={styles.documentCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className={styles.cardActions}>
          <button
            onClick={() => onDownload && onDownload(documento)}
            disabled={busy}
            title="Descargar documento"
            className={styles.downloadButton}
          >
            <DownloadIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onView ? onView(documento) : window.open(`/documentos/${documento.id}/preview`, '_blank', 'noopener,noreferrer')}
            disabled={busy}
            title={compatibilityInfo.isViewable ? "Ver documento" : compatibilityInfo.message}
            className={`${styles.viewButton} ${!compatibilityInfo.isViewable ? styles.disabledButton : ''}`}
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit && onEdit(documento)}
            disabled={busy}
            title="Editar documento"
            className={styles.editButton}
          >
            <EditIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete && onDelete(documento)}
            disabled={busy}
            title="Eliminar documento"
            className={styles.deleteButton}
          >
            <DeleteIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.documentTitle}>{documento.titulo}</h3>
        <p className={styles.documentDescripcion}>
          {documento.descripcion || 'Sin descripción'}
        </p>
        
        {/* Información de compatibilidad */}
        <div className={styles.documentMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Tamaño:</span>
            <span className={styles.metaValue}>{documento.tamaño_formateado}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Descargas:</span>
            <span className={styles.metaValue}>{documento.contador_descargas}</span>
          </div>
          {documento.extension && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Formato:</span>
              <span className={styles.metaValue}>{documento.extension.toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* Indicador de compatibilidad */}
        {documento.extension && (
          <div className={styles.compatibilityInfo}>
            <span className={`${styles.compatibilityBadge} ${compatibilityInfo.isViewable ? styles.viewable : styles.notViewable}`}>
              {compatibilityInfo.isViewable ? '✅ Visualizable' : '📄 Descarga requerida'}
            </span>
            <span className={styles.contentTypeLabel}>
              {compatibilityInfo.icon} {compatibilityInfo.contentType}
            </span>
          </div>
        )}

        <div className={styles.documentChips}>
          {documento.tipo && (
            <span className={`${styles.chip} ${styles.chipBlue}`}>
              {documento.tipo}
            </span>
          )}
          {documento.confidencialidad && (
            <span className={`${styles.chip} ${styles.chipGray}`}>
              {documento.confidencialidad}
            </span>
          )}
          {Array.isArray(documento.etiquetas) && documento.etiquetas.slice(0, 4).map((tag, idx) => (
            <span key={tag} className={styles.chip} title={`Etiqueta: ${tag}`}>
              #{tag}
            </span>
          ))}
          {Array.isArray(documento.etiquetas) && documento.etiquetas.length > 4 && (
            <span className={`${styles.chip} ${styles.chipGray}`} title={`+${documento.etiquetas.length - 4} etiquetas más`}>
              +{documento.etiquetas.length - 4}
            </span>
          )}
        </div>
        
        <div className={styles.documentInfo}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Tipo de Proceso:</span>
            <span className={styles.infoValue}>
              {documento.tipo_proceso?.titulo || 'Sin definir'}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Proceso General:</span>
            <span className={styles.infoValue}>
              {documento.proceso_general?.nombre || 'Sin definir'}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Proceso Interno:</span>
            <span className={styles.infoValue}>
              {documento.proceso_interno?.nombre || 'Sin definir'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;