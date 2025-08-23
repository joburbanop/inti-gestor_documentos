import React from 'react';
import { getFileCompatibilityInfo, getSupportedExtensionsByType } from '../../utils/fileCompatibility';
import styles from '../../styles/components/Documentos.module.css';

const FileCompatibilityModal = ({ 
  show, 
  onClose, 
  extension, 
  mimeType, 
  fileName 
}) => {
  if (!show) return null;

  const compatibilityInfo = getFileCompatibilityInfo(extension, mimeType);
  const supportedExtensions = getSupportedExtensionsByType();

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            Información de compatibilidad
          </h2>
          <button onClick={onClose} title="Cerrar" className={styles.closeButton}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
              {compatibilityInfo.icon}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              {fileName || 'Archivo'}
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Formato: {extension?.toUpperCase() || 'Desconocido'}
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div className={styles.compatibilityInfo} style={{ justifyContent: 'center' }}>
              <span className={`${styles.compatibilityBadge} ${compatibilityInfo.isViewable ? styles.viewable : styles.notViewable}`}>
                {compatibilityInfo.isViewable ? '✅ Visualizable' : '📄 Descarga requerida'}
              </span>
              <span className={styles.contentTypeLabel}>
                {compatibilityInfo.icon} {compatibilityInfo.contentType}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
              ¿Qué significa esto?
            </h4>
            <p style={{ color: '#6b7280', lineHeight: '1.6', marginBottom: '1rem' }}>
              {compatibilityInfo.message}
            </p>
            
            {!compatibilityInfo.isViewable && (
              <div style={{ 
                background: '#fef3c7', 
                border: '1px solid #fde68a', 
                borderRadius: '0.5rem', 
                padding: '1rem',
                marginTop: '1rem'
              }}>
                <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>
                  💡 Recomendación:
                </h5>
                <p style={{ fontSize: '0.875rem', color: '#92400e', margin: 0 }}>
                  Descarga este archivo y ábrelo con una aplicación compatible en tu computadora.
                </p>
              </div>
            )}
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
              Formatos soportados para vista previa:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {Object.entries(supportedExtensions).map(([type, extensions]) => (
                <div key={type} style={{ 
                  background: '#f9fafb', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '0.5rem', 
                  padding: '1rem' 
                }}>
                  <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                    {type}
                  </h5>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {extensions.join(', ').toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.createButton}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileCompatibilityModal;
