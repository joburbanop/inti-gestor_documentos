import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/components/Administracion.module.css';
import { EditIcon, DeleteIcon, SettingsIcon, DocumentIcon } from './icons/CrudIcons';
import CreateForm from './common/CreateForm';

console.log('⚙️ [Administracion.jsx] Importando componente Administracion');

const Administracion = () => {
  console.log('⚙️ [Administracion.jsx] Renderizando componente Administracion');
  
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
    console.log('🔍 [Administracion.jsx] Estado de autenticación:', {
      user: user?.name,
      hasToken: !!token,
      isAuthenticated,
      isLoading
    });
  }, [user, token, isAuthenticated, isLoading]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('✅ [Administracion.jsx] Usuario autenticado, cargando datos');
      fetchData();
    } else {
      console.log('❌ [Administracion.jsx] Usuario no autenticado o cargando');
    }
  }, [isAuthenticated, isLoading]);

  const fetchData = async () => {
    console.log('📊 [Administracion.jsx] Iniciando fetchData');
    try {
      setLoading(true);
      setError(null);

      const [usuariosRes, rolesRes, statsRes, noticiasRes] = await Promise.all([
        apiRequest('/usuarios'),
        apiRequest('/roles'),
        apiRequest('/usuarios/stats'),
        apiRequest('/admin/noticias')
      ]);

      console.log('✅ [Administracion.jsx] Datos obtenidos:', {
        usuarios: usuariosRes?.success ? usuariosRes.data?.length : 0,
        roles: rolesRes?.success ? rolesRes.data?.length : 0,
        stats: statsRes?.success ? 'OK' : 'Error',
        noticias: noticiasRes?.success ? noticiasRes.data?.noticias?.length || noticiasRes.data?.length : 0
      });

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
      console.log('❌ [Administracion.jsx] Error en fetchData:', e.message);
      setError(e.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  // Funciones para usuarios
  const resetUserForm = () => {
    console.log('🔄 [Administracion.jsx] Reseteando formulario de usuario');
    setUserForm({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role_id: '',
      is_active: true
    });
  };

  // Configuración de campos para formulario de usuarios
  const getUserFields = () => {
    const roleOptions = roles.map(role => ({
      value: role.id,
      label: role.name
    }));

    return [
      {
        title: 'Información Personal',
        icon: SettingsIcon,
        fields: [
          {
            name: 'name',
            label: 'Nombre Completo',
            type: 'text',
            required: true,
            placeholder: 'Ingresa el nombre completo del usuario'
          },
          {
            name: 'email',
            label: 'Correo Electrónico',
            type: 'text',
            required: true,
            placeholder: 'usuario@empresa.com'
          }
        ]
      },
      {
        title: 'Seguridad',
        icon: SettingsIcon,
        fields: [
          {
            name: 'password',
            label: editingUser ? 'Contraseña (dejar en blanco para mantener)' : 'Contraseña',
            type: 'text',
            required: !editingUser,
            placeholder: 'Ingresa una contraseña segura'
          },
          {
            name: 'password_confirmation',
            label: 'Confirmar Contraseña',
            type: 'text',
            required: !editingUser,
            placeholder: 'Confirma la contraseña'
          }
        ]
      },
      {
        title: 'Configuración',
        icon: SettingsIcon,
        fields: [
          {
            name: 'role_id',
            label: 'Rol',
            type: 'select',
            required: true,
            options: roleOptions,
            placeholder: 'Seleccionar rol'
          }
        ]
      }
    ];
  };

  const handleUserSubmit = async (formData) => {
    try {
      setLoading(true);
      
      // Preparar datos del usuario
      const userData = {
        name: formData.name?.trim() || '',
        email: formData.email?.trim() || '',
        password: formData.password || '',
        password_confirmation: formData.password_confirmation || '',
        role_id: formData.role_id || ''
      };

      // Automáticamente establecer estado activo
      if (!editingUser) {
        // Para nuevos usuarios: estado activo por defecto
        userData.is_active = true;
      } else {
        // Para edición: mantener estado actual
        userData.is_active = editingUser.is_active;
      }

      let res;
      if (editingUser) {
        res = await apiRequest(`/users/${editingUser.id}`, {
          method: 'PUT',
          body: JSON.stringify(userData)
        });
      } else {
        res = await apiRequest('/users', {
          method: 'POST',
          body: JSON.stringify(userData)
        });
      }

      if (!res?.success) {
        throw new Error(res?.message || 'No se pudo guardar el usuario');
      }

      await fetchData();
      setShowUserForm(false);
      setEditingUser(null);
      resetUserForm();
    } catch (err) {
      alert(err.message || 'Error al guardar el usuario');
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
    console.log('🔄 [Administracion.jsx] Reseteando formulario de noticia');
    setNewsForm({
      title: '',
      subtitle: '',
      published_at: '',
      document: null,
      is_active: true
    });
  };

  // Configuración de campos para formulario de noticias
  const getNewsFields = () => [
    {
      title: 'Información de la Noticia',
      icon: DocumentIcon,
      fields: [
        {
          name: 'title',
          label: 'Título',
          type: 'text',
          required: true,
          placeholder: 'Ej. Nueva política de seguridad'
        },
        {
          name: 'subtitle',
          label: 'Descripción',
          type: 'textarea',
          required: false,
          placeholder: 'Breve resumen o texto del banner',
          rows: 3
        }
      ]
    },
    {
      title: 'Documento Adjunto',
      icon: DocumentIcon,
      fields: [
        {
          name: 'document',
          label: 'Documento (opcional)',
          type: 'file',
          required: false,
          accept: '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png'
        }
      ]
    }
  ];

  const handleNewsSubmit = async (formData) => {
    try {
      setLoading(true);
      const submitData = new FormData();
      submitData.append('title', formData.title?.trim() || '');
      if (formData.subtitle) submitData.append('subtitle', formData.subtitle);
      if (formData.document instanceof File) submitData.append('document', formData.document);
      
      // Automáticamente establecer fecha de publicación y estado activo
      if (!editingNews) {
        // Para nuevas noticias: fecha actual y estado activo
        submitData.append('published_at', new Date().toISOString().split('T')[0]);
        submitData.append('is_active', '1');
      } else {
        // Para edición: mantener fecha original y estado actual
        submitData.append('published_at', editingNews.published_at || new Date().toISOString().split('T')[0]);
        submitData.append('is_active', editingNews.is_active ? '1' : '0');
      }

      let res;
      if (editingNews) {
        submitData.append('_method', 'PUT');
        res = await apiRequest(`/noticias/${editingNews.id}`, { method: 'POST', body: submitData });
      } else {
        res = await apiRequest('/noticias', { method: 'POST', body: submitData });
      }

      if (!res?.success) {
        throw new Error(res?.message || 'No se pudo guardar la noticia');
      }

      await fetchData();
      setShowNewsForm(false);
      setEditingNews(null);
      resetNewsForm();
    } catch (err) {
      alert(err.message || 'Error al guardar la noticia');
    } finally {
      setLoading(false);
    }
  };

  const handleNewsEdit = (news) => {
    setEditingNews(news);
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
                <CreateForm
                  title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                  subtitle="Gestiona la información del usuario del sistema"
                  fields={getUserFields()}
                  initialData={editingUser || {}}
                  onSubmit={handleUserSubmit}
                  onCancel={() => {
                    setShowUserForm(false);
                    setEditingUser(null);
                    resetUserForm();
                  }}
                  loading={loading}
                  headerIcon={SettingsIcon}
                />
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
                <CreateForm
                  title={editingNews ? 'Editar Noticia' : 'Nueva Noticia'}
                  subtitle="Gestiona las noticias del slider"
                  fields={getNewsFields()}
                  initialData={editingNews || {}}
                  onSubmit={handleNewsSubmit}
                  onCancel={() => {
                    setShowNewsForm(false);
                    setEditingNews(null);
                    resetNewsForm();
                  }}
                  loading={loading}
                  headerIcon={DocumentIcon}
                />
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