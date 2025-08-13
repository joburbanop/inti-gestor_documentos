import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/components/NewsCreate.module.css';
import { NewsIcon, UploadIcon, CalendarIcon } from '../icons/NewsIcons';

const NewsForm = ({ onSuccess }) => {
  const { apiRequest } = useAuth();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [file, setFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setPublishedAt('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert('El título es obligatorio');
    try {
      setCreating(true);
      const formData = new FormData();
      formData.append('title', title.trim());
      if (subtitle.trim()) formData.append('subtitle', subtitle.trim());
      if (publishedAt) formData.append('published_at', new Date(publishedAt).toISOString());
      if (file) formData.append('document', file);

      const res = await apiRequest('/api/noticias', { method: 'POST', body: formData });
      if (!res?.success) throw new Error(res?.message || 'No se pudo crear la noticia');

      resetForm();
      if (typeof onSuccess === 'function') onSuccess(res.data);
    } catch (err) {
      alert(err.message || 'Error al crear la noticia');
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <NewsIcon className={styles.headerIcon} />
        <div>
          <h2 className={styles.title}>Crear noticia</h2>
          <p className={styles.subtitle}>Título, descripción y documento (opcional)</p>
        </div>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>Título</label>
          <input className={styles.input} type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Nueva política de seguridad" />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Descripción</label>
          <textarea className={styles.textarea} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Breve resumen o texto del banner" rows={3} />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Fecha de publicación</label>
            <div className={styles.inputWithIcon}>
              <CalendarIcon className={styles.inputIcon} />
              <input className={styles.input} type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Documento (opcional)</label>
            <div className={styles.filePicker}>
              <input ref={fileInputRef} className={styles.fileInput} type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <button type="button" className={styles.browseBtn} onClick={() => fileInputRef.current?.click()}>
                <UploadIcon className={styles.browseIcon} />
                Seleccionar archivo
              </button>
              {file && <span className={styles.fileName}>{file.name}</span>}
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.submitBtn} disabled={creating}>
            {creating ? 'Creando…' : 'Crear noticia'}
          </button>
        </div>
      </form>
    </section>
  );
};

NewsForm.propTypes = { onSuccess: PropTypes.func };

export default NewsForm;
