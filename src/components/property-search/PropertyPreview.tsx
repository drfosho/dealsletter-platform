import PropertyImageService from '@/services/property-images';

interface PropertyData {
  address: string;
  property: {
    bedrooms: number;
    bathrooms: number;
    squareFootage: number;
    propertyType: string;
    yearBuilt: number;
    lotSize?: number;
  };
  rental?: {
    rentEstimate?: number;
    rent?: number;
    rentRangeLow: number;
    rentRangeHigh: number;
  };
  comparables?: {
    value?: number;
    price?: number;
    priceRangeLow?: number;
    priceRangeHigh?: number;
    valueRangeLow?: number;
    valueRangeHigh?: number;
  };
}

interface PropertyPreviewProps {
  data: PropertyData;
}

export default function PropertyPreview({ data }: PropertyPreviewProps) {
  console.log('[PropertyPreview] Received data:', data);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Handle different possible data structures
  const property = data.property || {};
  const rental = (data.rental || {}) as any;
  const comparables = (data.comparables || {}) as any;
  const listing = (data as any).listing || {};
  
  // Fix: Use correct field names from RentCast API
  const listingPrice = listing.price || listing.listPrice || listing.askingPrice || 0;
  const estimatedValue = comparables.value || comparables.price || 0;
  const valueLow = comparables.valueRangeLow || comparables.priceRangeLow || 0;
  const valueHigh = comparables.valueRangeHigh || comparables.priceRangeHigh || 0;
  const rentEstimate = rental.rent || rental.rentEstimate || 0;
  const isOnMarket = listingPrice > 0;
  
  console.log('[PropertyPreview] Parsed values:', {
    isOnMarket,
    listingPrice,
    estimatedValue,
    rentEstimate,
    property: {
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      squareFootage: property.squareFootage,
      images: property.images
    }
  });

  return (
    <div className="bg-card rounded-lg border border-border p-6 mt-6">
      <h3 className="text-lg font-semibold text-primary mb-4">Property Details</h3>
      
      {/* Property Images */}
      {property.images && property.images.length > 0 && property.images[0] !== PropertyImageService.getNoImagePlaceholder() && (
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-2">
            {property.images.slice(0, 4).map((image: string, index: number) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <img 
                  src={image} 
                  alt={`Property view ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
          {property.images.length > 4 && (
            <p className="text-xs text-muted mt-2">+{property.images.length - 4} more images</p>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-muted">Address</p>
          <p className="font-medium text-primary">{data.address}</p>
        </div>
        <div>
          <p className="text-sm text-muted">Property Type</p>
          <p className="font-medium text-primary">{property.propertyType || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-muted">Bedrooms / Bathrooms</p>
          <p className="font-medium text-primary">
            {property.bedrooms || 0} beds / {property.bathrooms || 0} baths
          </p>
        </div>
        <div>
          <p className="text-sm text-muted">Square Footage</p>
          <p className="font-medium text-primary">
            {property.squareFootage ? formatNumber(property.squareFootage) : 'N/A'} sq ft
          </p>
        </div>
        <div>
          <p className="text-sm text-muted">Year Built</p>
          <p className="font-medium text-primary">{property.yearBuilt || 'N/A'}</p>
        </div>
        {property.lotSize && (
          <div>
            <p className="text-sm text-muted">Lot Size</p>
            <p className="font-medium text-primary">
              {formatNumber(property.lotSize)} sq ft
            </p>
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`${isOnMarket ? 'bg-green-500/10' : 'bg-primary/10'} rounded-lg p-4`}>
            <p className={`text-sm font-medium ${isOnMarket ? 'text-green-700' : 'text-primary'} mb-1`}>
              {isOnMarket ? '🏷️ List Price' : 'Estimated Value'}
            </p>
            <p className={`text-2xl font-bold ${isOnMarket ? 'text-green-700' : 'text-primary'}`}>
              {isOnMarket ? formatCurrency(listingPrice) : (estimatedValue > 0 ? formatCurrency(estimatedValue) : 'N/A')}
            </p>
            {isOnMarket && estimatedValue > 0 && (
              <p className="text-sm text-muted mt-1">
                AVM: {formatCurrency(estimatedValue)}
              </p>
            )}
            {!isOnMarket && valueLow > 0 && valueHigh > 0 && (
              <p className="text-sm text-primary/80 mt-1">
                Range: {formatCurrency(valueLow)} - {formatCurrency(valueHigh)}
              </p>
            )}
          </div>
          
          <div className="bg-accent/10 rounded-lg p-4">
            <p className="text-sm font-medium text-accent mb-1">Estimated Rent</p>
            <p className="text-2xl font-bold text-accent">
              {rentEstimate > 0 ? `${formatCurrency(rentEstimate)}/mo` : 'N/A'}
            </p>
            {rental.rentRangeLow > 0 && rental.rentRangeHigh > 0 && (
              <p className="text-sm text-accent/80 mt-1">
                Range: {formatCurrency(rental.rentRangeLow)} - {formatCurrency(rental.rentRangeHigh)}
              </p>
            )}
          </div>
        </div>
        
        {/* Additional metrics */}
        {estimatedValue > 0 && property.squareFootage > 0 && (
          <div className="mt-4 bg-muted/10 rounded-lg p-4">
            <p className="text-sm font-medium text-muted mb-1">Price per Sq Ft</p>
            <p className="text-xl font-bold text-primary">
              {formatCurrency(Math.round(estimatedValue / property.squareFootage))}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}