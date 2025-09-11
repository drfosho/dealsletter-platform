// Enhanced Property Photo Service
// Handles fetching property photos from multiple sources with smart fallbacks

interface PhotoSource {
  url: string;
  source: 'rentcast' | 'streetview' | 'placeholder' | 'stock';
  confidence: 'high' | 'medium' | 'low';
}

// Property type-specific stock photo URLs (using Unsplash for high-quality images)
const PROPERTY_TYPE_PHOTOS = {
  'Single Family': [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop', // Beautiful house
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop', // Modern home
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop', // Classic home
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop', // Luxury home
    'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&h=600&fit=crop'  // Suburban home
  ],
  'Multifamily': [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop', // Apartment building
    'https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?w=800&h=600&fit=crop', // Modern apartments
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop', // Apartment complex
    'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&h=600&fit=crop', // Urban apartments
    'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=600&fit=crop'  // Residential complex
  ],
  'Condo': [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop', // Modern condo
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop', // Condo interior
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop', // Condo building
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop', // Living space
    'https://images.unsplash.com/photo-1560448075-cbc16bb4af8e?w=800&h=600&fit=crop'  // Condo exterior
  ],
  'Townhouse': [
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop', // Townhouse row
    'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&h=600&fit=crop', // Modern townhouse
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop', // Traditional townhouse
    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop', // Urban townhouse
    'https://images.unsplash.com/photo-1597047084897-51e81819a499?w=800&h=600&fit=crop'  // Townhouse facade
  ],
  'Mobile Home': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop', // Mobile home park
    'https://images.unsplash.com/photo-1550963295-019d8a8a61c5?w=800&h=600&fit=crop', // Manufactured home
    'https://images.unsplash.com/photo-1559767949-0faa5c7e9992?w=800&h=600&fit=crop', // Mobile home community
  ],
  'Land': [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop', // Open land
    'https://images.unsplash.com/photo-1440428099904-c6d459a7e7b5?w=800&h=600&fit=crop', // Forest land
    'https://images.unsplash.com/photo-1444927714506-8492d94b4e3d?w=800&h=600&fit=crop', // Rural land
  ],
  'Commercial': [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop', // Office building
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&h=600&fit=crop', // Commercial space
    'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800&h=600&fit=crop', // Retail space
  ]
};

// Cache for fetched photos
const photoCache = new Map<string, PhotoSource[]>();
const PHOTO_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export class PropertyPhotoService {
  // Get a deterministic stock photo based on property address (for consistency)
  private static getStockPhotoIndex(address: string, maxPhotos: number): number {
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
      hash = ((hash << 5) - hash) + address.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % maxPhotos;
  }

  // Get property type category for photo selection
  private static getPropertyTypeCategory(propertyType?: string): string {
    if (!propertyType) return 'Single Family';
    
    const type = propertyType.toLowerCase();
    
    if (type.includes('multi') || type.includes('plex') || type.includes('apartment')) {
      return 'Multifamily';
    }
    if (type.includes('condo')) {
      return 'Condo';
    }
    if (type.includes('town')) {
      return 'Townhouse';
    }
    if (type.includes('mobile') || type.includes('manufactured')) {
      return 'Mobile Home';
    }
    if (type.includes('land') || type.includes('lot')) {
      return 'Land';
    }
    if (type.includes('commercial') || type.includes('office') || type.includes('retail')) {
      return 'Commercial';
    }
    
    return 'Single Family';
  }

  // Get fallback stock photos based on property type
  private static getStockPhotos(propertyType: string, address: string, count: number = 5): PhotoSource[] {
    const category = this.getPropertyTypeCategory(propertyType);
    const stockPhotos = PROPERTY_TYPE_PHOTOS[category as keyof typeof PROPERTY_TYPE_PHOTOS] || PROPERTY_TYPE_PHOTOS['Single Family'];
    
    const photos: PhotoSource[] = [];
    const startIndex = this.getStockPhotoIndex(address, stockPhotos.length);
    
    for (let i = 0; i < Math.min(count, stockPhotos.length); i++) {
      const photoIndex = (startIndex + i) % stockPhotos.length;
      photos.push({
        url: stockPhotos[photoIndex],
        source: 'stock',
        confidence: 'low'
      });
    }
    
    return photos;
  }

  // Get Google Street View images
  private static getStreetViewPhotos(address: string, count: number = 3): PhotoSource[] {
    const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!googleMapsKey || !address) return [];
    
    // Check if address has a street number (more reliable for Street View)
    const hasStreetNumber = /^\d+\s+/.test(address.trim());
    if (!hasStreetNumber) return [];
    
    const photos: PhotoSource[] = [];
    const encodedAddress = encodeURIComponent(address);
    
    // Main view
    photos.push({
      url: `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${encodedAddress}&key=${googleMapsKey}`,
      source: 'streetview',
      confidence: 'medium'
    });
    
    // Additional angles
    if (count > 1) {
      const angles = [90, 270];
      for (let i = 0; i < Math.min(count - 1, angles.length); i++) {
        photos.push({
          url: `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${encodedAddress}&heading=${angles[i]}&key=${googleMapsKey}`,
          source: 'streetview',
          confidence: 'medium'
        });
      }
    }
    
    return photos;
  }

  // Main method to get property photos with fallback strategy
  static async getPropertyPhotos(
    address: string,
    propertyType?: string,
    rentcastPhotos?: string[],
    count: number = 5
  ): Promise<string[]> {
    const cacheKey = `${address}-${count}`;
    
    // Check cache first
    const cached = photoCache.get(cacheKey);
    if (cached && cached.length > 0) {
      return cached.map(p => p.url);
    }
    
    const allPhotos: PhotoSource[] = [];
    
    // 1. First priority: RentCast photos if available
    if (rentcastPhotos && rentcastPhotos.length > 0) {
      rentcastPhotos.forEach(url => {
        allPhotos.push({
          url,
          source: 'rentcast',
          confidence: 'high'
        });
      });
    }
    
    // 2. Second priority: Google Street View
    if (allPhotos.length < count) {
      const streetViewPhotos = this.getStreetViewPhotos(address, count - allPhotos.length);
      allPhotos.push(...streetViewPhotos);
    }
    
    // 3. Third priority: Stock photos based on property type
    if (allPhotos.length < count) {
      const stockPhotos = this.getStockPhotos(
        propertyType || 'Single Family',
        address,
        count - allPhotos.length
      );
      allPhotos.push(...stockPhotos);
    }
    
    // Cache the results
    photoCache.set(cacheKey, allPhotos);
    
    // Clean old cache entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean
      this.cleanCache();
    }
    
    return allPhotos.map(p => p.url);
  }

  // Get a single primary photo
  static async getPrimaryPhoto(
    address: string,
    propertyType?: string,
    rentcastPhotos?: string[]
  ): Promise<string> {
    const photos = await this.getPropertyPhotos(address, propertyType, rentcastPhotos, 1);
    return photos[0] || this.getDefaultPlaceholder();
  }

  // Clean old cache entries
  private static cleanCache() {
    const now = Date.now();
    const oldEntries: string[] = [];
    
    photoCache.forEach((value, key) => {
      // Simple TTL check - in production, store timestamp with cache entry
      if (photoCache.size > 1000) {
        oldEntries.push(key);
      }
    });
    
    // Remove oldest half if cache is too large
    if (oldEntries.length > 500) {
      oldEntries.slice(0, oldEntries.length / 2).forEach(key => {
        photoCache.delete(key);
      });
    }
  }

  // Get default placeholder
  static getDefaultPlaceholder(): string {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect width="800" height="600" fill="%23f3f4f6"/%3E%3Cg transform="translate(400,300)"%3E%3Crect x="-80" y="-80" width="160" height="160" fill="none" stroke="%239ca3af" stroke-width="3" rx="8"/%3E%3Cpath d="M-60,-40 L-20,0 L0,-20 L20,0 L60,-40" fill="none" stroke="%239ca3af" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/%3E%3Ccircle cx="-20" cy="-30" r="8" fill="none" stroke="%239ca3af" stroke-width="3"/%3E%3Ctext y="60" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="%236b7280"%3ENo Image Available%3C/text%3E%3C/g%3E%3C/svg%3E';
  }

  // Batch fetch photos for multiple properties
  static async batchFetchPhotos(
    properties: Array<{
      address: string;
      propertyType?: string;
      rentcastPhotos?: string[];
    }>
  ): Promise<Map<string, string[]>> {
    const results = new Map<string, string[]>();
    
    // Process in parallel with limit
    const batchSize = 5;
    for (let i = 0; i < properties.length; i += batchSize) {
      const batch = properties.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(prop =>
          this.getPropertyPhotos(prop.address, prop.propertyType, prop.rentcastPhotos)
        )
      );
      
      batch.forEach((prop, index) => {
        results.set(prop.address, batchResults[index]);
      });
    }
    
    return results;
  }
}

export default PropertyPhotoService;