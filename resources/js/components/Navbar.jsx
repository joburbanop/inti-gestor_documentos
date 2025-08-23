import React, { useState } from 'react'; import { NavLink } from 'react-router-dom';
 import PropTypes from 'prop-types';
 import { useAuth } from '../contexts/AuthContext';
 import { useHasPermission } from '../hooks/useAuthorization';
import { useProcessTypes } from '../hooks/useProcessTypes';
import { renderIcon } from '../utils/iconMapping';
import { PERMISSIONS } from '../roles/permissions';
 import { INTILED_COLORS } from '../config/colors';
 import styles from '../styles/components/Navbar.module.css';
 import { QualityIcon, SafetyHealthIcon } from './icons/ManagementIcons';
 // Componentes de iconos SVG optimizados
 const DashboardIcon = ({ className }) => (
 <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5v14" />
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 5v14" />
 </svg>
 );
 const ProcessesIcon = ({ className }) => (
 <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
 </svg>
 );
 const StrategicProcessIcon = ({ className }) => (
 <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
 </svg>
 );
 const MissionProcessIcon = ({ className }) => (
 <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
 </svg>
 );
 const SupportProcessIcon = ({ className }) => (
 <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
 </svg>
 );
 const EvaluationProcessIcon = ({ className }) => (
 <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
  const { processTypes, loading: processTypesLoading } = useProcessTypes();
 // Debug: Log del usuario
 const handleLogout = () => {
 logout();
 };
 const closeMobileMenu = () => {
 setIsMobileMenuOpen(false);
 };
   // Crear dropdownItems dinámicamente basado en los tipos de proceso
  const processDropdownItems = processTypes.map(tipo => ({
    name: tipo.titulo,
    path: `/procesos?tipo=${tipo.nombre}`,
    icon: () => renderIcon(tipo.icono, "w-5 h-5")
  }));

  const navItems = [
    { name: 'Dashboard', path: '/' , icon: DashboardIcon },
    {
      name: 'Procesos',
      path: null,
      icon: ProcessesIcon,
      hasDropdown: true,
      dropdownItems: processDropdownItems
    },
    { name: 'Documentos', path: '/documentos', icon: DocumentsIcon },
  ];
 const adminItems = [
 { name: 'Administración', path: '/administracion', icon: AdminIcon, permission: PERMISSIONS.MANAGE_USERS },
 ];
 // Navegación simplificada para usuarios (no administradores)
 const userNavItems = [
 { name: 'Inicio', path: '/', icon: DashboardIcon },
 { name: 'Sistema de Gestión', path: '/identidad', icon: StrategicProcessIcon },
 ];
 const renderNavItem = (item, classNameBtn, classNameIcon) => {
 const IconComponent = item.icon;
 // Manejar elementos con dropdown (Procesos)
 if (item.hasDropdown) {
 return (
 <div key={item.name} className={styles.dropdownWrapper}>
 <button
 type="button"
 className={`${classNameBtn} ${styles.hasDropdown}`}
 aria-haspopup="menu"
 aria-expanded="false"
 aria-label={`${item.name} - abrir opciones`}
 onClick={(e) => e.preventDefault()}
 onFocus={(e) => e.currentTarget.parentElement.classList.add('focus-within')}
 onBlur={(e) => e.currentTarget.parentElement.classList.remove('focus-within')}
 >
 <IconComponent className={classNameIcon} />
 <span>{item.name}</span>
 </button>
         <div className={styles.dropdownMenu} role="menu" aria-label="Submenú procesos internos">
          {item.dropdownItems.map((dropdownItem) => {
            // Manejar iconos dinámicos (funciones) vs iconos estáticos (componentes)
            const DropdownIconComponent = typeof dropdownItem.icon === 'function' ? dropdownItem.icon() : dropdownItem.icon;
            return (
              <NavLink
                key={dropdownItem.path}
                to={dropdownItem.path}
                className={styles.dropdownItem}
                onClick={closeMobileMenu}
                role="menuitem"
              >
                {typeof dropdownItem.icon === 'function' ? (
                  <div className={styles.dropdownIcon}>
                    {dropdownItem.icon()}
                  </div>
                ) : (
                  <DropdownIconComponent className={styles.dropdownIcon} />
                )}
                <span>{dropdownItem.name}</span>
              </NavLink>
            );
          })}
        </div>
 </div>
 );
 }
 // Manejar elementos sin path (placeholder)
 if (!item.path) {
 return (
 <button
 key={item.name}
 onClick={(e) => { e.preventDefault(); /* placeholder sin navegación */ }}
 className={classNameBtn}
 aria-label={`Elemento: ${item.name}`}
 type="button"
 >
 <IconComponent className={classNameIcon} />
 <span>{item.name}</span>
 </button>
 );
 }
 // Manejar Sistema de Gestión (dropdown especial para usuarios)
 const hasSpecialDropdown = item.name === 'Sistema de Gestión';
 if (hasSpecialDropdown) {
 return (
 <div key={item.name} className={styles.dropdownWrapper}>
 <button
 type="button"
 className={`${classNameBtn} ${styles.hasDropdown}`}
 aria-haspopup="menu"
 aria-expanded="false"
 aria-label={`${item.name} - abrir opciones`}
 onClick={(e) => e.preventDefault()}
 onFocus={(e) => e.currentTarget.parentElement.classList.add('focus-within')}
 onBlur={(e) => e.currentTarget.parentElement.classList.remove('focus-within')}
 >
 <IconComponent className={classNameIcon} />
 <span>{item.name}</span>
 </button>
 <div className={styles.dropdownMenu} role="menu" aria-label="Submenú sistema de gestión">
 <NavLink to="/identidad?tab=calidad" className={styles.dropdownItem} onClick={closeMobileMenu} role="menuitem">
 <QualityIcon className={styles.dropdownIcon} />
 <span>Calidad</span>
 </NavLink>
 <NavLink to="/identidad?tab=sst" className={styles.dropdownItem} onClick={closeMobileMenu} role="menuitem">
 <SafetyHealthIcon className={styles.dropdownIcon} />
 <span>Seguridad y Salud en el Trabajo</span>
 </NavLink>
 </div>
 </div>
 );
 }
 // Elementos normales con navegación
 return (
 <NavLink
 key={item.path}
 to={item.path}
 onClick={closeMobileMenu}
 className={classNameBtn}
 aria-label={`Navegar a ${item.name}`}
 >
 <IconComponent className={classNameIcon} />
 <span>{item.name}</span>
 </NavLink>
 );
 };
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
 {(user?.is_admin ? navItems : userNavItems).map((item) => (
 renderNavItem(item, styles.navButton, styles.navIcon)
 ))}
 {adminItems.filter(i => useHasPermission(i.permission)).map((item) => {
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
 onClick={() => {
 setIsMobileMenuOpen(!isMobileMenuOpen);
 }}
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
 {(user?.is_admin ? navItems : userNavItems).map((item) => {
 // Para móvil, expandir los dropdowns automáticamente
 if (item.hasDropdown) {
 return (
 <div key={item.name}>
 <div className={`${styles.mobileNavButton} ${styles.mobileDropdownHeader}`}>
 <item.icon className={styles.mobileIcon} />
 <span>{item.name}</span>
 </div>
 {item.dropdownItems.map((dropdownItem) => {
 const DropdownIconComponent = dropdownItem.icon;
 return (
 <NavLink
 key={dropdownItem.path}
 to={dropdownItem.path}
 onClick={closeMobileMenu}
 className={`${styles.mobileNavButton} ${styles.mobileDropdownItem}`}
 aria-label={`Navegar a ${dropdownItem.name}`}
 >
 <DropdownIconComponent className={styles.mobileIcon} />
 <span>{dropdownItem.name}</span>
 </NavLink>
 );
 })}
 </div>
 );
 }
 return renderNavItem(item, styles.mobileNavButton, styles.mobileIcon);
 })}
 {adminItems.filter(i => useHasPermission(i.permission)).map((item) => {
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