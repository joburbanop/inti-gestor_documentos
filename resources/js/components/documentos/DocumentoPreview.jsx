import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/components/Documentos.module.css';

const prettyName = (name) => name || 'documento';

const DocumentoPreview = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, error: '', contentUrl: '', contentType: '', fileName: '', downloadUrl: '' });

  const isImage = useMemo(() => state.contentType.startsWith('image/'), [state.contentType]);
  const isPdf = useMemo(() => state.contentType === 'application/pdf', [state.contentType]);
  const isText = useMemo(() => state.contentType.startsWith('text/'), [state.contentType]);

  useEffect(() => {
    let urlToRevoke = null;

    (async () => {
      try {
        // Intentar obtener vista previa; si el backend devuelve archivo directo, content-type no será JSON
        const response = await fetch(`/api/documentos/${id}/vista-previa`, {
          headers: {
            'Accept': 'application/json,*/*',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'X-Requested-With': 'XMLHttpRequest',
            'X-Ignore-Auth-Errors': '1'
          }
        });

        const contentType = response.headers.get('content-type') || '';
        // Caso 1: backend devuelve el archivo directamente (PDF/imagen/texto)
        if (contentType && !contentType.includes('application/json')) {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          urlToRevoke = objectUrl;
          setState({ loading: false, error: '', contentUrl: objectUrl, contentType, fileName: '', downloadUrl: '' });
          return;
        }

        // Caso 2: backend devuelve JSON con URL (tipos no visualizables)
        const json = await response.json();
        if (json.success && json.data?.url) {
          // Intentar obtener como blob para algunos visores del navegador
          const fileRes = await fetch(json.data.url, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
              'X-Requested-With': 'XMLHttpRequest',
              'X-Ignore-Auth-Errors': '1'
            }
          });
          const fileType = fileRes.headers.get('content-type') || '';
          const blob = await fileRes.blob();
          const objectUrl = URL.createObjectURL(blob);
          urlToRevoke = objectUrl;
          setState({
            loading: false,
            error: '',
            contentUrl: objectUrl,
            contentType: fileType,
            fileName: json.data?.nombre_original || '',
            downloadUrl: json.data.url
          });
        } else {
          setState({ loading: false, error: json.message || 'No se pudo cargar la vista previa', contentUrl: '', contentType: '', fileName: '', downloadUrl: '' });
        }
      } catch (e) {
        setState({ loading: false, error: e.message || 'Error al cargar vista previa', contentUrl: '', contentType: '', fileName: '', downloadUrl: '' });
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
          <a href={state.downloadUrl} download className={styles.createButton}>Descargar</a>
        )}
      </div>
    );
  }

  const unsupported = !isImage && !isPdf && !isText;

  return (
    <div className={styles.documentosContainer}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Vista previa</h1>
            <p className={styles.subtitle}>{prettyName(state.fileName)}</p>
          </div>
          {state.downloadUrl && (
            <a href={state.downloadUrl} download className={styles.createButton}>Descargar</a>
          )}
        </div>
      </div>

      {isPdf && (
        <iframe title="preview-pdf" src={state.contentUrl} style={{ width: '100%', height: '80vh', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} />
      )}

      {isImage && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img src={state.contentUrl} alt={prettyName(state.fileName)} style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }} />
        </div>
      )}

      {isText && (
        <pre style={{ maxHeight: '80vh', overflow: 'auto', background: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
{`// Vista previa de texto\n`}
          <code>
            {/* Mostrar como texto simple */}
            {state.contentUrl && 'Abra el archivo en el navegador para ver el contenido.'}
          </code>
        </pre>
      )}

      {unsupported && (
        <div className={styles.loadingContainer}>
          <p style={{ color: '#6b7280' }}>Este tipo de archivo no se puede previsualizar en el navegador.</p>
          {state.downloadUrl && (
            <a href={state.downloadUrl} target="_blank" rel="noreferrer" className={styles.createButton}>Abrir / Descargar</a>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentoPreview;


