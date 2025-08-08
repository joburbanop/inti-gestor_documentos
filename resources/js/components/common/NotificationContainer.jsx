import React from 'react';
import NotificationToast from './NotificationToast';

const NotificationContainer = ({ notifications, onRemove }) => {
    return (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
            {notifications.map((notification, index) => (
                <div
                    key={notification.id}
                    style={{
                        marginBottom: '10px',
                        transform: `translateY(${index * 80}px)`,
                        transition: 'transform 0.3s ease',
                    }}
                >
                    <NotificationToast
                        message={notification.message}
                        type={notification.type}
                        duration={notification.duration}
                        onClose={() => onRemove(notification.id)}
                    />
                </div>
            ))}
        </div>
    );
};

export default NotificationContainer; 