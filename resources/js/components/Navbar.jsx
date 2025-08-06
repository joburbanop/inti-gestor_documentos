import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext';
import { INTILED_COLORS } from '../config/colors';

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
        { name: 'Dashboard', hash: 'dashboard', icon: '📊' },
        { name: 'Direcciones', hash: 'direcciones', icon: '🏢' },
        { name: 'Procesos de Apoyo', hash: 'procesos', icon: '⚙️' },
        { name: 'Documentos', hash: 'documentos', icon: '📁' },
    ];

    const adminItems = [
        { name: 'Administración', hash: 'administracion', icon: '🔧' },
    ];

    return (
        <nav 
            className="fixed top-0 left-0 right-0 z-50"
            style={{ 
                background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo y Título - Diseño Directo */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            {/* Logo directo sin contenedor */}
                            <img 
                                src="/img/logo-intiled-azul.png" 
                                alt="Intiled Logo" 
                                className="h-10 w-auto filter drop-shadow-lg"
                                style={{ 
                                    filter: 'drop-shadow(0 2px 4px rgba(31, 68, 139, 0.2))',
                                    maxHeight: '40px',
                                    objectFit: 'contain'
                                }}
                                onError={(e) => {
                                    console.log('Error loading logo image');
                                    e.target.style.display = 'none';
                                }}
                            />
                            <div className="flex flex-col">
                                <h1 
                                    className="text-xl font-bold"
                                    style={{ 
                                        background: `linear-gradient(135deg, ${INTILED_COLORS.azul} 0%, ${INTILED_COLORS.azulClaro} 100%)`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}
                                >
                                    {title}
                                </h1>
                                <p className="text-xs text-gray-500 -mt-1 font-medium">Sistema de Gestión</p>
                            </div>
                        </div>
                    </div>

                    {/* Navegación Principal - Desktop */}
                    <div className="hidden md:flex items-center space-x-3">
                        {navItems.map((item) => (
                            <button 
                                key={item.hash}
                                onClick={() => handleNavigation(item.hash)}
                                className="group relative px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 hover:scale-105 flex items-center space-x-2.5"
                                style={{ 
                                    color: INTILED_COLORS.azul,
                                    background: 'rgba(31, 68, 139, 0.03)',
                                    border: '1px solid rgba(31, 68, 139, 0.1)'
                                }}
                            >
                                <span className="text-lg group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">{item.icon}</span>
                                <span>{item.name}</span>
                                
                                {/* Efecto de fondo en hover */}
                                <div 
                                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    style={{ 
                                        background: `linear-gradient(135deg, ${INTILED_COLORS.azul} 0%, ${INTILED_COLORS.azulClaro} 100%)`,
                                        transform: 'scale(0.95)',
                                        zIndex: -1
                                    }}
                                ></div>
                                
                                {/* Línea inferior animada */}
                                <div 
                                    className="absolute bottom-0 left-1/2 w-0 h-1 group-hover:w-4/5 group-hover:left-1/10 transition-all duration-500"
                                    style={{ 
                                        background: `linear-gradient(90deg, ${INTILED_COLORS.azul} 0%, ${INTILED_COLORS.naranja} 100%)`,
                                        transform: 'translateX(-50%)',
                                        borderRadius: '2px'
                                    }}
                                ></div>
                            </button>
                        ))}
                        {user?.is_admin && adminItems.map((item) => (
                            <button 
                                key={item.hash}
                                onClick={() => handleNavigation(item.hash)}
                                className="group relative px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 hover:scale-105 flex items-center space-x-2.5"
                                style={{ 
                                    color: INTILED_COLORS.naranja,
                                    background: 'rgba(255, 125, 9, 0.08)',
                                    border: '1px solid rgba(255, 125, 9, 0.15)'
                                }}
                            >
                                <span className="text-lg group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">{item.icon}</span>
                                <span>{item.name}</span>
                                
                                {/* Efecto de fondo en hover */}
                                <div 
                                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    style={{ 
                                        background: `linear-gradient(135deg, ${INTILED_COLORS.naranja} 0%, #FF9A3C 100%)`,
                                        transform: 'scale(0.95)',
                                        zIndex: -1
                                    }}
                                ></div>
                                
                                {/* Línea inferior animada */}
                                <div 
                                    className="absolute bottom-0 left-1/2 w-0 h-1 group-hover:w-4/5 group-hover:left-1/10 transition-all duration-500"
                                    style={{ 
                                        background: `linear-gradient(90deg, ${INTILED_COLORS.naranja} 0%, #FF9A3C 100%)`,
                                        transform: 'translateX(-50%)',
                                        borderRadius: '2px'
                                    }}
                                ></div>
                            </button>
                        ))}
                    </div>

                    {/* Usuario y Logout - Desktop */}
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <div 
                                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-lg transition-all duration-300 hover:scale-110 relative overflow-hidden"
                                style={{ 
                                    background: `linear-gradient(135deg, ${INTILED_COLORS.azul} 0%, ${INTILED_COLORS.azulClaro} 100%)`
                                }}
                            >
                                {/* Efecto de brillo */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                                <span className="relative z-10">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold" style={{ color: INTILED_COLORS.azul }}>
                                    {user?.name}
                                </p>
                                <p className="text-gray-500 text-xs flex items-center">
                                    <span 
                                        className="w-2 h-2 rounded-full mr-2 shadow-sm" 
                                        style={{ backgroundColor: user?.is_admin ? INTILED_COLORS.naranja : INTILED_COLORS.verde }}
                                    ></span>
                                    {user?.is_admin ? 'Administrador' : 'Usuario'}
                                </p>
                            </div>
                        </div>
                        
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 hover:scale-105 border-2 hover:shadow-lg flex items-center space-x-2 group"
                            style={{ 
                                color: INTILED_COLORS.grisOscuro,
                                borderColor: '#e5e7eb',
                                backgroundColor: 'white'
                            }}
                        >
                            <span className="group-hover:rotate-12 transition-transform duration-300 text-lg">🚪</span>
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>

                    {/* Botón de menú móvil */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-300 hover:scale-110"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
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
                            {navItems.map((item) => (
                                <button
                                    key={item.hash}
                                    onClick={() => handleNavigation(item.hash)}
                                    className="block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-gray-50 hover:scale-105 flex items-center space-x-3"
                                    style={{ color: INTILED_COLORS.azul }}
                                >
                                    <span className="text-lg drop-shadow-sm">{item.icon}</span>
                                    <span>{item.name}</span>
                                </button>
                            ))}
                            {user?.is_admin && adminItems.map((item) => (
                                <button
                                    key={item.hash}
                                    onClick={() => handleNavigation(item.hash)}
                                    className="block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-orange-50 hover:scale-105 flex items-center space-x-3"
                                    style={{ color: INTILED_COLORS.naranja }}
                                >
                                    <span className="text-lg drop-shadow-sm">{item.icon}</span>
                                    <span>{item.name}</span>
                                </button>
                            ))}
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
                            >
                                <span className="text-lg">🚪</span>
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