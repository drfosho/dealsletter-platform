'use client';

import { ReactNode } from 'react';
import { NotificationProvider } from './NotificationSystem';
import ServiceWorkerRegistration from './ServiceWorkerRegistration';
import ErrorBoundary from './ErrorBoundary';

interface PlatformProviderProps {
  children: ReactNode;
}

export default function PlatformProvider({ children }: PlatformProviderProps) {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <ServiceWorkerRegistration />
        {children}
      </NotificationProvider>
    </ErrorBoundary>
  );
}