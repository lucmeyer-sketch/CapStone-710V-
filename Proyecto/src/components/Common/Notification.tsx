import React, { useEffect, useState } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationProps {
  message: string;
  type: NotificationType;
  duration?: number;
  onClose?: () => void;
}

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  type, 
  duration = 4000,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animación de entrada
    setTimeout(() => setIsVisible(true), 10);

    // Auto-cerrar después de la duración
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  const getStyles = () => {
    const baseStyles: React.CSSProperties = {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 10000,
      minWidth: '320px',
      maxWidth: '500px',
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',
      fontWeight: '500',
      color: 'white',
      transform: isVisible && !isExiting ? 'translateX(0)' : 'translateX(400px)',
      opacity: isVisible && !isExiting ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      backdropFilter: 'blur(10px)',
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(16, 185, 129, 0.95)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        };
      case 'error':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(239, 68, 68, 0.95)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        };
      case 'warning':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(245, 158, 11, 0.95)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        };
      case 'info':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(59, 130, 246, 0.95)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
        };
      default:
        return baseStyles;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  if (!isVisible && isExiting) return null;

  return (
    <div
      style={getStyles()}
      onClick={handleClose}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateX(0) scale(1.02)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = isVisible && !isExiting ? 'translateX(0)' : 'translateX(400px)';
      }}
    >
      <div style={{ fontSize: '24px', flexShrink: 0 }}>
        {getIcon()}
      </div>
      <div style={{ flex: 1, lineHeight: '1.5' }}>
        {message}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '20px',
          cursor: 'pointer',
          padding: '0',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          transition: 'background-color 0.2s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default Notification;

