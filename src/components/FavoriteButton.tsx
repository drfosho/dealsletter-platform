'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  savePropertyToFavorites, 
  removePropertyFromFavorites,
  isPropertyFavorited 
} from '@/lib/supabase/favorites';

interface FavoriteButtonProps {
  propertyId: number;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

export default function FavoriteButton({ 
  propertyId, 
  className = '', 
  size = 'medium',
  showTooltip = true 
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Icon sizes
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [user, propertyId]);

  const checkFavoriteStatus = async () => {
    if (!user) return;
    
    const { isFavorited } = await isPropertyFavorited(user.id, propertyId);
    setIsFavorited(isFavorited);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorited) {
        const { error } = await removePropertyFromFavorites(user.id, propertyId);
        if (!error) {
          setIsFavorited(false);
        }
      } else {
        const { error } = await savePropertyToFavorites(user.id, propertyId);
        if (!error) {
          setIsFavorited(true);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggleFavorite}
        disabled={isLoading}
        className={`relative p-2 rounded-full transition-all duration-200 ${
          isFavorited 
            ? 'bg-red-500/20 hover:bg-red-500/30' 
            : 'bg-white/80 hover:bg-white/90 backdrop-blur-sm'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg 
          className={`${sizeClasses[size]} transition-all duration-200 ${
            isFavorited ? 'text-red-500 scale-110' : 'text-gray-600 hover:text-red-500'
          }`} 
          fill={isFavorited ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
        
        {/* Loading spinner overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-accent rounded-full animate-spin"></div>
          </div>
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && !showLoginPrompt && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
            {isFavorited ? 'Remove from favorites' : 'Save to favorites'}
          </div>
        </div>
      )}

      {/* Login prompt */}
      {showLoginPrompt && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 animate-fade-in">
          <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap">
            Sign in to save favorites
          </div>
        </div>
      )}
    </div>
  );
}