import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/components/NewsCreate.module.css';
import { NewsIcon } from '../icons/NewsIcons';
import NewsForm from './NewsForm';

const NewsCreate = ({ onCreated }) => {
  const { apiRequest } = useAuth();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/api/noticias');
      if (res?.success) setNews(res.data?.noticias || res.data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleCreated = async () => {
    await fetchNews();
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta noticia?')) return;
    try {
      await apiRequest(`/api/noticias/${id}`, { method: 'DELETE' });
      await fetchNews();
    } catch (err) {
      alert(err.message || 'Error al eliminar');
    }
  };

  React.useEffect(() => { fetchNews(); }, []);

  return (
    <section className={styles.container}>
      <header className={styles.header}>        
        <NewsIcon className={styles.headerIcon} />
        <div>
          <h2 className={styles.title}>Noticias</h2>
          <p className={styles.subtitle}>Administra noticias del slider</p>
        </div>
      </header>

      <div className={styles.sectionHeader}>
        <h2>Gestión de Noticias</h2>
        <button className={styles.addButton} onClick={() => setShowForm(true)}>Nueva Noticia</button>
      </div>

      {showForm && (
        <div className={styles.formOverlay}>
          <div className={styles.formModal}>
            <div className={styles.formHeader}>
              <h3>Nueva Noticia</h3>
              <button className={styles.closeButton} onClick={() => setShowForm(false)}>
                ×
              </button>
            </div>
            <NewsForm onSuccess={handleCreated} />
          </div>
        </div>
      )}

      {/* Listado de noticias */}
      <div className={styles.list}>
        {loading ? (
          <p>Cargando noticias…</p>
        ) : news.length === 0 ? (
          <p>No hay noticias creadas.</p>
        ) : (
          news.map((n) => (
            <div key={n.id} className={styles.newsItem}>
              <div>
                <p className={styles.newsTitle}>{n.title}</p>
                {n.subtitle && <p className={styles.newsSubtitle}>{n.subtitle}</p>}
              </div>
              <div className={styles.newsActions}>
                {n.document_url && (
                  <a href={n.document_url} target="_blank" rel="noreferrer" className={styles.browseBtn}>Ver documento</a>
                )}
                <button type="button" className={styles.deleteBtn} onClick={() => handleDelete(n.id)}>Eliminar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

NewsCreate.propTypes = {
  onCreated: PropTypes.func,
};

export default NewsCreate;
