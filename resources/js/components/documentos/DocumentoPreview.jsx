import React, { useEffect, useMemo, useState } from 'react';
import api from '../../lib/apiClient';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/components/Documentos.module.css';

const prettyName = (name) => name || 'documento';

const DocumentoPreview = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [state, setState] = useState({ 
    loading: true, 
    error: '', 
    contentUrl: '', 
    contentType: '', 
    fileName: '', 
    downloadUrl: '',
    documentInfo: null,
    isViewable: false
  });

  const isImage = useMemo(() => state.contentType.startsWith('image/'), [state.contentType]);
  const isPdf = useMemo(() => state.contentType === 'application/pdf', [state.contentType]);
  const isText = useMemo(() => state.contentType.startsWith('text/'), [state.contentType]);

  useEffect(() => {
    let urlToRevoke = null;

    (async () => {
      try {
        // Obtener información de vista previa
        const response = await api.get(`/documents/${id}/preview`);
        
        if (response.data.success && response.data.data) {
          const data = response.data.data;
          
          // Si el archivo es visualizable, cargarlo como blob
          if (data.viewable) {
            try {
              const fileResponse = await api.get(data.url, { responseType: 'blob' });
              const blob = fileResponse.data;
              const objectUrl = URL.createObjectURL(blob);
              urlToRevoke = objectUrl;
              
              setState({
                loading: false,
                error: '',
                contentUrl: objectUrl,
                contentType: data.mime_type || fileResponse.headers['content-type'] || '',
                fileName: data.nombre_original || '',
                downloadUrl: data.url,
                documentInfo: data,
                isViewable: true
              });
              return;
            } catch (fileError) {
              console.error('Error cargando archivo:', fileError);
              // Si falla la carga del archivo, mostrar información pero sin preview
              setState({
                loading: false,
                error: 'No se pudo cargar la vista previa del archivo',
                contentUrl: '',
                contentType: '',
                fileName: data.nombre_original || '',
                downloadUrl: data.url,
                documentInfo: data,
                isViewable: false
              });
              return;
            }
          } else {
            // Archivo no visualizable
            setState({
              loading: false,
              error: '',
              contentUrl: '',
              contentType: data.mime_type || '',
              fileName: data.nombre_original || '',
              downloadUrl: data.url,
              documentInfo: data,
              isViewable: false
            });
            return;
          }
        } else {
          setState({ 
            loading: false, 
            error: response.data.message || 'No se pudo cargar la vista previa', 
            contentUrl: '', 
            contentType: '', 
            fileName: '', 
            downloadUrl: '',
            documentInfo: null,
            isViewable: false
          });
        }
      } catch (e) {
        setState({ 
          loading: false, 
          error: e.message || 'Error al cargar vista previa', 
          contentUrl: '', 
          contentType: '', 
          fileName: '', 
          downloadUrl: '',
          documentInfo: null,
          isViewable: false
        });
      }
    })();

    return () => {
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
    };
  }, [id]);

  if (state.loading) {
    return (
      <div className={styles.documentosContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p>Cargando vista previa…</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={styles.documentosContainer}>
        <h2 className={styles.title}>Vista previa</h2>
        <p className={styles.subtitle}>{state.error}</p>
        {state.downloadUrl && (
          <a href={state.downloadUrl} download className={styles.createButton}>
            Descargar documento
          </a>
        )}
      </div>
    );
  }

  const unsupported = !state.isViewable;

  return (
    <div className={styles.documentosContainer}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Vista previa</h1>
            <p className={styles.subtitle}>{prettyName(state.fileName)}</p>
            {state.documentInfo && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                <span>Tamaño: {state.documentInfo.tamaño_formateado}</span>
                {state.documentInfo.extension && (
                  <span style={{ marginLeft: '1rem' }}>
                    Formato: {state.documentInfo.extension.toUpperCase()}
                  </span>
                )}
              </div>
            )}
          </div>
          {state.downloadUrl && (
            <a href={state.downloadUrl} download className={styles.createButton}>
              Descargar
            </a>
          )}
        </div>
      </div>

      {state.isViewable && isPdf && (
        <iframe 
          title="preview-pdf" 
          src={state.contentUrl} 
          style={{ 
            width: '100%', 
            height: '80vh', 
            border: '1px solid #e5e7eb', 
            borderRadius: '0.5rem' 
          }} 
        />
      )}

      {state.isViewable && isImage && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img 
            src={state.contentUrl} 
            alt={prettyName(state.fileName)} 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '80vh', 
              borderRadius: '0.5rem', 
              border: '1px solid #e5e7eb' 
            }} 
          />
        </div>
      )}

      {state.isViewable && isText && (
        <pre style={{ 
          maxHeight: '80vh', 
          overflow: 'auto', 
          background: '#f9fafb', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          border: '1px solid #e5e7eb' 
        }}>
          <code>
            {/* Mostrar como texto simple */}
            {state.contentUrl && 'Abra el archivo en el navegador para ver el contenido.'}
          </code>
        </pre>
      )}

      {unsupported && (
        <div className={styles.loadingContainer}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ 
              fontSize: '3rem', 
              color: '#9ca3af', 
              marginBottom: '1rem' 
            }}>
              📄
            </div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '0.5rem' 
            }}>
              Archivo no compatible con vista previa
            </h3>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '1.5rem',
              maxWidth: '500px',
              margin: '0 auto 1.5rem auto'
            }}>
              {state.documentInfo?.message || 'Este tipo de archivo no se puede visualizar directamente en el navegador. Para ver su contenido, descárgalo y ábrelo con una aplicación compatible.'}
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {state.downloadUrl && (
                <a 
                  href={state.downloadUrl} 
                  download 
                  className={styles.createButton}
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.5rem' 
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar archivo
                </a>
              )}
              
              {state.downloadUrl && (
                <a 
                  href={state.downloadUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className={styles.createButton}
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db'
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Abrir en nueva pestaña
                </a>
              )}
            </div>

            {state.documentInfo?.content_type && (
              <div style={{ 
                marginTop: '2rem', 
                padding: '1rem', 
                background: '#f9fafb', 
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb'
              }}>
                <h4 style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '0.5rem' 
                }}>
                  Información del archivo:
                </h4>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  <p><strong>Tipo:</strong> {state.documentInfo.content_type}</p>
                  <p><strong>Formato:</strong> {state.documentInfo.extension?.toUpperCase() || 'Desconocido'}</p>
                  <p><strong>Tamaño:</strong> {state.documentInfo.tamaño_formateado}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentoPreview;