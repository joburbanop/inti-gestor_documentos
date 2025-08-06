import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const { login, error, clearError, isLoading, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
            // El login fue exitoso, el contexto manejará la redirección
            console.log('Login exitoso');
        }
    };

    // Redirigir si ya está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            window.location.href = '/dashboard';
        }
    }, [isAuthenticated]);

    return (
        <>
            {/* Global Styles */}
            <style>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                html, body {
                    margin: 0;
                    padding: 0;
                    overflow-x: hidden;
                    background: linear-gradient(135deg, #1F448B 0%, #667eea 50%, #764ba2 100%);
                }
                
                #app {
                    margin: 0;
                    padding: 0;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #1F448B 0%, #667eea 50%, #764ba2 100%);
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                
                input:focus {
                    border-color: rgba(255, 255, 255, 0.5) !important;
                    background: rgba(255, 255, 255, 0.15) !important;
                    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1) !important;
                }
                
                input::placeholder {
                    color: rgba(255, 255, 255, 0.5) !important;
                }
                
                button:hover:not(:disabled) {
                    transform: translateY(-2px) !important;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2) !important;
                }
                
                button[type="button"]:hover {
                    background: rgba(255, 255, 255, 0.1) !important;
                    color: white !important;
                }
            `}</style>

            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1F448B 0%, #667eea 50%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                fontFamily: 'Inter, Arial, sans-serif',
                position: 'relative',
                overflow: 'hidden',
                margin: 0
            }}>
                {/* Animated Background Elements */}
                <div style={{
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    width: '200px',
                    height: '200px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    animation: 'float 6s ease-in-out infinite'
                }}></div>
                <div style={{
                    position: 'absolute',
                    top: '60%',
                    right: '10%',
                    width: '150px',
                    height: '150px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '50%',
                    animation: 'float 8s ease-in-out infinite reverse'
                }}></div>
                <div style={{
                    position: 'absolute',
                    bottom: '20%',
                    left: '20%',
                    width: '100px',
                    height: '100px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '50%',
                    animation: 'float 7s ease-in-out infinite'
                }}></div>

                {/* Main Content */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '3rem',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                    maxWidth: '450px',
                    width: '100%',
                    position: 'relative',
                    zIndex: 10
                }}>
                    {/* Header with Logo */}
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            <img 
                                src="/img/Logo intiled azul.png" 
                                alt="Intiled Logo"
                                style={{
                                    height: '60px',
                                    width: 'auto',
                                    filter: 'brightness(0) invert(1)',
                                    opacity: 0.9
                                }}
                            />
                        </div>
                        <h1 style={{ 
                            color: 'white', 
                            fontSize: '2.5rem', 
                            fontWeight: '700',
                            marginBottom: '0.5rem',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>
                            Intranet Inti
                        </h1>
                        <p style={{ 
                            color: 'rgba(255, 255, 255, 0.9)', 
                            fontSize: '1.1rem',
                            fontWeight: '400'
                        }}>
                            Centro de Documentos
                        </p>
                    </div>

                    {/* Welcome Message */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ 
                            color: 'white', 
                            fontSize: '1.5rem', 
                            fontWeight: '600',
                            marginBottom: '0.5rem'
                        }}>
                            ¡Bienvenido!
                        </h2>
                        <p style={{ 
                            color: 'rgba(255, 255, 255, 0.8)', 
                            fontSize: '0.95rem'
                        }}>
                            Accede a tu cuenta para continuar
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ 
                                display: 'block', 
                                color: 'white', 
                                marginBottom: '0.75rem',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                            }}>
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '1rem',
                                    transition: 'all 0.3s ease',
                                    boxSizing: 'border-box'
                                }}
                                placeholder="tu@email.com"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label style={{ 
                                display: 'block', 
                                color: 'white', 
                                marginBottom: '0.75rem',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                            }}>
                                Contraseña
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        paddingRight: '3rem',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '1rem',
                                        transition: 'all 0.3s ease',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '6px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    disabled={isLoading}
                                >
                                    {showPassword ? "Ocultar" : "Mostrar"}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                color: '#fecaca',
                                padding: '1rem',
                                borderRadius: '12px',
                                fontSize: '0.9rem',
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                background: 'linear-gradient(45deg, #FF7D09, #B1CC34)',
                                color: 'white',
                                border: 'none',
                                fontWeight: '600',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                fontSize: '1rem',
                                transition: 'all 0.3s ease',
                                opacity: isLoading ? 0.7 : 1,
                                transform: isLoading ? 'scale(0.98)' : 'scale(1)',
                                boxShadow: '0 4px 15px rgba(255, 125, 9, 0.3)'
                            }}
                        >
                            {isLoading ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <div style={{
                                        width: '16px',
                                        height: '16px',
                                        border: '2px solid rgba(255, 255, 255, 0.3)',
                                        borderTop: '2px solid white',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }}></div>
                                    Iniciando sesión...
                                </div>
                            ) : (
                                "Iniciar Sesión"
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div style={{ 
                        marginTop: '2rem', 
                        paddingTop: '1.5rem', 
                        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                        textAlign: 'center'
                    }}>
                        <p style={{ 
                            color: 'rgba(255, 255, 255, 0.9)', 
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            marginBottom: '1rem'
                        }}>
                            Credenciales de demostración
                        </p>
                        <div style={{ 
                            background: 'rgba(255, 255, 255, 0.08)', 
                            padding: '1.5rem', 
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.15)'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem' }}>
                                        <strong>👨‍💼 Admin:</strong>
                                    </span>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                                        victor@intiled.com
                                    </span>
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem' }}>
                                        <strong>👤 Usuario:</strong>
                                    </span>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                                        usuario@intiled.com
                                    </span>
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem' }}>
                                        <strong>🔑 Contraseña:</strong>
                                    </span>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                                        password
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.8rem',
                    textAlign: 'center'
                }}>
                    &copy; 2024 Intiled. Todos los derechos reservados.
                </div>

                {/* Additional CSS for spinner */}
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </>
    );
};

export default Login; 