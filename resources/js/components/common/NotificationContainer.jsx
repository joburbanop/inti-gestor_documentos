import React from 'react'; import NotificationToast from './NotificationToast';
 const NotificationContainer = ({ notifications, onRemove }) => {
 return (
 <div
 style={{
 position: 'fixed',
 top: '20px',
 right: '20px',
 zIndex: 9999,
 display: 'flex',
 flexDirection: 'column',
 gap: '12px',
 pointerEvents: 'none', // Permite clicks a través del contenedor
 }}
 >
 {notifications.map((notification, index) => (
 <div
 key={notification.id}
 style={{
 pointerEvents: 'auto', // Restaura clicks para las notificaciones
 transform: `translateX(${index * 20}px)`,
 transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
 animation: `notificationSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s both`,
 }}
 >
 <NotificationToast
 message={notification.message}
 type={notification.type}
 duration={notification.duration}
 onClose={() => onRemove(notification.id)}
 index={index}
 />
 </div>
 ))}
 </div>
 );
 };
 // Agregar estilos CSS para las animaciones
 const style = document.createElement('style');
 style.textContent = `
 @keyframes notificationSlideIn {
 0% {
 transform: translateX(100%) scale(0.8);
 opacity: 0;
 }
 100% {
 transform: translateX(0) scale(1);
 opacity: 1;
 }
 }
 @keyframes notificationSlideOut {
 0% {
 transform: translateX(0) scale(1);
 opacity: 1;
 }
 100% {
 transform: translateX(100%) scale(0.8);
 opacity: 0;
 }
 }
 `;
 document.head.appendChild(style);
 export default NotificationContainer;