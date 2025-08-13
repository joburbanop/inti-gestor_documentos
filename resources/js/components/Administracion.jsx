import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/components/Administracion.module.css';
import { EditIcon, DeleteIcon } from './icons/CrudIcons';

const Administracion = () => {
  const { apiRequest, user, token, isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('usuarios');

  // Estados para usuarios
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [userStats, setUserStats] = useState({ total: 0, active: 0 });
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: '',
    is_active: true
  });

  // Estados para noticias
  const [noticias, setNoticias] = useState([]);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [newsForm, setNewsForm] = useState({
    title: '',
    subtitle: '',
    published_at: '',
    document: null
  });

  // Debug temporal
  useEffect(() => {
    console.log('🔍 Debug Administracion:', {
      user,
      token: token ? 'Presente' : 'Ausente',
      isAuthenticated,
      isLoading,
      localStorageToken: localStorage.getItem('auth_token') ? 'Presente' : 'Ausente'
    });
  }, [user, token, isAuthenticated, isLoading]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchData();
    }
  }, [isAuthenticated, isLoading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usuariosRes, rolesRes, statsRes, noticiasRes] = await Promise.all([
        apiRequest('/usuarios'),
        apiRequest('/roles'),
        apiRequest('/usuarios/stats'),
        apiRequest('/admin/noticias')
      ]);

      if (usuariosRes?.success) setUsuarios(usuariosRes.data || []);
      if (rolesRes?.success) setRoles(rolesRes.data || []);
      if (statsRes?.success) {
        const stats = statsRes.data || {};
        setUserStats({
          total: stats.total_users ?? stats.total ?? 0,
          active: stats.active_users ?? stats.active ?? 0
        });
      }
      if (noticiasRes?.success) setNoticias(noticiasRes.data?.noticias || noticiasRes.data || []);

    } catch (e) {
      console.error('Error en fetchData:', e);
      setError(e.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  // Funciones para usuarios
  const resetUserForm = () => {
    setUserForm({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role_id: '',
      is_active: true
    });
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingUser) {
        await apiRequest(`/usuarios/${editingUser.id}`, { method: 'PUT', body: JSON.stringify(userForm) });
      } else {
        await apiRequest('/usuarios', { method: 'POST', body: JSON.stringify(userForm) });
      }
      await fetchData();
      setShowUserForm(false);
      setEditingUser(null);
      resetUserForm();
    } catch (e) {
      alert(e.message || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleUserEdit = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      password: '',
      password_confirmation: '',
      role_id: user.role_id || '',
      is_active: user.is_active
    });
    setShowUserForm(true);
  };

  const handleUserDelete = async (userId) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      setLoading(true);
      await apiRequest(`/usuarios/${userId}`, { method: 'DELETE' });
      await fetchData();
    } catch (e) {
      alert(e.message || 'Error al eliminar usuario');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      setLoading(true);
      await apiRequest(`/usuarios/${userId}/toggle-status`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !currentStatus })
      });
      await fetchData();
    } catch (e) {
      alert(e.message || 'Error al cambiar estado');
    } finally {
      setLoading(false);
    }
  };

  // Funciones para noticias
  const resetNewsForm = () => {
    setNewsForm({
      title: '',
      subtitle: '',
      published_at: '',
      document: null,
      is_active: true
    });
  };

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', newsForm.title?.trim() || '');
      if (newsForm.subtitle) formData.append('subtitle', newsForm.subtitle);
      if (newsForm.published_at) formData.append('published_at', newsForm.published_at);
      if (newsForm.document instanceof File) formData.append('document', newsForm.document);

      if (editingNews) {
        formData.append('_method', 'PUT');
        formData.append('is_active', newsForm.is_active ? '1' : '0');
        await apiRequest(`/noticias/${editingNews.id}`, { method: 'POST', body: formData });
      } else {
        formData.append('is_active', newsForm.is_active ? '1' : '0');
        await apiRequest('/noticias', { method: 'POST', body: formData });
      }
      await fetchData();
      setShowNewsForm(false);
      setEditingNews(null);
      resetNewsForm();
    } catch (e) {
      alert(e.message || 'Error al guardar noticia');
    } finally {
      setLoading(false);
    }
  };

  const handleNewsEdit = (news) => {
    setEditingNews(news);
    setNewsForm({
      title: news.title,
      subtitle: news.subtitle || '',
      published_at: news.published_at ? new Date(news.published_at).toISOString().split('T')[0] : '',
      document: null,
      is_active: Boolean(news.is_active)
    });
    setShowNewsForm(true);
  };
  const toggleNewsStatus = async (newsId, currentStatus) => {
    try {
      setLoading(true);
      await apiRequest(`/noticias/${newsId}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !currentStatus })
      });
      await fetchData();
    } catch (e) {
      alert(e.message || 'Error al cambiar estado de la noticia');
    } finally {
      setLoading(false);
    }
  };

  const handleNewsDelete = async (newsId) => {
    if (!confirm('¿Eliminar esta noticia?')) return;
    try {
      setLoading(true);
      await apiRequest(`/noticias/${newsId}`, { method: 'DELETE' });
      await fetchData();
    } catch (e) {
      alert(e.message || 'Error al eliminar noticia');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar estado de autenticación si no está autenticado
  if (!isAuthenticated && !isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2>No autenticado</h2>
          <p>Debes iniciar sesión para acceder a la administración.</p>
          <p>Token en localStorage: {localStorage.getItem('auth_token') ? 'Presente' : 'Ausente'}</p>
          <p>Estado de autenticación: {isAuthenticated ? 'Autenticado' : 'No autenticado'}</p>
          <p>Cargando: {isLoading ? 'Sí' : 'No'}</p>
        </div>
      </div>
    );
  }

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Mostrar loading mientras se cargan los datos
  if (loading && !usuarios.length) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando administración...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Administración</h1>
          <p className={styles.subtitle}>Gestiona usuarios del sistema</p>
        </div>
      </header>

      {/* Estadísticas */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statCardAzul}`}>
          <div className={styles.statIcon}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <h3>{userStats.total}</h3>
            <p>Usuarios Totales</p>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statCardVerde}`}>
          <div className={styles.statIcon}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <h3>{userStats.active}</h3>
            <p>Usuarios Activos</p>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statCardMorado}`}>
          <div className={styles.statIcon}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <h3>{noticias.length}</h3>
            <p>Noticias</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
            className={`${styles.tab} ${activeTab === 'usuarios' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('usuarios')}
        >
            <svg style={{ width: '20px', height: '20px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            Usuarios
        </button>
        <button
            className={`${styles.tab} ${activeTab === 'noticias' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('noticias')}
        >
            <svg style={{ width: '20px', height: '20px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            Noticias
        </button>
      </div>

      {/* Contenido de usuarios */}
      {activeTab === 'usuarios' && (
        <div className={styles.tabContent}>
          <div className={styles.sectionHeader}>
            <h2>Gestión de Usuarios</h2>
            <button 
              className={styles.primaryButtonBlue}
              onClick={() => {
                setShowUserForm(true);
                setEditingUser(null);
                resetUserForm();
              }}
            >
              <svg style={{ width: '18px', height: '18px', marginRight: '8px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Usuario
            </button>
          </div>

          {showUserForm && (
            <div className={styles.formOverlay}>
              <div className={styles.formModal}>
                <div className={styles.formHeader}>
                  <h3>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                  <button 
                    onClick={() => {
                      setShowUserForm(false);
                      setEditingUser(null);
                      resetUserForm();
                    }}
                    className={styles.closeButton}
                  >
                    <svg style={{ width: "20px", height: "20px", color: "white" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <form onSubmit={handleUserSubmit} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label>Nombre Completo</label>
                    <input
                      type="text"
                      value={userForm.name}
                      onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Correo Electrónico</label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Contraseña {editingUser && '(dejar en blanco para mantener)'}</label>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                      required={!editingUser}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Confirmar Contraseña</label>
                    <input
                      type="password"
                      value={userForm.password_confirmation}
                      onChange={(e) => setUserForm({...userForm, password_confirmation: e.target.value})}
                      required={!editingUser}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Rol</label>
                    <select
                      value={userForm.role_id}
                      onChange={(e) => setUserForm({...userForm, role_id: e.target.value})}
                      required
                    >
                      <option value="">Seleccionar rol</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={userForm.is_active}
                        onChange={(e) => setUserForm({...userForm, is_active: e.target.checked})}
                      />
                      Usuario activo
                    </label>
                  </div>
                  <div className={styles.formActions}>
                    <button type="submit" className={styles.saveButton} disabled={loading}>
                      {loading ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear')}
                    </button>
                    <button 
                      type="button" 
                      className={styles.cancelButton}
                      onClick={() => {
                        setShowUserForm(false);
                        setEditingUser(null);
                        resetUserForm();
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Último Acceso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={styles.roleBadge}>
                        {user.role?.name || 'Sin rol'}
                      </span>
                    </td>
                    <td>
                      <label className={styles.switchLabel}>
                        <input
                          type="checkbox"
                          checked={!!user.is_active}
                          onChange={() => toggleUserStatus(user.id, !!user.is_active)}
                          disabled={loading}
                        />
                        <span className={styles.switchVisual}></span>
                        <span className={styles.switchText}>{user.is_active ? 'Activo' : 'Inactivo'}</span>
                      </label>
                    </td>
                    <td>{user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Nunca'}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => handleUserEdit(user)}
                          className={styles.editButton}
                          title="Editar"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleUserDelete(user.id)}
                          className={styles.deleteButton}
                          title="Eliminar"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contenido de noticias */}
      {activeTab === 'noticias' && (
        <div className={styles.tabContent}>
          <div className={styles.sectionHeader}>
            <h2>Gestión de Noticias</h2>
            <button 
              className={styles.primaryButtonBlue}
              onClick={() => {
                setShowNewsForm(true);
                setEditingNews(null);
                resetNewsForm();
              }}
            >
              <svg style={{ width: '18px', height: '18px', marginRight: '8px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nueva Noticia
            </button>
          </div>

          {showNewsForm && (
            <div className={styles.formOverlay}>
              <div className={styles.formModal}>
                <div className={styles.formHeader}>
                  <h3>{editingNews ? 'Editar Noticia' : 'Nueva Noticia'}</h3>
                  <button 
                    onClick={() => {
                      setShowNewsForm(false);
                      setEditingNews(null);
                      resetNewsForm();
                    }}
                    className={styles.closeButton}
                  >
                    <svg style={{ width: "20px", height: "20px", color: "white" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <form onSubmit={handleNewsSubmit} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label>Título</label>
                    <input
                      type="text"
                      value={newsForm.title}
                      onChange={(e) => setNewsForm({...newsForm, title: e.target.value})}
                      placeholder="Ej. Nueva política de seguridad"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Descripción</label>
                    <textarea
                      value={newsForm.subtitle}
                      onChange={(e) => setNewsForm({...newsForm, subtitle: e.target.value})}
                      placeholder="Breve resumen o texto del banner"
                      rows="3"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Fecha de publicación</label>
                    <input
                      type="date"
                      value={newsForm.published_at}
                      onChange={(e) => setNewsForm({...newsForm, published_at: e.target.value})}
                      style={{
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        backgroundColor: '#f9fafb',
                        color: '#374151',
                        width: '100%',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Documento (opcional)</label>
                    <input
                      type="file"
                      onChange={(e) => setNewsForm({...newsForm, document: e.target.files[0]})}
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      style={{
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        backgroundColor: '#f9fafb',
                        color: '#374151',
                        width: '100%',
                        cursor: 'pointer'
                      }}
                    />
                    <small style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      Formatos permitidos: PDF, DOC, DOCX, TXT, JPG, PNG
                    </small>
                  </div>
                  <div className={styles.formActions}>
                    <button type="submit" className={styles.saveButton} disabled={loading}>
                      {loading ? 'Guardando...' : (editingNews ? 'Actualizar' : 'Crear')}
                    </button>
                    <button 
                      type="button" 
                      className={styles.cancelButton}
                      onClick={() => {
                        setShowNewsForm(false);
                        setEditingNews(null);
                        resetNewsForm();
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Descripción</th>
                  <th>Fecha</th>
                  <th>Documento</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {noticias.map(news => (
                  <tr key={news.id}>
                    <td>
                      <div className={styles.newsInfo}>
                        <div className={styles.newsIcon}>
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        </div>
                        <span>{news.title}</span>
                      </div>
                    </td>
                    <td>{news.subtitle || '-'}</td>
                    <td>{news.published_at ? new Date(news.published_at).toLocaleDateString() : '-'}</td>
                    <td>
                      {news.document_url ? (
                        <a href={news.document_url} target="_blank" rel="noreferrer" className={styles.documentLink}>
                          Ver documento
                        </a>
                      ) : (
                        <span className={styles.noDocument}>Sin documento</span>
                      )}
                    </td>
                    <td>
                      <label className={styles.switchLabel}>
                        <input
                          type="checkbox"
                          checked={!!news.is_active}
                          onChange={() => toggleNewsStatus(news.id, !!news.is_active)}
                          disabled={loading}
                        />
                        <span className={styles.switchVisual}></span>
                        <span className={styles.switchText}>{news.is_active ? 'Activa' : 'Inactiva'}</span>
                      </label>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => handleNewsEdit(news)}
                          className={styles.editButton}
                          title="Editar"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleNewsDelete(news.id)}
                          className={styles.deleteButton}
                          title="Eliminar"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default Administracion; 