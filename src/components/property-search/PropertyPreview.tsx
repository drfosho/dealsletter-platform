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
  const rental = data.rental || {};
  const comparables = data.comparables || {};
  
  // Fix: Use correct field names from RentCast API
  const estimatedValue = comparables.value || comparables.price || 0;
  const valueLow = comparables.valueRangeLow || comparables.priceRangeLow || 0;
  const valueHigh = comparables.valueRangeHigh || comparables.priceRangeHigh || 0;
  const rentEstimate = rental.rent || rental.rentEstimate || 0;
  
  console.log('[PropertyPreview] Parsed values:', {
    estimatedValue,
    rentEstimate,
    property: {
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      squareFootage: property.squareFootage
    }
  });

  return (
    <div className="bg-card rounded-lg border border-border p-6 mt-6">
      <h3 className="text-lg font-semibold text-primary mb-4">Property Details</h3>
      
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
          <div className="bg-primary/10 rounded-lg p-4">
            <p className="text-sm font-medium text-primary mb-1">Estimated Value</p>
            <p className="text-2xl font-bold text-primary">
              {estimatedValue > 0 ? formatCurrency(estimatedValue) : 'N/A'}
            </p>
            {valueLow > 0 && valueHigh > 0 && (
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