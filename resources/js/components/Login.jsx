import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { INTILED_COLORS, INTILED_GRADIENTS, INTILED_THEMES } from '../config/colors';

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
                    background: ${INTILED_COLORS.fondo};
                }
                
                #app {
                    margin: 0;
                    padding: 0;
                    min-height: 100vh;
                    background: ${INTILED_COLORS.fondo};
                }
                
                input:focus {
                    border-color: ${INTILED_COLORS.azul} !important;
                    background: ${INTILED_COLORS.superficie} !important;
                    box-shadow: 0 0 0 3px ${INTILED_COLORS.azulTransparente} !important;
                }
                
                input::placeholder {
                    color: ${INTILED_COLORS.grisTexto} !important;
                }
                
                button:hover:not(:disabled) {
                    transform: translateY(-2px) !important;
                    box-shadow: 0 8px 25px rgba(31, 68, 139, 0.3) !important;
                }
                
                button[type="button"]:hover {
                    background: ${INTILED_COLORS.superficieSecundaria} !important;
                    color: ${INTILED_COLORS.azul} !important;
                }
            `}</style>

            <div style={{
                minHeight: '100vh',
                background: INTILED_COLORS.fondo,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                fontFamily: 'Inter, Arial, sans-serif',
                position: 'relative',
                overflow: 'hidden',
                margin: 0
            }}>
                {/* Main Content */}
                <div style={{
                    ...INTILED_THEMES.cardElevada,
                    borderRadius: '24px',
                    padding: '3rem',
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
                                    opacity: 0.9
                                }}
                            />
                        </div>
                        <h1 style={{ 
                            color: INTILED_COLORS.azul, 
                            fontSize: '2.5rem', 
                            fontWeight: '700',
                            marginBottom: '0.5rem'
                        }}>
                            Intranet Inti
                        </h1>
                        <p style={{ 
                            color: INTILED_COLORS.grisTexto, 
                            fontSize: '1.1rem',
                            fontWeight: '400'
                        }}>
                            Centro de Documentos
                        </p>
                    </div>

                    {/* Welcome Message */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ 
                            color: INTILED_COLORS.grisOscuro, 
                            fontSize: '1.5rem', 
                            fontWeight: '600',
                            marginBottom: '0.5rem'
                        }}>
                            ¡Bienvenido!
                        </h2>
                        <p style={{ 
                            color: INTILED_COLORS.grisTexto, 
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
                                color: INTILED_COLORS.grisOscuro, 
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
                                    ...INTILED_THEMES.input,
                                    outline: 'none',
                                    fontSize: '1rem',
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
                                color: INTILED_COLORS.grisOscuro, 
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
                                        ...INTILED_THEMES.input,
                                        outline: 'none',
                                        fontSize: '1rem',
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
                                        color: INTILED_COLORS.grisTexto,
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
                                ...INTILED_THEMES.error,
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
                                ...INTILED_THEMES.botonPrimario,
                                fontWeight: '600',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                fontSize: '1rem',
                                opacity: isLoading ? 0.7 : 1,
                                transform: isLoading ? 'scale(0.98)' : 'scale(1)'
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
                        borderTop: `1px solid ${INTILED_COLORS.grisBorde}`,
                        textAlign: 'center'
                    }}>
                        <p style={{ 
                            color: INTILED_COLORS.grisTexto, 
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            marginBottom: '1rem'
                        }}>
                            Credenciales de demostración
                        </p>
                        <div style={{ 
                            background: INTILED_COLORS.superficieSecundaria,
                            padding: '1.5rem', 
                            borderRadius: '12px',
                            border: `1px solid ${INTILED_COLORS.grisBorde}`
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ color: INTILED_COLORS.grisTexto, fontSize: '0.85rem' }}>
                                        <strong>👨‍💼 Admin:</strong>
                                    </span>
                                    <span style={{ color: INTILED_COLORS.grisOscuro, fontSize: '0.85rem', fontFamily: 'monospace' }}>
                                        victor@intiled.com
                                    </span>
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ color: INTILED_COLORS.grisTexto, fontSize: '0.85rem' }}>
                                        <strong>👤 Usuario:</strong>
                                    </span>
                                    <span style={{ color: INTILED_COLORS.grisOscuro, fontSize: '0.85rem', fontFamily: 'monospace' }}>
                                        usuario@intiled.com
                                    </span>
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ color: INTILED_COLORS.grisTexto, fontSize: '0.85rem' }}>
                                        <strong>🔑 Contraseña:</strong>
                                    </span>
                                    <span style={{ color: INTILED_COLORS.grisOscuro, fontSize: '0.85rem', fontFamily: 'monospace' }}>
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
                    color: INTILED_COLORS.grisTexto,
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