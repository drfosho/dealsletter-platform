'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface AddressSearchInputProps {
  onAddressSelect: (address: string, placeId: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function AddressSearchInput({
  onAddressSelect,
  placeholder = "Enter property address...",
  disabled = false
}: AddressSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const onAddressSelectRef = useRef(onAddressSelect);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep the ref updated with the latest callback
  useEffect(() => {
    onAddressSelectRef.current = onAddressSelect;
  }, [onAddressSelect]);

  useEffect(() => {
    const initializeAutocomplete = async () => {
      try {
        console.log('[AddressSearchInput] Initializing Google Maps...');
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();
        console.log('[AddressSearchInput] Google Maps loaded');

        if (inputRef.current && !autocompleteRef.current) {
          console.log('[AddressSearchInput] Creating Autocomplete instance...');
          const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
            types: ['address'],
            componentRestrictions: { country: 'us' },
            fields: ['formatted_address', 'place_id', 'address_components', 'geometry']
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            console.log('[AddressSearchInput] place_changed event fired:', {
              formatted_address: place.formatted_address,
              place_id: place.place_id,
              hasPlace: !!place,
              placeKeys: place ? Object.keys(place) : []
            });
            if (place.formatted_address && place.place_id) {
              console.log('[AddressSearchInput] Calling onAddressSelect with:', place.formatted_address);
              // Use the ref to always get the latest callback
              onAddressSelectRef.current(place.formatted_address, place.place_id);
            } else {
              console.warn('[AddressSearchInput] Missing formatted_address or place_id:', place);
            }
          });

          autocompleteRef.current = autocomplete;
          console.log('[AddressSearchInput] Autocomplete initialized');
        }

        setIsLoading(false);
      } catch (err) {
        console.error('[AddressSearchInput] Error loading Google Maps:', err);
        setError('Failed to load address search');
        setIsLoading(false);
      }
    };

    initializeAutocomplete();

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []); // Remove onAddressSelect dependency - use ref instead

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="w-full px-4 py-3 pr-10 text-primary bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed placeholder:text-muted"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}