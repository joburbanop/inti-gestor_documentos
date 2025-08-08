import { useState, useCallback } from 'react';

const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback(({ message, type = 'info', duration = 5000 }) => {
        const id = Date.now() + Math.random();
        const newNotification = { id, message, type, duration };
        
        setNotifications(prev => [...prev, newNotification]);
        
        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const showSuccess = useCallback((message, duration = 5000) => {
        return addNotification({ message, type: 'success', duration });
    }, [addNotification]);

    const showError = useCallback((message, duration = 7000) => {
        return addNotification({ message, type: 'error', duration });
    }, [addNotification]);

    const showWarning = useCallback((message, duration = 6000) => {
        return addNotification({ message, type: 'warning', duration });
    }, [addNotification]);

    const showInfo = useCallback((message, duration = 5000) => {
        return addNotification({ message, type: 'info', duration });
    }, [addNotification]);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    return {
        notifications,
        addNotification,
        removeNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        clearAll
    };
};

export default useNotifications; 