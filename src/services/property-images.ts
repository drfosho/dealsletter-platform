// Property Image Service
// This service handles fetching property images from various sources

export class PropertyImageService {
  // Create a placeholder image URL that shows "No Image Available"
  static getNoImagePlaceholder(): string {
    // Using a data URL for a simple SVG placeholder
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect width="800" height="600" fill="%23f3f4f6"/%3E%3Cg transform="translate(400,300)"%3E%3Crect x="-80" y="-80" width="160" height="160" fill="none" stroke="%239ca3af" stroke-width="3" rx="8"/%3E%3Cpath d="M-60,-40 L-20,0 L0,-20 L20,0 L60,-40" fill="none" stroke="%239ca3af" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/%3E%3Ccircle cx="-20" cy="-30" r="8" fill="none" stroke="%239ca3af" stroke-width="3"/%3E%3Ctext y="60" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="%236b7280"%3ENo Image Available%3C/text%3E%3Ctext y="85" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="%239ca3af"%3EOff-Market Property%3C/text%3E%3C/g%3E%3C/svg%3E';
  }
  
  // Get the best available image for a property
  static getPropertyImage(address: string, _propertyType?: string): string {
    console.log('[PropertyImageService] Getting image for address:', address);
    
    // For off-market properties, we should NOT try to fetch random images
    // Only use Google Street View if we have high confidence it's the right property
    const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    console.log('[PropertyImageService] Google Maps API Key available:', !!googleMapsKey);
    
    if (googleMapsKey && address && address.length > 10) {
      // Only use Street View for complete addresses with street number
      const hasStreetNumber = /^\d+\s+/.test(address.trim());
      console.log('[PropertyImageService] Has street number:', hasStreetNumber);
      
      if (hasStreetNumber) {
        const streetViewUrl = this.getStreetViewImage(address, googleMapsKey);
        console.log('[PropertyImageService] Generated Street View URL:', streetViewUrl);
        if (streetViewUrl) return streetViewUrl;
      }
    }
    
    // For off-market properties, always use the placeholder
    // Don't use random stock photos as they're misleading
    console.log('[PropertyImageService] Using placeholder image');
    return this.getNoImagePlaceholder();
  }
  
  // Generate a placeholder image URL
  static getPlaceholderImage(_address: string, _propertyType?: string): string {
    return this.getNoImagePlaceholder();
  }
  
  // Get multiple images for a property
  static getPropertyImages(address: string, count: number = 5, _propertyType?: string): string[] {
    const images: string[] = [];
    
    // First image is always the main property image
    images.push(this.getPropertyImage(address));
    
    // Only try additional street view angles if we have a valid street address with number
    const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const hasStreetNumber = /^\d+\s+/.test(address.trim());
    
    if (googleMapsKey && hasStreetNumber && count > 1) {
      // Different angles for street view
      const angles = [90, 180, 270];
      const encodedAddress = encodeURIComponent(address);
      
      for (let i = 0; i < Math.min(count - 1, angles.length); i++) {
        const heading = angles[i];
        images.push(`https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${encodedAddress}&heading=${heading}&key=${googleMapsKey}`);
      }
    }
    
    // Fill remaining slots with the same placeholder
    // Don't use random images as they're misleading
    while (images.length < count) {
      images.push(this.getNoImagePlaceholder());
    }
    
    return images;
  }
  
  // Get a street view image using Google Street View API (requires API key)
  static getStreetViewImage(address: string, apiKey?: string): string | null {
    if (!apiKey) {
      return null;
    }
    
    const encodedAddress = encodeURIComponent(address);
    return `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${encodedAddress}&key=${apiKey}`;
  }
  
  // Future integration point for real estate image APIs
  static async fetchFromRealEstateAPI(address: string, _propertyId?: string): Promise<string[]> {
    // Placeholder for future implementation
    // Could integrate with:
    // - RentSpree API
    // - Rentals.com API
    // - Local MLS APIs
    // - Real estate data providers
    
    // For now, return placeholder images
    return this.getPropertyImages(address);
  }
}

export default PropertyImageService;