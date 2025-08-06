import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext';
import { INTILED_COLORS } from '../config/colors';
import styles from '../styles/components/Navbar.module.css';

// Componentes de iconos SVG
const DashboardIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const DirectionsIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

const ProcessesIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const DocumentsIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const AdminIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const LogoutIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const MenuIcon = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const Navbar = ({ title = "Intranet Inti" }) => {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
    };

    const handleNavigation = (hash) => {
        window.location.hash = hash;
        setIsMobileMenuOpen(false);
    };

    const navItems = [
        { name: 'Dashboard', hash: 'dashboard', icon: DashboardIcon },
        { name: 'Direcciones', hash: 'direcciones', icon: DirectionsIcon },
        { name: 'Procesos de Apoyo', hash: 'procesos', icon: ProcessesIcon },
        { name: 'Documentos', hash: 'documentos', icon: DocumentsIcon },
    ];

    const adminItems = [
        { name: 'Administración', hash: 'administracion', icon: AdminIcon },
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
                                    console.log('Error loading logo image');
                                    e.target.style.display = 'none';
                                }}
                            />
                            <div className={styles.brandText}>
                                <h1 className={styles.brandTitle}>{title}</h1>
                                <p className={styles.brandSubtitle}>Sistema de Gestión</p>
                            </div>
                        </div>
                    </div>

                    {/* Sección de Navegación - Desktop */}
                    <div className={`${styles.navigationSection} hidden md:flex`}>
                        {navItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <button 
                                    key={item.hash}
                                    onClick={() => handleNavigation(item.hash)}
                                    className={`${styles.navButton} group`}
                                    aria-label={`Navegar a ${item.name}`}
                                >
                                    <IconComponent className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm" />
                                    <span>{item.name}</span>
                                </button>
                            );
                        })}
                        {user?.is_admin && adminItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <button 
                                    key={item.hash}
                                    onClick={() => handleNavigation(item.hash)}
                                    className={`${styles.navButton} ${styles.adminButton} group`}
                                    aria-label={`Navegar a ${item.name}`}
                                >
                                    <IconComponent className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm" />
                                    <span>{item.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Sección de Usuario - Desktop */}
                    <div className={`${styles.userSection} hidden md:flex`}>
                        <div className={styles.userInfo}>
                            <div className={`${styles.userAvatar} hover:scale-110`}>
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
                            className={`${styles.logoutButton} hover:scale-105 hover:shadow-lg group`}
                            aria-label="Cerrar sesión"
                        >
                            <LogoutIcon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>

                    {/* Botón de menú móvil */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={`${styles.mobileMenuButton} md:hidden hover:bg-gray-100 hover:scale-110`}
                        aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                    >
                        {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                    </button>
                </div>

                {/* Menú móvil */}
                {isMobileMenuOpen && (
                    <div 
                        className="md:hidden border-t border-gray-100"
                        style={{ 
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(20px)'
                        }}
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navItems.map((item) => {
                                const IconComponent = item.icon;
                                return (
                                    <button
                                        key={item.hash}
                                        onClick={() => handleNavigation(item.hash)}
                                        className="block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-gray-50 hover:scale-105 flex items-center space-x-3"
                                        style={{ color: INTILED_COLORS.azul }}
                                        aria-label={`Navegar a ${item.name}`}
                                    >
                                        <IconComponent className="w-5 h-5 drop-shadow-sm" />
                                        <span>{item.name}</span>
                                    </button>
                                );
                            })}
                            {user?.is_admin && adminItems.map((item) => {
                                const IconComponent = item.icon;
                                return (
                                    <button
                                        key={item.hash}
                                        onClick={() => handleNavigation(item.hash)}
                                        className="block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-orange-50 hover:scale-105 flex items-center space-x-3"
                                        style={{ color: INTILED_COLORS.naranja }}
                                        aria-label={`Navegar a ${item.name}`}
                                    >
                                        <IconComponent className="w-5 h-5 drop-shadow-sm" />
                                        <span>{item.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                        
                        {/* Usuario móvil */}
                        <div className="px-4 py-4 border-t border-gray-100">
                            <div className="flex items-center space-x-3 mb-4">
                                <div 
                                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-bold"
                                    style={{ 
                                        background: `linear-gradient(135deg, ${INTILED_COLORS.azul} 0%, ${INTILED_COLORS.azulClaro} 100%)`
                                    }}
                                >
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="text-sm">
                                    <p className="font-semibold" style={{ color: INTILED_COLORS.azul }}>
                                        {user?.name}
                                    </p>
                                    <p className="text-gray-500 text-xs flex items-center">
                                        <span 
                                            className="w-2 h-2 rounded-full mr-2" 
                                            style={{ backgroundColor: user?.is_admin ? INTILED_COLORS.naranja : INTILED_COLORS.verde }}
                                        ></span>
                                        {user?.is_admin ? 'Administrador' : 'Usuario'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-red-50 hover:text-red-700 border-2 border-gray-200 hover:border-red-200 text-left flex items-center space-x-2"
                                style={{ color: INTILED_COLORS.grisOscuro }}
                                aria-label="Cerrar sesión"
                            >
                                <LogoutIcon className="w-5 h-5" />
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