import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        window.location.href = '/';
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1F448B 0%, #667eea 50%, #764ba2 100%)',
            fontFamily: 'Inter, Arial, sans-serif',
            padding: '2rem'
        }}>
            {/* Header */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img 
                        src="/img/Logo intiled azul.png" 
                        alt="Intiled Logo"
                        style={{
                            height: '40px',
                            width: 'auto',
                            filter: 'brightness(0) invert(1)',
                            opacity: 0.9
                        }}
                    />
                    <div>
                        <h1 style={{ 
                            color: 'white', 
                            fontSize: '1.5rem', 
                            fontWeight: '700',
                            margin: 0
                        }}>
                            Intranet Inti
                        </h1>
                        <p style={{ 
                            color: 'rgba(255, 255, 255, 0.8)', 
                            fontSize: '0.9rem',
                            margin: 0
                        }}>
                            Centro de Documentos
                        </p>
                    </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ 
                            color: 'white', 
                            fontSize: '1rem', 
                            fontWeight: '600',
                            margin: 0
                        }}>
                            {user?.name}
                        </p>
                        <p style={{ 
                            color: 'rgba(255, 255, 255, 0.7)', 
                            fontSize: '0.8rem',
                            margin: 0
                        }}>
                            {user?.role?.display_name || user?.role?.name || 'Usuario'}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            color: '#fecaca',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'rgba(34, 197, 94, 0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    border: '2px solid rgba(34, 197, 94, 0.4)'
                }}>
                    <span style={{ fontSize: '2rem' }}>✅</span>
                </div>
                
                <h2 style={{ 
                    color: 'white', 
                    fontSize: '2rem', 
                    fontWeight: '700',
                    marginBottom: '1rem'
                }}>
                    ¡Bienvenido al Dashboard!
                </h2>
                
                <p style={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    fontSize: '1.1rem',
                    marginBottom: '2rem'
                }}>
                    Has iniciado sesión exitosamente como <strong>{user?.name}</strong>
                </p>

                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    maxWidth: '500px',
                    margin: '0 auto'
                }}>
                    <h3 style={{ 
                        color: 'white', 
                        fontSize: '1.2rem', 
                        fontWeight: '600',
                        marginBottom: '1rem'
                    }}>
                        Información del Usuario
                    </h3>
                    
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        textAlign: 'left'
                    }}>
                        <div>
                            <p style={{ 
                                color: 'rgba(255, 255, 255, 0.7)', 
                                fontSize: '0.9rem',
                                margin: '0 0 0.25rem 0'
                            }}>
                                Nombre:
                            </p>
                            <p style={{ 
                                color: 'white', 
                                fontSize: '1rem',
                                fontWeight: '500',
                                margin: 0
                            }}>
                                {user?.name}
                            </p>
                        </div>
                        
                        <div>
                            <p style={{ 
                                color: 'rgba(255, 255, 255, 0.7)', 
                                fontSize: '0.9rem',
                                margin: '0 0 0.25rem 0'
                            }}>
                                Email:
                            </p>
                            <p style={{ 
                                color: 'white', 
                                fontSize: '1rem',
                                fontWeight: '500',
                                margin: 0
                            }}>
                                {user?.email}
                            </p>
                        </div>
                        
                        <div>
                            <p style={{ 
                                color: 'rgba(255, 255, 255, 0.7)', 
                                fontSize: '0.9rem',
                                margin: '0 0 0.25rem 0'
                            }}>
                                Rol:
                            </p>
                            <p style={{ 
                                color: 'white', 
                                fontSize: '1rem',
                                fontWeight: '500',
                                margin: 0
                            }}>
                                {user?.role?.display_name || user?.role?.name || 'Sin rol'}
                            </p>
                        </div>
                        
                        <div>
                            <p style={{ 
                                color: 'rgba(255, 255, 255, 0.7)', 
                                fontSize: '0.9rem',
                                margin: '0 0 0.25rem 0'
                            }}>
                                Tipo de Usuario:
                            </p>
                            <p style={{ 
                                color: user?.is_admin ? '#10b981' : '#f59e0b', 
                                fontSize: '1rem',
                                fontWeight: '500',
                                margin: 0
                            }}>
                                {user?.is_admin ? '👑 Administrador' : '👤 Usuario'}
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ 
                    marginTop: '2rem',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <p style={{ 
                        color: 'rgba(255, 255, 255, 0.7)', 
                        fontSize: '0.9rem',
                        margin: 0
                    }}>
                        🚀 <strong>Sistema de Autenticación Implementado</strong><br/>
                        El proceso de inicio de sesión está funcionando correctamente con buenas prácticas de programación.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 