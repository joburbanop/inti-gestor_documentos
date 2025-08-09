// Configuración de rendimiento - Temporal
export const PERFORMANCE_CONFIG = {
    // Deshabilitar monitoreo de actividad para evitar recargas
    DISABLE_ACTIVITY_MONITORING: true,
    
    // Deshabilitar advertencias de expiración automáticas
    DISABLE_AUTO_WARNINGS: true,
    
    // Intervalo mínimo entre actualizaciones de actividad (ms)
    MIN_ACTIVITY_UPDATE_INTERVAL: 30000, // 30 segundos
    
    // Throttling para eventos de mouse
    MOUSE_THROTTLE_DELAY: 1000, // 1 segundo
    
    // Throttling para eventos de teclado
    KEYBOARD_THROTTLE_DELAY: 500, // 0.5 segundos
    
    // Throttling para eventos de scroll
    SCROLL_THROTTLE_DELAY: 2000, // 2 segundos
};

// Función para verificar si el monitoreo está habilitado
export const isActivityMonitoringEnabled = () => {
    return !PERFORMANCE_CONFIG.DISABLE_ACTIVITY_MONITORING;
};

// Función para verificar si las advertencias automáticas están habilitadas
export const isAutoWarningsEnabled = () => {
    return !PERFORMANCE_CONFIG.DISABLE_AUTO_WARNINGS;
};
