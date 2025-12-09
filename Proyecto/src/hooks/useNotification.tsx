import React, { useState, useCallback } from 'react';
import Notification, { NotificationType } from '../components/Common/Notification';

interface NotificationState {
  id: number;
  message: string;
  type: NotificationType;
}

let notificationIdCounter = 0;

export const useNotification = () => {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = notificationIdCounter++;
    setNotifications((prev) => [...prev, { id, message, type }]);

    // Auto-remover después de la animación
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4300);
  }, []);

  const removeNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const NotificationContainer: React.FC = () => {
    if (notifications.length === 0) return null;
    
    return (
      <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 10000, pointerEvents: 'none' }}>
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{
              position: 'absolute',
              top: `${20 + index * 90}px`,
              right: '20px',
              pointerEvents: 'auto',
            }}
          >
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </div>
    );
  };

  return {
    showNotification,
    NotificationContainer,
  };
};

