import React, { useState, useEffect } from 'react'; import { useAuth } from '../../contexts/AuthContext';
 import { SESSION_CONFIG, getTimeRemaining, shouldShowWarning } from '../../config/session';
 import { isAutoWarningsEnabled } from '../../config/performance';
 const SessionTimeoutWarning = () => {
 const { lastActivity, updateActivity, logout } = useAuth();
 const [showWarning, setShowWarning] = useState(false);
 const [timeLeft, setTimeLeft] = useState(0);
 useEffect(() => {
 // COMPLETAMENTE DESHABILITADO - NO HACER NADA
 setShowWarning(false);
 // NO configurar ningún intervalo
 // NO verificar nada automáticamente
 }, []); // Sin dependencias para que solo se ejecute una vez
 const handleExtendSession = () => {
 updateActivity();
 setShowWarning(false);
 };
 const handleLogout = () => {
 logout();
 };
 if (!showWarning) return null;
 return (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
 <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
 <div className="flex items-center mb-4">
 <div className="flex-shrink-0">
 <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round strokeLinejoin="round strokeWidth={2} d=
 "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667
 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3
 .732 16.5c-.77.833.192 2.5 1.732 2.5z />
 </svg>
 </div>
 <div className="ml-3">
 <h3 className="text-lg font-medium text-gray-900">
 Sesión por expirar
 </h3>
 </div>
 </div>
 <div className="mb-4">
 <p className="text-sm text-gray-600">
 Tu sesión expirará en <s
 pan className="font-semibold text-red-600>{timeLeft} minuto{timeLeft !== 1 ? 's : '}</span> por inactividad.
 </p>
 <p className="text-sm text-gray-600 mt-2">
 ¿Deseas continuar con tu sesión activa?
 </p>
 </div>
 <div className="flex space-x-3">
 <button
 onClick={handleExtendSession}
 className="flex-1 bg-blue-600 hover:bg-blue-700 text-white fo
 nt-medium py-2 px-4 rounded-md transition duration
 -200
 >
 Continuar sesión
 </button>
 <button
 onClick={handleLogout}
 className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700
 font-medium py-2 px-4 rounded-md transition durat
 ion-200
 >
 Cerrar sesión
 </button>
 </div>
 </div>
 </div>
 );
 };
 export default SessionTimeoutWarning;