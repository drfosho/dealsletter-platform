'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newNotification = { ...notification, id };
    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration (default 5 seconds)
    const duration = notification.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

function NotificationItem({ 
  notification, 
  onClose 
}: { 
  notification: Notification; 
  onClose: () => void;
}) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStyles = () => {
    const base = 'bg-card border rounded-lg shadow-lg p-4 transition-all duration-300';
    const typeStyles = {
      success: 'border-green-200',
      error: 'border-red-200',
      warning: 'border-yellow-200',
      info: 'border-blue-200'
    };
    
    return `${base} ${typeStyles[notification.type]} ${
      isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
    }`;
  };

  return (
    <div className={getStyles()}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-primary">{notification.title}</h4>
          {notification.message && (
            <p className="text-sm text-muted mt-1">{notification.message}</p>
          )}
          {notification.action && (
            <button
              onClick={() => {
                notification.action!.onClick();
                handleClose();
              }}
              className="text-sm text-primary hover:underline mt-2"
            >
              {notification.action.label}
            </button>
          )}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 hover:bg-muted/20 rounded transition-colors"
        >
          <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Hook for common notifications
export function useAnalysisNotifications() {
  const { addNotification } = useNotifications();
  const [analysisProgress, setAnalysisProgress] = useState<string | null>(null);

  useEffect(() => {
    // Listen for analysis events
    const handleAnalysisComplete = (event: CustomEvent) => {
      addNotification({
        type: 'success',
        title: 'Analysis Complete!',
        message: `Your property analysis for ${event.detail.address} is ready.`,
        action: {
          label: 'View Results',
          onClick: () => window.location.href = `/analysis/results/${event.detail.id}`
        }
      });
    };

    const handleUsageLimitWarning = () => {
      addNotification({
        type: 'warning',
        title: 'Approaching Usage Limit',
        message: 'You have 2 analyses remaining this month.',
        action: {
          label: 'Upgrade Plan',
          onClick: () => window.location.href = '/pricing'
        }
      });
    };

    window.addEventListener('analysis-complete', handleAnalysisComplete as EventListener);
    window.addEventListener('usage-limit-warning', handleUsageLimitWarning);

    return () => {
      window.removeEventListener('analysis-complete', handleAnalysisComplete as EventListener);
      window.removeEventListener('usage-limit-warning', handleUsageLimitWarning);
    };
  }, [addNotification]);

  return { analysisProgress, setAnalysisProgress };
}