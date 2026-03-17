// Property Image Service
// TODO: re-add property image fetch when Google Maps API is configured

export class PropertyImageService {
  // Create a placeholder image URL that shows "No Image Available"
  static getNoImagePlaceholder(): string {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect width="800" height="600" fill="%23f3f4f6"/%3E%3Cg transform="translate(400,300)"%3E%3Crect x="-80" y="-80" width="160" height="160" fill="none" stroke="%239ca3af" stroke-width="3" rx="8"/%3E%3Cpath d="M-60,-40 L-20,0 L0,-20 L20,0 L60,-40" fill="none" stroke="%239ca3af" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/%3E%3Ccircle cx="-20" cy="-30" r="8" fill="none" stroke="%239ca3af" stroke-width="3"/%3E%3Ctext y="60" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="%236b7280"%3ENo Image Available%3C/text%3E%3Ctext y="85" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="%239ca3af"%3EOff-Market Property%3C/text%3E%3C/g%3E%3C/svg%3E';
  }

  // All image methods return placeholders until Google Maps API is configured
  static getPropertyImage(_address: string, _propertyType?: string): string {
    return this.getNoImagePlaceholder();
  }

  static getPlaceholderImage(_address: string, _propertyType?: string): string {
    return this.getNoImagePlaceholder();
  }

  static getPropertyImages(_address: string, count: number = 5, _propertyType?: string): string[] {
    return Array(count).fill(this.getNoImagePlaceholder());
  }

  static getStreetViewImage(_address: string, _apiKey?: string): string | null {
    // TODO: re-add property image fetch when Google Maps API is configured
    return null;
  }

  static async fetchFromRealEstateAPI(_address: string, _propertyId?: string): Promise<string[]> {
    // TODO: re-add property image fetch when Google Maps API is configured
    return [this.getNoImagePlaceholder()];
  }
}

export default PropertyImageService;
