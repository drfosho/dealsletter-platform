'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { loadGoogleMapsAPI } from '@/lib/google-maps-loader';
import { logError } from '@/utils/error-utils';
import dynamic from 'next/dynamic';

const MobileLocationSearch = dynamic(() => import('./MobileLocationSearch'), { 
  ssr: false,
  loading: () => null
});

interface LocationSearchProps {
  placeholder?: string;
  value?: string;
  onLocationSelect: (location: { 
    city: string; 
    state: string; 
    fullAddress: string;
    placeId?: string;
    coordinates?: { lat: number; lng: number };
  }) => void;
  onClear?: () => void;
  onSearchStart?: () => void;
  onSearchEnd?: () => void;
  className?: string;
  disabled?: boolean;
}

interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export default function LocationSearch({ 
  placeholder = "Search by city or location...",
  value = "",
  onLocationSelect, 
  onClear,
  onSearchStart,
  onSearchEnd,
  className = "",
  disabled = false
}: LocationSearchProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  
  const debouncedSearchTerm = useDebounce(inputValue, 300);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load Google Places API
  useEffect(() => {
    console.log('[LocationSearch] Attempting to load Google Maps API');
    loadGoogleMapsAPI()
      .then(() => {
        console.log('[LocationSearch] Google Maps API loaded successfully');
        setError(null);
      })
      .catch((error) => {
        console.error('[LocationSearch] Failed to load Google Maps API:', error);
        setError(error.message);
      });
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      console.log('[LocationSearch] Fetching suggestions for:', debouncedSearchTerm);
      
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.error('[LocationSearch] Google Maps API not available:', {
          google: !!window.google,
          maps: !!window.google?.maps,
          places: !!window.google?.maps?.places
        });
        setError('Google Maps not loaded');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const service = new window.google.maps.places.AutocompleteService();
        console.log('[LocationSearch] AutocompleteService created successfully');
        
        const request = {
          input: debouncedSearchTerm,
          types: ['(cities)'],
          componentRestrictions: { country: 'us' }
        };
        console.log('[LocationSearch] Making Places API request:', request);
        
        service.getPlacePredictions(
          request,
          (predictions: any[] | null, status: any) => {
            setIsLoading(false);
            console.log('[LocationSearch] Places API response:', {
              status,
              predictionsCount: predictions?.length || 0,
              statusText: status
            });
            
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              setSuggestions(predictions);
              setShowSuggestions(true);
              console.log('[LocationSearch] First prediction:', predictions[0]);
            } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              setSuggestions([]);
              setShowSuggestions(true);
            } else {
              console.error('[LocationSearch] Places API error status:', status);
              setError(`Failed to fetch suggestions: ${status}`);
              setSuggestions([]);
              
              // Log specific error types
              if (status === 'REQUEST_DENIED') {
                console.error('[LocationSearch] REQUEST_DENIED - Check if Places API is enabled in Google Cloud Console');
                console.error('[LocationSearch] Also check if the API key has the correct restrictions');
              } else if (status === 'INVALID_REQUEST') {
                console.error('[LocationSearch] INVALID_REQUEST - The request parameters are invalid');
              }
            }
          }
        );
      } catch (error) {
        console.error('[LocationSearch] Exception in fetchSuggestions:', error);
        logError('LocationSearch - Fetch Suggestions', error);
        setIsLoading(false);
        setError('An error occurred while searching');
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchTerm]);

  // Get place details
  const getPlaceDetails = useCallback(async (placeId: string, description: string) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      setError('Google Maps not loaded');
      return;
    }

    console.log('[LocationSearch] Getting place details for:', placeId);

    const service = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );

    service.getDetails(
      {
        placeId,
        fields: ['address_components', 'geometry', 'name']
      },
      (place: any, status: any) => {
        console.log('[LocationSearch] Place details response:', {
          status,
          hasPlace: !!place,
          placeId
        });

        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const addressComponents = place.address_components || [];
          let city = '';
          let state = '';

          addressComponents.forEach((component: any) => {
            if (component.types.includes('locality')) {
              city = component.long_name;
            } else if (component.types.includes('administrative_area_level_1')) {
              state = component.short_name;
            }
          });

          const location = {
            city: city || place.name || '',
            state,
            fullAddress: description,
            placeId,
            coordinates: place.geometry?.location ? {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            } : undefined
          };

          console.log('[LocationSearch] Selected location:', location);
          onLocationSelect(location);
          setInputValue(description);
          setShowSuggestions(false);
          setSuggestions([]);
        } else {
          console.error('[LocationSearch] Failed to get place details:', status);
          setError(`Failed to get location details: ${status}`);
        }
      }
    );
  }, [onLocationSelect]);

  // Handle selection
  const handleSelect = useCallback((prediction: PlacePrediction) => {
    getPlaceDetails(prediction.place_id, prediction.description);
  }, [getPlaceDetails]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  }, [showSuggestions, suggestions, selectedIndex, handleSelect]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setError(null);
    inputRef.current?.focus();
    onClear?.();
  };

  const handleMobileInputClick = () => {
    if (isMobile) {
      onSearchStart?.();
      setShowMobileSearch(true);
    }
  };

  const handleMobileClose = () => {
    setShowMobileSearch(false);
    onSearchEnd?.();
  };

  const handleMobileLocationSelect = (location: {
    city: string;
    state: string;
    fullAddress: string;
    placeId?: string;
    coordinates?: { lat: number; lng: number };
  }) => {
    onLocationSelect(location);
    setInputValue(location.fullAddress);
    setShowMobileSearch(false);
    onSearchEnd?.();
  };

  return (
    <>
      <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <svg 
          className="w-5 h-5 text-muted absolute left-3 top-1/2 transform -translate-y-1/2" 
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
          type="text"
          value={inputValue}
          onChange={(e) => !isMobile && setInputValue(e.target.value)}
          onKeyDown={!isMobile ? handleKeyDown : undefined}
          onClick={handleMobileInputClick}
          onFocus={() => {
            if (isMobile) {
              handleMobileInputClick();
            } else if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={isMobile}
          className={`w-full pl-10 pr-10 py-3 bg-card border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 disabled:opacity-50 disabled:cursor-not-allowed ${
            isMobile ? 'cursor-pointer' : ''
          }`}
        />
        
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <svg className="animate-spin h-4 w-4 text-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        
        {/* Clear button */}
        {inputValue && !isLoading && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted/10 rounded-md transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4 text-muted hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions dropdown - Desktop only */}
      {showSuggestions && !isMobile && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border/60 rounded-lg shadow-lg overflow-hidden">
          {error ? (
            <div className="px-4 py-3 text-sm text-red-500">
              {String(error)}
            </div>
          ) : suggestions.length > 0 ? (
            <ul ref={suggestionsRef} className="max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.place_id}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    index === selectedIndex 
                      ? 'bg-accent/10 text-accent' 
                      : 'hover:bg-muted/10'
                  }`}
                  onClick={() => handleSelect(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-muted mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-primary truncate">
                        {String(suggestion.structured_formatting.main_text || '')}
                      </div>
                      <div className="text-sm text-muted truncate">
                        {String(suggestion.structured_formatting.secondary_text || '')}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-muted text-center">
              No locations found
            </div>
          )}
        </div>
      )}
    </div>

      {/* Mobile Search Modal */}
      {showMobileSearch && (
        <MobileLocationSearch
          onLocationSelect={handleMobileLocationSelect}
          onClose={handleMobileClose}
        />
      )}
    </>
  );
}