'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  savePropertyToFavorites, 
  removePropertyFromFavorites,
  isPropertyFavorited 
} from '@/lib/supabase/favorites';

interface SavePropertyButtonProps {
  propertyId: number;
  className?: string;
  variant?: 'default' | 'outline';
}

export default function SavePropertyButton({ 
  propertyId, 
  className = '',
  variant = 'outline'
}: SavePropertyButtonProps) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkSaveStatus();
    }
  }, [user, propertyId]);

  const checkSaveStatus = async () => {
    if (!user) return;
    
    const { isFavorited } = await isPropertyFavorited(user.id, propertyId);
    setIsSaved(isFavorited);
  };

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // You could show a login prompt here
      alert('Please sign in to save properties');
      return;
    }

    setIsLoading(true);

    try {
      if (isSaved) {
        const { error } = await removePropertyFromFavorites(user.id, propertyId);
        if (!error) {
          setIsSaved(false);
        }
      } else {
        const { error } = await savePropertyToFavorites(user.id, propertyId);
        if (!error) {
          setIsSaved(true);
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const baseClasses = "px-6 py-3 rounded-lg transition-all duration-200 font-medium text-sm min-h-[44px] flex items-center justify-center gap-2";
  
  const variantClasses = {
    default: isSaved 
      ? "bg-green-500 text-white hover:bg-green-600" 
      : "bg-primary text-secondary hover:bg-primary/90",
    outline: isSaved
      ? "border-2 border-green-500 text-green-600 bg-green-500/10 hover:bg-green-500/20"
      : "border border-border text-primary hover:bg-muted/5"
  };

  return (
    <button
      onClick={handleToggleSave}
      disabled={isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>Saving...</span>
        </>
      ) : (
        <>
          <svg 
            className="w-4 h-4" 
            fill={isSaved ? "currentColor" : "none"} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
            />
          </svg>
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </>
      )}
    </button>
  );
}