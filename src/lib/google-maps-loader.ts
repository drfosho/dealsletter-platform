// import { logError } from '@/utils/error-utils'; // DISABLED FOR DEBUGGING

// let isLoading = false; // DISABLED FOR DEBUGGING
// let isLoaded = false; // DISABLED FOR DEBUGGING

export const loadGoogleMapsAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // TEMPORARILY DISABLED TO DEBUG REACT ERROR #31
    console.log('[Google Maps] API loading DISABLED for debugging');
    reject(new Error('Google Maps API temporarily disabled for debugging'));
    return;
    
    /* DISABLED CODE BELOW
    // If already loaded, resolve immediately
    if (isLoaded && window.google?.maps) {
      console.log('[Google Maps] Already loaded');
      resolve();
      return;
    }

    // If currently loading, wait for it
    if (isLoading) {
      const checkInterval = setInterval(() => {
        if (isLoaded && window.google?.maps) {
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
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    console.log('[Google Maps] API Key present:', !!apiKey);
    console.log('[Google Maps] API Key length:', apiKey?.length);
    console.log('[Google Maps] Environment:', process.env.NODE_ENV);
    
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      isLoading = false;
      const error = new Error('Google Maps API key not configured');
      logError('Google Maps Loader - API Key Error', error);
      reject(error);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly&callback=__googleMapsCallback`;
    script.async = true;
    script.defer = true;
    script.id = 'google-maps-script';
    
    // Define a global callback for Google Maps
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__googleMapsCallback = () => {
      console.log('[Google Maps] Callback triggered');
      isLoading = false;
      isLoaded = true;
      resolve();
      // Clean up the global callback
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__googleMapsCallback;
    };
    
    script.onload = () => {
      console.log('[Google Maps] Script loaded successfully');
      console.log('[Google Maps] Google object:', !!window.google);
      console.log('[Google Maps] Maps object:', !!window.google?.maps);
      
      isLoading = false;
      isLoaded = true;
      resolve();
    };
    
    script.onerror = (error) => {
      logError('Google Maps Loader - Script Load Error', error);
      isLoading = false;
      reject(new Error('Failed to load Google Maps API'));
    };
    
    document.head.appendChild(script);
    */
  });
};