import React from 'react';
import styles from '../../styles/components/Dashboard.module.css';

const DocumentItem = ({ document, onClick }) => (
    <div 
        key={document.id} 
        className={styles.documentItem}
        onClick={() => onClick && onClick(document)}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
        <div className={`${styles.documentIcon} ${styles[`documentIcon${document.tipo_archivo?.toUpperCase()}`] || styles.documentIconDoc}`}>
            {document.tipo_archivo === 'pdf' ? '📄' : document.tipo_archivo === 'xlsx' ? '📊' : '📝'}
        </div>
        <div className={styles.documentInfo}>
            <div className={styles.documentTitle}>{document.titulo}</div>
            <div className={styles.documentMeta}>
                {document.direccion?.nombre} • {document.proceso_apoyo?.nombre}
            </div>
        </div>
        <div className={styles.documentDate}>
            {new Date(document.created_at).toLocaleDateString()}
        </div>
    </div>
);

const RecentDocumentsSection = ({ 
    documents = [], 
    title = "Documentos Recientes",
    showViewAll = true,
    maxItems = 5,
    onViewAll,
    onDocumentClick,
    emptyMessage = "No hay documentos recientes"
}) => {
    if (documents.length === 0) {
        return (
            <div className={styles.recentDocumentsSection}>
                <div className={styles.recentDocumentsHeader}>
                    <h2 className={styles.recentDocumentsTitle}>{title}</h2>
                </div>
                <div className={styles.recentDocumentsList}>
                    <div className={styles.emptyState}>
                        <p className={styles.emptyMessage}>{emptyMessage}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.recentDocumentsSection}>
            <div className={styles.recentDocumentsHeader}>
                <h2 className={styles.recentDocumentsTitle}>{title}</h2>
                {showViewAll && (
                    <button
                        onClick={() => onViewAll ? onViewAll() : (window.location.hash = 'documentos')}
                        className={styles.viewAllButton}
                    >
                        Ver todos
                    </button>
                )}
            </div>
            <div className={styles.recentDocumentsList}>
                {documents.slice(0, maxItems).map((doc) => (
                    <DocumentItem
                        key={doc.id}
                        document={doc}
                        onClick={onDocumentClick}
                    />
                ))}
            </div>
        </div>
    );
};

export default RecentDocumentsSection; 