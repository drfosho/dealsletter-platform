import { logError } from '@/utils/error-utils';

let isLoading = false;
let isLoaded = false;

export const loadGoogleMapsAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (isLoaded && window.google?.maps?.places) {
      console.log('[Google Maps] Already loaded');
      resolve();
      return;
    }

    // If currently loading, wait for it
    if (isLoading) {
      const checkInterval = setInterval(() => {
        if (isLoaded && window.google?.maps?.places) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        isLoaded = true;
        resolve();
      });
      return;
    }

    // Start loading
    isLoading = true;
    
    // Check for both possible environment variable names
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || 
                   process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    // Enhanced debug logging
    console.log('[Google Maps] Loader Debug:', {
      NEXT_PUBLIC_GOOGLE_PLACES_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ? 'exists' : 'missing',
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'exists' : 'missing',
      apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'not found',
      environment: process.env.NODE_ENV,
      windowGoogleMaps: window.google?.maps ? 'loaded' : 'not loaded',
      windowGooglePlaces: window.google?.maps?.places ? 'loaded' : 'not loaded'
    });
    
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE' || apiKey === 'YOUR_GOOGLE_PLACES_API_KEY_HERE') {
      isLoading = false;
      const errorMsg = 'Google Maps API key not configured. Please set NEXT_PUBLIC_GOOGLE_PLACES_API_KEY or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.';
      console.error('[Google Maps]', errorMsg);
      logError('Google Maps Loader - API Key Error', new Error(errorMsg));
      reject(new Error(errorMsg));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly&callback=__googleMapsCallback`;
    script.async = true;
    script.defer = true;
    script.id = 'google-maps-script';
    
    // Define a global callback for Google Maps
    (window as any).__googleMapsCallback = () => {
      console.log('[Google Maps] Callback triggered - API loaded successfully');
      console.log('[Google Maps] Available libraries:', {
        maps: !!window.google?.maps,
        places: !!window.google?.maps?.places,
        placesService: !!window.google?.maps?.places?.PlacesService,
        autocompleteService: !!window.google?.maps?.places?.AutocompleteService
      });
      isLoading = false;
      isLoaded = true;
      resolve();
      // Clean up the global callback
      delete (window as any).__googleMapsCallback;
    };
    
    script.onerror = (error) => {
      console.error('[Google Maps] Failed to load script:', error);
      logError('Google Maps Loader - Script Load Error', error);
      isLoading = false;
      reject(new Error('Failed to load Google Maps API - check console for details'));
    };
    
    console.log('[Google Maps] Appending script to document...');
    document.head.appendChild(script);
  });
};