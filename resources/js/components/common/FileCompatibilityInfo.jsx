import React from 'react';
import { getFileCompatibilityInfo } from '../../utils/fileCompatibility';
import styles from '../../styles/components/Documentos.module.css';

const FileCompatibilityInfo = ({ 
  extension, 
  mimeType, 
  showIcon = true, 
  showMessage = false, 
  className = '' 
}) => {
  const compatibilityInfo = getFileCompatibilityInfo(extension, mimeType);

  return (
    <div className={`${styles.compatibilityInfo} ${className}`}>
      <span className={`${styles.compatibilityBadge} ${compatibilityInfo.isViewable ? styles.viewable : styles.notViewable}`}>
        {compatibilityInfo.isViewable ? '✅ Visualizable' : '📄 Descarga requerida'}
      </span>
      
      <span className={styles.contentTypeLabel}>
        {showIcon && compatibilityInfo.icon} {compatibilityInfo.contentType}
      </span>
      
      {showMessage && (
        <div className={styles.compatibilityMessage}>
          {compatibilityInfo.message}
        </div>
      )}
    </div>
  );
};

export default FileCompatibilityInfo;
