import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { INTILED_COLORS } from '../config/colors';
import styles from '../styles/components/Login.module.css';

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
                        Intranet Inti
                    </h1>
                    <p className={styles.subtitle}>
                        Centro de Documentos
                    </p>
                </div>

                {/* Welcome Message */}
                <div className={styles.welcomeSection}>
                    <h2 className={styles.welcomeTitle}>
                        ¡Bienvenido!
                    </h2>
                    <p className={styles.welcomeText}>
                        Accede a tu cuenta para continuar
                    </p>
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

                {/* Demo Credentials */}
                <div className={styles.demoCredentials}>
                    <p className={styles.demoCredentialsTitle}>
                        Credenciales de demostración
                    </p>
                    <div className={styles.demoCredentialsCard}>
                        <div className={styles.credentialItem}>
                            <span className={styles.credentialLabel}>
                                <strong>👨‍💼 Admin:</strong>
                            </span>
                            <span className={styles.credentialValue}>
                                victor@intiled.com
                            </span>
                        </div>
                        <div className={styles.credentialItem}>
                            <span className={styles.credentialLabel}>
                                <strong>👤 Usuario:</strong>
                            </span>
                            <span className={styles.credentialValue}>
                                usuario@intiled.com
                            </span>
                        </div>
                        <div className={styles.credentialItem}>
                            <span className={styles.credentialLabel}>
                                <strong>🔑 Contraseña:</strong>
                            </span>
                            <span className={styles.credentialValue}>
                                password
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
                &copy; 2024 Intiled. Todos los derechos reservados.
            </div>
        </div>
    );
};

export default Login; 