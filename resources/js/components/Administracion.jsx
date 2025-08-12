import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import useNotifications from '../hooks/useNotifications';
import styles from '../styles/components/Administracion.module.css';

// Iconos SVG
const UsersIcon = ({ className = "" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '32px', height: '32px', color: '#1F448B' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
);

const CheckIcon = ({ className = "" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '32px', height: '32px', color: '#1F448B' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const LockIcon = ({ className = "" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '32px', height: '32px', color: '#1F448B' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const ChartIcon = ({ className = "" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '32px', height: '32px', color: '#1F448B' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const PlusIcon = ({ className = "" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '18px', height: '18px', color: 'white' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

const EditIcon = ({ className = "" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px', color: '#1F448B' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const TrashIcon = ({ className = "" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px', color: '#ff6b6b' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const CloseIcon = ({ className = "" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px', color: 'white' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ShieldIcon = ({ className = "" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '24px', height: '24px', color: '#1F448B' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const ActivityIcon = ({ className = "" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '24px', height: '24px', color: '#1F448B' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const LoginIcon = ({ className = "" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '24px', height: '24px', color: '#1F448B' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
);

const Administracion = () => {
    const auth = useAuth();
    const { apiRequest } = auth;
    const { showSuccess, showError } = useNotifications();
    const [activeTab, setActiveTab] = useState('usuarios');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Estados para usuarios
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
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

    // Estados para estadísticas
    const [stats, setStats] = useState({
        total_users: 0,
        active_users: 0,
        total_roles: 0,
        recent_activity: []
    });

    // Verificar autenticación al cargar el componente
    useEffect(() => {
        if (!auth.isAuthenticated || !auth.token) {
            setError('Debes iniciar sesión para acceder a la administración. Haz clic en "Iniciar Sesión" en la barra de navegación.');
            return;
        }
        
        loadData();
    }, [auth.isAuthenticated, auth.token]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            console.log('🔄 Cargando datos del administrador...');
            
            const [usuariosRes, rolesRes, statsRes] = await Promise.all([
                apiRequest('/usuarios'),
                apiRequest('/roles'),
                apiRequest('/admin/stats')
            ]);

            console.log('📊 Respuesta de estadísticas:', statsRes);
            console.log('📄 Datos de documentos:', statsRes.data?.documentos);

            setUsuarios(usuariosRes.data || []);
            setRoles(rolesRes.data || []);
            setStats(statsRes.data || {});
            
            console.log('✅ Datos cargados exitosamente');
        } catch (err) {
            console.error('❌ Error al cargar datos:', err);
            setError('Error al cargar los datos: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Funciones para usuarios
    const handleUserSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (editingUser) {
                await apiRequest(`/usuarios/${editingUser.id}`, { method: 'PUT', body: JSON.stringify(userForm) });
                showSuccess('Usuario actualizado exitosamente');
            } else {
                await apiRequest('/usuarios', { method: 'POST', body: JSON.stringify(userForm) });
                showSuccess('Usuario creado exitosamente');
            }
            
            setShowUserForm(false);
            setEditingUser(null);
            resetUserForm();
            loadData();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al guardar usuario';
            setError(errorMessage);
            showError(errorMessage);
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
            role_id: user.role_id,
            is_active: user.is_active
        });
        setShowUserForm(true);
    };

    const handleUserDelete = async (userId) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;
        
        setLoading(true);
        try {
            await apiRequest(`/usuarios/${userId}`, { method: 'DELETE' });
            showSuccess('Usuario eliminado exitosamente');
            loadData();
        } catch (err) {
            const errorMessage = 'Error al eliminar usuario';
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

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



    const toggleUserStatus = async (userId, currentStatus) => {
        setLoading(true);
        try {
            await apiRequest(`/usuarios/${userId}/toggle-status`, {
                method: 'PATCH',
                body: JSON.stringify({ is_active: !currentStatus })
            });
            const newStatus = !currentStatus ? 'activado' : 'desactivado';
            showSuccess(`Usuario ${newStatus} exitosamente`);
            loadData();
        } catch (err) {
            const errorMessage = 'Error al cambiar estado del usuario';
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !usuarios.length) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Cargando panel de administración...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <h1 className={styles.title}>Panel de Administración</h1>
                        <p className={styles.subtitle}>Gestiona usuarios del sistema</p>
                    </div>
                    <button 
                        onClick={loadData}
                        disabled={loading}
                        className={styles.refreshButton}
                        title="Actualizar datos"
                    >
                        <svg style={{ width: '20px', height: '20px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {loading ? 'Actualizando...' : 'Actualizar'}
                    </button>
                </div>
            </div>

            {error && (
                <div className={styles.errorAlert}>
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className={styles.closeError}>
                        <svg style={{ width: '20px', height: '20px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Estadísticas generales */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <svg style={{ width: '32px', height: '32px', color: '#1F448B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <h3>{stats.users?.total || 0}</h3>
                        <p>Usuarios Totales</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <svg style={{ width: '32px', height: '32px', color: '#1F448B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <h3>{stats.users?.active || 0}</h3>
                        <p>Usuarios Activos</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <svg style={{ width: '32px', height: '32px', color: '#1F448B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <h3>{(() => {
                            const total = stats.documentos?.total || 0;
                            console.log('📊 Mostrando total documentos:', total);
                            return total;
                        })()}</h3>
                        <p>Total Documentos</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <svg style={{ width: '32px', height: '32px', color: '#1F448B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <h3>{stats.direcciones?.total || 0}</h3>
                        <p>Direcciones</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <svg style={{ width: '32px', height: '32px', color: '#1F448B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <h3>{stats.procesos?.total || 0}</h3>
                        <p>Categorías</p>
                    </div>
                </div>
            </div>

            {/* Tabs de navegación */}
            <div className={styles.tabsContainer}>
                <button 
                    className={`${styles.tab} ${activeTab === 'usuarios' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('usuarios')}
                >
                    <svg style={{ width: '20px', height: '20px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    Usuarios
                </button>

            </div>

            {/* Contenido de usuarios */}
            {activeTab === 'usuarios' && (
                <div className={styles.tabContent}>
                    <div className={styles.sectionHeader}>
                        <h2>Gestión de Usuarios</h2>
                        <button 
                            className={styles.addButton}
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
                                            Usuario Activo
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
                                            <button
                                                className={`${styles.statusButton} ${user.is_active ? styles.active : styles.inactive}`}
                                                onClick={() => toggleUserStatus(user.id, user.is_active)}
                                                disabled={loading}
                                            >
                                                {user.is_active ? 'Activo' : 'Inactivo'}
                                            </button>
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
                                                    <TrashIcon />
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