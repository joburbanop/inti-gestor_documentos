import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext';
import { INTILED_COLORS } from '../config/colors';
import styles from '../styles/components/Navbar.module.css';

// Componentes de iconos SVG optimizados
const DashboardIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5v14" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 5v14" />
    </svg>
);

const DirectionsIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

const ProcessesIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const DocumentsIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const AdminIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
    </svg>
);

const LogoutIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const MenuIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const Navbar = ({ title = "Intranet Inti" }) => {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Debug: Log del usuario

    const handleLogout = () => {
        logout();
    };

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const navItems = [
        { name: 'Dashboard', path: '/' , icon: DashboardIcon },
        { name: 'Direcciones', path: '/direcciones', icon: DirectionsIcon },
        { name: 'Categorías', path: '/procesos', icon: ProcessesIcon },
        { name: 'Documentos', path: '/documentos', icon: DocumentsIcon },
    ];

    const adminItems = [
        { name: 'Administración', path: '/administracion', icon: AdminIcon },
    ];

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <div className={styles.navbarContent}>
                    {/* Sección de Marca */}
                    <div className={styles.brandSection}>
                        <div className={styles.logoContainer}>
                            <img 
                                src="/img/logo-intiled-azul.png" 
                                alt="Intiled Logo" 
                                className={styles.logo}
                                onError={(e) => {
        // Silenciar logs de carga de logo
                                    e.target.style.display = 'none';
                                }}
                            />
                            <div className={styles.brandText}>
                                <p className={styles.brandSubtitle}>Conectamos con la buena energía</p>
                            </div>
                        </div>
                    </div>

                    {/* Sección de Navegación - Desktop */}
                    <div className={styles.navigationSection}>
                        {user?.is_admin && navItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <NavLink 
                                    key={item.path}
                                    to={item.path}
                                    onClick={closeMobileMenu}
                                    className={styles.navButton}
                                    aria-label={`Navegar a ${item.name}`}
                                >
                                    <IconComponent className={styles.navIcon} />
                                    <span>{item.name}</span>
                                </NavLink>
                            );
                        })}
                        {user?.is_admin && adminItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <NavLink 
                                    key={item.path}
                                    to={item.path}
                                    onClick={closeMobileMenu}
                                    className={`${styles.navButton} ${styles.adminButton}`}
                                    aria-label={`Navegar a ${item.name}`}
                                >
                                    <IconComponent className={styles.navIcon} />
                                    <span>{item.name}</span>
                                </NavLink>
                            );
                        })}
                    </div>

                    {/* Sección de Usuario - Desktop */}
                    <div className={styles.userSection}>
                        <div className={styles.userInfo}>
                            <div className={styles.userAvatar}>
                                <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                            </div>
                            <div className={styles.userDetails}>
                                <p className={styles.userName}>{user?.name}</p>
                                <p className={styles.userRole}>
                                    <span 
                                        className={styles.roleIndicator}
                                        style={{
                                            backgroundColor: user?.is_admin ? INTILED_COLORS.naranja : INTILED_COLORS.verde
                                        }}
                                    ></span>
                                    {user?.is_admin ? 'Administrador' : 'Usuario'}
                                </p>
                            </div>
                        </div>
                        
                        <button
                            onClick={handleLogout}
                            className={styles.logoutButton}
                            aria-label="Cerrar sesión"
                        >
                            <LogoutIcon className={styles.logoutIcon} />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>

                    {/* Botón de menú móvil */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={styles.mobileMenuButton}
                        aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                    >
                        {isMobileMenuOpen ? <CloseIcon className={styles.menuIcon} /> : <MenuIcon className={styles.menuIcon} />}
                    </button>
                </div>

                {/* Menú móvil */}
                {isMobileMenuOpen && (
                    <div className={styles.mobileMenu}>
                        <div className={styles.mobileMenuContent}>
                            {user?.is_admin && navItems.map((item) => {
                                const IconComponent = item.icon;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={closeMobileMenu}
                                        className={styles.mobileNavButton}
                                        aria-label={`Navegar a ${item.name}`}
                                    >
                                        <IconComponent className={styles.mobileIcon} />
                                        <span>{item.name}</span>
                                    </NavLink>
                                );
                            })}
                            {user?.is_admin && adminItems.map((item) => {
                                const IconComponent = item.icon;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={closeMobileMenu}
                                        className={`${styles.mobileNavButton} ${styles.mobileAdminButton}`}
                                        aria-label={`Navegar a ${item.name}`}
                                    >
                                        <IconComponent className={styles.mobileIcon} />
                                        <span>{item.name}</span>
                                    </NavLink>
                                );
                            })}
                        </div>
                        
                        {/* Usuario móvil */}
                        <div className={styles.mobileUserSection}>
                            <div className={styles.mobileUserInfo}>
                                <div className={styles.mobileUserAvatar}>
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className={styles.mobileUserDetails}>
                                    <p className={styles.mobileUserName}>{user?.name}</p>
                                    <p className={styles.mobileUserRole}>
                                        <span 
                                            className={styles.mobileRoleIndicator}
                                            style={{ backgroundColor: user?.is_admin ? INTILED_COLORS.naranja : INTILED_COLORS.verde }}
                                        ></span>
                                        {user?.is_admin ? 'Administrador' : 'Usuario'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className={styles.mobileLogoutButton}
                                aria-label="Cerrar sesión"
                            >
                                <LogoutIcon className={styles.mobileIcon} />
                                <span>Cerrar Sesión</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

Navbar.propTypes = {
    title: PropTypes.string
};

export default Navbar; 