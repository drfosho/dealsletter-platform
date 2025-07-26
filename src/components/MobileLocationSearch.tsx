'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { loadGoogleMapsAPI } from '@/lib/google-maps-loader';

interface MobileLocationSearchProps {
  onLocationSelect: (location: { 
    city: string; 
    state: string; 
    fullAddress: string;
    placeId?: string;
    coordinates?: { lat: number; lng: number };
  }) => void;
  onClose: () => void;
}

interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export default function MobileLocationSearch({ onLocationSelect, onClose }: MobileLocationSearchProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  
  const debouncedSearchTerm = useDebounce(inputValue, 300);

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Load Google Places API
  useEffect(() => {
    loadGoogleMapsAPI().catch((error) => {
      // Ensure error message is always a string
      const errorMessage = error instanceof Error ? error.message : 'Failed to load Google Maps';
      setError(errorMessage);
    });
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      if (!window.google || !window.google.maps) {
        setError('Google Maps not loaded');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Import the new Places library
        const { AutocompleteSuggestion, AutocompleteSessionToken } = 
          await window.google.maps.importLibrary("places") as google.maps.PlacesLibrary;
        
        // Create a session token for billing optimization
        const sessionToken = new AutocompleteSessionToken();
        
        // Create the request object
        const request = {
          input: debouncedSearchTerm,
          includedRegionCodes: ['us'],
          includedPrimaryTypes: ['locality', 'administrative_area_level_1'],
          sessionToken: sessionToken,
          language: 'en-US',
          region: 'us'
        };
        
        // Fetch suggestions using the new API
        const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
        
        setIsLoading(false);
        
        if (suggestions && suggestions.length > 0) {
          // Transform the new format to match our existing interface
          const formattedSuggestions = suggestions
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((suggestion: any) => suggestion.placePrediction !== null)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((suggestion: any) => {
              // Extract the prediction object
              const prediction = suggestion.placePrediction;
              
              // The API might return different property names, so let's handle both cases
              const mainText = prediction.structuredFormat?.mainText?.text || 
                             prediction.text?.text || 
                             prediction.mainText || 
                             '';
              
              const secondaryText = prediction.structuredFormat?.secondaryText?.text || 
                                   prediction.secondaryText || 
                                   '';
              
              return {
                place_id: prediction.placeId,
                description: prediction.text?.text || prediction.description || mainText,
                structured_formatting: {
                  main_text: mainText,
                  secondary_text: secondaryText
                }
              };
            });
          
          setSuggestions(formattedSuggestions);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error('[MobileLocationSearch] Exception in fetchSuggestions:', err);
        setIsLoading(false);
        // Ensure error is always a string
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while searching';
        setError(errorMessage);
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchTerm]);

  // Get place details
  const getPlaceDetails = useCallback(async (placeId: string, description: string) => {
    if (!window.google || !window.google.maps) {
      setError('Google Maps not loaded');
      return;
    }

    try {
      // Import the new Places library
      const { Place } = await window.google.maps.importLibrary("places") as google.maps.PlacesLibrary;
      
      // Create a new Place instance
      const place = new Place({
        id: placeId,
        requestedLanguage: 'en-US'
      });

      // Fetch the fields we need
      await place.fetchFields({
        fields: ['addressComponents', 'location', 'displayName']
      });

      const addressComponents = place.addressComponents || [];
      let city = '';
      let state = '';

      addressComponents.forEach((component) => {
        if (component.types.includes('locality')) {
          city = component.longText || '';
        } else if (component.types.includes('administrative_area_level_1')) {
          state = component.shortText || '';
        }
      });

      const location = {
        city: city || (typeof place.displayName === 'string' ? place.displayName : '') || '',
        state,
        fullAddress: description,
        placeId,
        coordinates: place.location ? {
          lat: place.location.lat(),
          lng: place.location.lng()
        } : undefined
      };

      onLocationSelect(location);
      onClose();
    } catch (err) {
      console.error('[MobileLocationSearch] Error fetching place details:', err);
      // Ensure error is always a string
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch place details';
      setError(errorMessage);
    }
  }, [onLocationSelect, onClose]);

  // Handle selection
  const handleSelect = useCallback((prediction: PlacePrediction) => {
    getPlaceDetails(prediction.place_id, prediction.description);
  }, [getPlaceDetails]);

  // Handle swipe down to close
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const currentTouch = e.touches[0].clientY;
    const diff = currentTouch - touchStart;
    
    if (modalRef.current && diff > 0) {
      modalRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !modalRef.current) return;
    
    const currentTouch = e.changedTouches[0].clientY;
    const diff = currentTouch - touchStart;
    
    if (diff > 100) {
      onClose();
    } else {
      modalRef.current.style.transform = 'translateY(0)';
    }
    
    setTouchStart(null);
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out"
        style={{ maxHeight: '90vh' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-muted/30 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-primary">Search Location</h3>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-muted hover:text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Search Input */}
        <div className="px-6 pb-4">
          <div className="relative">
            <svg 
              className="w-5 h-5 text-muted absolute left-4 top-1/2 transform -translate-y-1/2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
            
            <input
              ref={inputRef}
              type="search"
              enterKeyHint="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter city name..."
              className="w-full pl-12 pr-12 py-4 text-base bg-muted/10 border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30"
            />
            
            {/* Loading or Clear button */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : inputValue && (
                <button
                  onClick={() => setInputValue('')}
                  className="p-1 hover:bg-muted/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-muted hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Suggestions */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {error ? (
            <div className="px-6 py-4 text-sm text-red-500">
              {error}
            </div>
          ) : suggestions.length > 0 ? (
            <ul ref={suggestionsRef} className="pb-safe">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.place_id}
                  className="px-6 py-4 active:bg-accent/10 transition-colors"
                  onClick={() => handleSelect(suggestion)}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5">
                      <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-primary text-base">
                        {suggestion.structured_formatting.main_text}
                      </div>
                      <div className="text-sm text-muted mt-0.5">
                        {suggestion.structured_formatting.secondary_text}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : inputValue.length >= 2 && !isLoading ? (
            <div className="px-6 py-8 text-center text-muted">
              No locations found
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-muted">
              Start typing to search for a city
            </div>
          )}
        </div>
      </div>
    </div>
  );
}