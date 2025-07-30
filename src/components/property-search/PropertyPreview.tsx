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
    rent: number;
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

  const estimatedValue = data.comparables?.value || data.comparables?.price || 0;
  const valueLow = data.comparables?.valueRangeLow || data.comparables?.priceRangeLow || 0;
  const valueHigh = data.comparables?.valueRangeHigh || data.comparables?.priceRangeHigh || 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">Address</p>
          <p className="font-medium text-gray-900">{data.address}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Property Type</p>
          <p className="font-medium text-gray-900">{data.property.propertyType}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Bedrooms / Bathrooms</p>
          <p className="font-medium text-gray-900">
            {data.property.bedrooms} beds / {data.property.bathrooms} baths
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Square Footage</p>
          <p className="font-medium text-gray-900">
            {formatNumber(data.property.squareFootage)} sq ft
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Year Built</p>
          <p className="font-medium text-gray-900">{data.property.yearBuilt}</p>
        </div>
        {data.property.lotSize && (
          <div>
            <p className="text-sm text-gray-500">Lot Size</p>
            <p className="font-medium text-gray-900">
              {formatNumber(data.property.lotSize)} sq ft
            </p>
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {estimatedValue > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-1">Estimated Value</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(estimatedValue)}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Range: {formatCurrency(valueLow)} - {formatCurrency(valueHigh)}
              </p>
            </div>
          )}
          
          {data.rental && (
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm font-medium text-green-900 mb-1">Estimated Rent</p>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(data.rental.rent)}/mo
              </p>
              <p className="text-sm text-green-700 mt-1">
                Range: {formatCurrency(data.rental.rentRangeLow)} - {formatCurrency(data.rental.rentRangeHigh)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}