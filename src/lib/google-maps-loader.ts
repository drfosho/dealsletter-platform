let isLoading = false;
let isLoaded = false;

export const loadGoogleMapsAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
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
      console.error('[Google Maps] Error:', error);
      reject(error);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;
    script.id = 'google-maps-script';
    
    script.onload = async () => {
      console.log('[Google Maps] Script loaded successfully');
      console.log('[Google Maps] Google object:', !!window.google);
      console.log('[Google Maps] Maps object:', !!window.google?.maps);
      
      // Try to load the places library to verify it's available
      try {
        if (window.google?.maps) {
          const placesLibrary = await window.google.maps.importLibrary("places");
          console.log('[Google Maps] Places library loaded:', !!placesLibrary);
        }
      } catch (err) {
        console.error('[Google Maps] Failed to load places library:', err);
      }
      
      isLoading = false;
      isLoaded = true;
      resolve();
    };
    
    script.onerror = (error) => {
      console.error('[Google Maps] Script load error:', error);
      isLoading = false;
      reject(new Error('Failed to load Google Maps API'));
    };
    
    document.head.appendChild(script);
  });
};