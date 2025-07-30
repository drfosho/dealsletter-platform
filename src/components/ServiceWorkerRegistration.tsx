'use client';

import { useEffect } from 'react';
import { useNotifications } from './NotificationSystem';

export default function ServiceWorkerRegistration() {
  const { addNotification } = useNotifications();

  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then(registration => {
            console.log('ServiceWorker registration successful');

            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New update available
                    addNotification({
                      type: 'info',
                      title: 'Update Available',
                      message: 'A new version is available. Refresh to update.',
                      duration: 0, // Don't auto-dismiss
                      action: {
                        label: 'Refresh',
                        onClick: () => window.location.reload()
                      }
                    });
                  }
                });
              }
            });
          })
          .catch(error => {
            console.error('ServiceWorker registration failed:', error);
          });
      });
    }

    // Handle offline/online events
    const handleOnline = () => {
      addNotification({
        type: 'success',
        title: 'Back Online',
        message: 'Your connection has been restored.',
        duration: 3000
      });
    };

    const handleOffline = () => {
      addNotification({
        type: 'warning',
        title: 'You\'re Offline',
        message: 'Some features may be limited without an internet connection.',
        duration: 0 // Keep visible while offline
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addNotification]);

  return null;
}