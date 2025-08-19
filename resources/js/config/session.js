// Configuración de sesión y seguridad (optimizada)
export const SESSION_CONFIG = { // Tiempo de inactividad antes de mostrar advertencia (en minutos)
 WARNING_TIME: 25,
 // Tiempo total de inactividad antes de cerrar sesión (en minutos)
 TIMEOUT_TIME: 30,
 // Intervalo para verificar inactividad (en milisegundos)
 CHECK_INTERVAL: 120000, // 2 minutos (reducido de 1 minuto)
 // Intervalo para verificar advertencia de expiración (en milisegundos)
 WARNING_CHECK_INTERVAL: 60000, // 1 minuto (reducido de 30 segundos)
 // Eventos que se consideran actividad del usuario (reducidos)
 ACTIVITY_EVENTS: ['click', 'keypress', 'scroll']
 };
 // Función para obtener el tiempo restante en minutos
 export const getTimeRemaining = (lastActivity) => {
 if (!lastActivity) return 0;
 const now = new Date();
 const timeDiff = now.getTime() - lastActivity.getTime();
 const minutesElapsed = Math.floor(timeDiff / (1000 * 60));
 return Math.max(0, SESSION_CONFIG.TIMEOUT_TIME - minutesElapsed);
 };
 // Función para verificar si debe mostrar advertencia
 export const shouldShowWarning = (lastActivity) => {
 const timeRemaining = getTimeRemaining(lastActivity);
 return timeRemaining <= 5 && timeRemaining > 0;
 };
 // Función para verificar si la sesión ha expirado
 export const isSessionExpired = (lastActivity) => {
 return getTimeRemaining(lastActivity) <= 0;
 };