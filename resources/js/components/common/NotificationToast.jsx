import React, { useEffect, useState } from 'react';

const NotificationToast = ({ 
    message, 
    type = 'info', 
    duration = 5000, 
    onClose 
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setIsVisible(false);
            if (onClose) onClose();
        }, 300);
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

            const getStyles = () => {
            const baseStyles = {
                transform: isAnimating ? 'translateX(100%) scale(0.95)' : 'translateX(0) scale(1)',
                opacity: isAnimating ? 0 : 1,
            };

            switch (type) {
                case 'success':
                    return {
                        ...baseStyles,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                        border: '3px solid #047857',
                        boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.5), 0 0 0 1px rgba(16, 185, 129, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                    };
                case 'error':
                    return {
                        ...baseStyles,
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                        border: '3px solid #b91c1c',
                        boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.5), 0 0 0 1px rgba(239, 68, 68, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                    };
                case 'warning':
                    return {
                        ...baseStyles,
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
                        border: '3px solid #b45309',
                        boxShadow: '0 25px 50px -12px rgba(245, 158, 11, 0.5), 0 0 0 1px rgba(245, 158, 11, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                    };
                default:
                    return {
                        ...baseStyles,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                        border: '3px solid #1d4ed8',
                        boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                    };
            }
        };

    if (!isVisible) return null;

            return (
            <div
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 9999,
                    minWidth: '400px',
                    maxWidth: '600px',
                    padding: '20px 24px',
                    borderRadius: '16px',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '16px',
                    lineHeight: '1.6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    backdropFilter: 'blur(15px)',
                    transform: isAnimating ? 'translateX(100%) scale(0.95)' : 'translateX(0) scale(1)',
                    opacity: isAnimating ? 0 : 1,
                    animation: !isAnimating ? 'notificationPulse 2s ease-in-out infinite' : 'none',
                    ...getStyles(),
                }}
                onClick={handleClose}
                title="Clic para cerrar"
            >
            <div className="flex-shrink-0">
                {getIcon()}
            </div>
                            <div className="flex-1">
                    <div className="font-bold text-xl mb-2">
                        {type === 'success' && '🎉 ¡ÉXITO!'}
                        {type === 'error' && '❌ ERROR'}
                        {type === 'warning' && '⚠️ ADVERTENCIA'}
                        {type === 'info' && 'ℹ️ INFORMACIÓN'}
                    </div>
                    <div className="text-base opacity-95 font-medium">
                        {message}
                    </div>
                </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                }}
                style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

    // Agregar estilos CSS para la animación de pulso
    const style = document.createElement('style');
    style.textContent = `
        @keyframes notificationPulse {
            0%, 100% {
                transform: translateX(0) scale(1);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }
            50% {
                transform: translateX(0) scale(1.02);
                box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.6);
            }
        }
    `;
    document.head.appendChild(style);

    export default NotificationToast; 