'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { getAdminConfig } from '@/lib/admin-config';

interface AdminToolsProps {
  variant?: 'profile' | 'floating' | 'dropdown';
}

export default function AdminTools({ variant = 'profile' }: AdminToolsProps) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showQuickAccess, setShowQuickAccess] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const adminConfig = getAdminConfig(user?.email);
    setIsAdmin(adminConfig.isAdmin);
  }, [user]);

  // Keyboard shortcut for quick access (Cmd/Ctrl + Shift + A)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'A') {
        if (isAdmin) {
          setShowQuickAccess(!showQuickAccess);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAdmin, showQuickAccess]);

  if (!isAdmin) return null;

  // Profile Page Section
  if (variant === 'profile') {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-primary">Admin Tools</h3>
            <p className="text-sm text-muted mt-1">Access administrative features</p>
          </div>
          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <div className="space-y-3">
          <Link
            href="/admin/properties"
            className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <div>
                <p className="font-medium text-primary">Manage Properties</p>
                <p className="text-sm text-muted">Add, edit, and manage property listings</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-muted group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/auth/admin-users"
            className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <div>
                <p className="font-medium text-primary">User Management</p>
                <p className="text-sm text-muted">View and manage user accounts</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-muted group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted">
            Press <kbd className="px-1.5 py-0.5 text-xs bg-muted/50 rounded">⌘</kbd> + <kbd className="px-1.5 py-0.5 text-xs bg-muted/50 rounded">⇧</kbd> + <kbd className="px-1.5 py-0.5 text-xs bg-muted/50 rounded">A</kbd> for quick access
          </p>
        </div>
      </div>
    );
  }

  // Floating Button (Alternative)
  if (variant === 'floating') {
    return (
      <>
        <button
          onClick={() => setShowQuickAccess(!showQuickAccess)}
          className="fixed bottom-6 right-6 w-12 h-12 bg-primary text-secondary rounded-full shadow-lg hover:shadow-xl transition-all z-50 flex items-center justify-center group"
          title="Admin Tools (⌘⇧A)"
        >
          <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {showQuickAccess && (
          <div className="fixed bottom-20 right-6 bg-card border border-border rounded-lg shadow-xl p-4 z-50 min-w-[200px]">
            <h4 className="font-semibold text-primary mb-3">Admin Tools</h4>
            <div className="space-y-2">
              <Link
                href="/admin/properties"
                className="block px-3 py-2 text-sm hover:bg-muted/50 rounded-lg transition-colors"
                onClick={() => setShowQuickAccess(false)}
              >
                Manage Properties
              </Link>
              <Link
                href="/auth/admin-users"
                className="block px-3 py-2 text-sm hover:bg-muted/50 rounded-lg transition-colors"
                onClick={() => setShowQuickAccess(false)}
              >
                User Management
              </Link>
            </div>
          </div>
        )}
      </>
    );
  }

  // Dropdown Item (for header menu)
  return (
    <div className="border-t border-border mt-2 pt-2">
      <Link
        href="/admin/properties"
        className="block px-4 py-2 text-sm text-primary hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Admin Properties
        </div>
      </Link>
    </div>
  );
}