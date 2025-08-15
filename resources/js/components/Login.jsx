import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { INTILED_COLORS } from '../config/colors';
import styles from '../styles/components/Login.module.css';

const Login = () => {
    console.log('🔐 [Login.jsx] Renderizando componente Login');
    
    const { login, error, clearError, isLoading, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log('✏️ [Login.jsx] Cambio en input:', name, 'valor:', value ? '***' : 'vacío');
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('📝 [Login.jsx] Enviando formulario de login');
        
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
            console.log('✅ [Login.jsx] Login exitoso');
        } else {
            console.log('❌ [Login.jsx] Login fallido:', result.error);
        }
    };

    // Redirigir si ya está autenticado
    useEffect(() => {
        console.log('🔄 [Login.jsx] useEffect - Estado de autenticación:', { isAuthenticated, isLoading });
        if (isAuthenticated) {
            console.log('🔄 [Login.jsx] Usuario ya autenticado, redirigiendo a dashboard');
            // Usar el sistema de hash routing en lugar de redirección directa
            window.location.href = '/#dashboard';
        }
    }, [isAuthenticated]);

    console.log('🎨 [Login.jsx] Renderizando JSX del Login');
    return (
        <div className={styles.loginContainer}>
            {/* Main Content */}
            <div className={styles.loginCard}>
                {/* Header with Logo */}
                <div className={styles.header}>
                    <div className={styles.logoContainer}>
                        <img 
                            src="/img/logo-intiled-azul.png" 
                            alt="Intiled Logo"
                            className={styles.logo}
                        />
                    </div>
                    <h1 className={styles.title}>
                        Gestión Documental
                    </h1>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={styles.input}
                            placeholder="tu@email.com"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Contraseña
                        </label>
                        <div className={styles.passwordContainer}>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={`${styles.input} ${styles.passwordInput}`}
                                placeholder="••••••••"
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={styles.togglePassword}
                                disabled={isLoading}
                            >
                                {showPassword ? "Ocultar" : "Mostrar"}
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={styles.submitButton}
                    >
                        {isLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <div className={styles.loadingSpinner}></div>
                                Iniciando sesión...
                            </div>
                        ) : (
                            "Iniciar Sesión"
                        )}
                    </button>
                </form>

                
            </div>

            {/* Footer */}
            <div className={styles.footer}>
                &copy; 2025 Intiled. Todos los derechos reservados.
            </div>
        </div>
    );
};

export default Login; 