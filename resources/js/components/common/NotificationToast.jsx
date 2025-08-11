import React, { useEffect, useState, useRef } from 'react';

const NotificationToast = ({ 
    message, 
    type = 'info', 
    duration = 5000, 
    onClose,
    index = 0
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [progress, setProgress] = useState(100);
    const toastRef = useRef(null);

    useEffect(() => {
        // Animación de entrada
        const enterTimer = setTimeout(() => {
            setIsVisible(true);
        }, index * 100);

        // Barra de progreso
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev <= 0) {
                    clearInterval(progressInterval);
                    return 0;
                }
                return prev - (100 / (duration / 100));
            });
        }, 100);

        // Timer de cierre automático
        const closeTimer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => {
            clearTimeout(enterTimer);
            clearTimeout(closeTimer);
            clearInterval(progressInterval);
        };
    }, [duration, index]);

    const handleClose = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setTimeout(() => {
            setIsVisible(false);
            if (onClose) onClose();
        }, 400);
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <div className="icon-container success">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'error':
                return (
                    <div className="icon-container error">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'warning':
                return (
                    <div className="icon-container warning">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="icon-container info">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    const getStyles = () => {
        const baseStyles = {
            transform: isVisible 
                ? 'translateX(0) scale(1)' 
                : 'translateX(100%) scale(0.8)',
            opacity: isVisible ? 1 : 0,
        };

        switch (type) {
            case 'success':
                return {
                    ...baseStyles,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: isVisible 
                        ? '0 20px 40px -12px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(16, 185, 129, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)' 
                        : '0 0 0 rgba(16, 185, 129, 0)',
                };
            case 'error':
                return {
                    ...baseStyles,
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: isVisible 
                        ? '0 20px 40px -12px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(239, 68, 68, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)' 
                        : '0 0 0 rgba(239, 68, 68, 0)',
                };
            case 'warning':
                return {
                    ...baseStyles,
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: isVisible 
                        ? '0 20px 40px -12px rgba(245, 158, 11, 0.4), 0 0 0 1px rgba(245, 158, 11, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)' 
                        : '0 0 0 rgba(245, 158, 11, 0)',
                };
            default:
                return {
                    ...baseStyles,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: isVisible 
                        ? '0 20px 40px -12px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)' 
                        : '0 0 0 rgba(59, 130, 246, 0)',
                };
        }
    };

    const getTypeText = () => {
        switch (type) {
            case 'success': return '¡Éxito!';
            case 'error': return 'Error';
            case 'warning': return 'Advertencia';
            default: return 'Información';
        }
    };

    return (
        <div
            ref={toastRef}
            style={{
                position: 'relative',
                minWidth: '380px',
                maxWidth: '500px',
                padding: '20px 24px',
                borderRadius: '16px',
                color: 'white',
                fontWeight: '600',
                fontSize: '15px',
                lineHeight: '1.5',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                backdropFilter: 'blur(20px)',
                userSelect: 'none',
                ...getStyles(),
            }}
            onClick={handleClose}
            onMouseEnter={() => {
                if (toastRef.current) {
                    toastRef.current.style.transform = 'translateX(0) scale(1.02)';
                }
            }}
            onMouseLeave={() => {
                if (toastRef.current) {
                    toastRef.current.style.transform = 'translateX(0) scale(1)';
                }
            }}
            title="Clic para cerrar"
        >
            {/* Barra de progreso */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: '3px',
                    background: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '0 0 16px 16px',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'rgba(255, 255, 255, 0.8)',
                        transition: 'width 0.1s linear',
                        borderRadius: '0 0 16px 16px',
                    }}
                />
            </div>

            {/* Icono */}
            <div className="flex-shrink-0" style={{ marginTop: '2px' }}>
                {getIcon()}
            </div>

            {/* Contenido */}
            <div className="flex-1" style={{ marginTop: '2px' }}>
                <div 
                    style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        marginBottom: '4px',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                    }}
                >
                    {getTypeText()}
                </div>
                <div 
                    style={{
                        fontSize: '14px',
                        opacity: 0.95,
                        fontWeight: '500',
                        lineHeight: '1.4',
                    }}
                >
                    {message}
                </div>
            </div>

            {/* Botón de cerrar */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                }}
                style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    marginTop: '2px',
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                    e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.transform = 'scale(1)';
                }}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

// Agregar estilos CSS para los iconos
const style = document.createElement('style');
style.textContent = `
    .icon-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .icon-container:hover {
        transform: scale(1.1);
        background: rgba(255, 255, 255, 0.3);
    }
    
    .icon-container.success {
        background: rgba(16, 185, 129, 0.2);
    }
    
    .icon-container.error {
        background: rgba(239, 68, 68, 0.2);
    }
    
    .icon-container.warning {
        background: rgba(245, 158, 11, 0.2);
    }
    
    .icon-container.info {
        background: rgba(59, 130, 246, 0.2);
    }
`;
document.head.appendChild(style);

export default NotificationToast; 