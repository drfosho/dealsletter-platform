/**
 * Basic Property Data Extractor
 * Fallback when Apify is not configured
 * Creates estimated property data from URL
 */

interface BasicPropertyData {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  propertyType?: string;
  description?: string;
  yearBuilt?: number;
  listingUrl: string;
  source: string;
  dataQuality: 'estimated' | 'partial' | 'scraped';
}

export function extractBasicPropertyData(url: string): BasicPropertyData {
  console.log('[BasicExtractor] Extracting data from URL:', url);
  
  const urlLower = url.toLowerCase();
  
  // Basic data structure
  let data: BasicPropertyData = {
    listingUrl: url,
    source: 'url-extraction',
    dataQuality: 'estimated'
  };

  // Determine property platform
  if (urlLower.includes('zillow.com')) {
    data = extractZillowBasics(url, data);
  } else if (urlLower.includes('loopnet.com')) {
    data = extractLoopNetBasics(url, data);
  } else if (urlLower.includes('realtor.com')) {
    data = extractRealtorBasics(url, data);
  } else if (urlLower.includes('redfin.com')) {
    data = extractRedfinBasics(url, data);
  }

  // Don't add estimated price - let RentCast provide real data
  // Price will come from RentCast listing or AVM
  
  if (!data.bedrooms) {
    data.bedrooms = 3; // Default estimate
  }
  
  if (!data.bathrooms) {
    data.bathrooms = 2; // Default estimate
  }
  
  if (!data.squareFootage) {
    data.squareFootage = estimateSquareFootage(data);
  }
  
  if (!data.propertyType) {
    data.propertyType = 'Single Family';
  }
  
  if (!data.yearBuilt) {
    data.yearBuilt = 1990; // Default estimate
  }

  return data;
}

function extractZillowBasics(url: string, data: BasicPropertyData): BasicPropertyData {
  // Zillow URL pattern: /homedetails/address-city-state-zip/zpid
  const urlParts = url.split('/');
  const detailsIndex = urlParts.findIndex(part => part === 'homedetails');
  
  if (detailsIndex >= 0 && detailsIndex < urlParts.length - 1) {
    const addressPart = urlParts[detailsIndex + 1];
    
    // Parse address from URL slug
    const parts = addressPart.split('-');
    
    console.log('[Zillow Parser] URL parts:', parts);
    
    // Try to extract state (usually 2 letters) and zip (5 digits)
    const stateIndex = parts.findIndex(p => p.length === 2 && /^[A-Z]{2}$/i.test(p));
    const zipIndex = parts.findIndex(p => /^\d{5}$/.test(p));
    
    console.log('[Zillow Parser] Found state at index:', stateIndex, 'zip at index:', zipIndex);
    
    if (stateIndex >= 0 && zipIndex >= 0) {
      data.state = parts[stateIndex].toUpperCase();
      data.zipCode = parts[zipIndex];
      
      // City is between state and zip (could be multi-word)
      const cityParts = parts.slice(stateIndex + 1, zipIndex);
      if (cityParts.length > 0) {
        data.city = cityParts.map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
      }
      
      // Address is everything before the state
      if (stateIndex > 0) {
        const addressParts = parts.slice(0, stateIndex);
        
        // Special handling for common street types
        const streetTypes = ['st', 'ave', 'rd', 'dr', 'ln', 'way', 'ct', 'pl', 'blvd', 'pkwy', 'terrace', 'circle'];
        
        // Find where the street address ends and city begins
        let streetEndIndex = addressParts.length;
        for (let i = addressParts.length - 1; i >= 0; i--) {
          if (streetTypes.includes(addressParts[i].toLowerCase())) {
            streetEndIndex = i + 1;
            break;
          }
        }
        
        // Check if we have city words before the state
        if (streetEndIndex < addressParts.length && !data.city) {
          // The parts after street type are likely the city
          const cityFromAddress = addressParts.slice(streetEndIndex, addressParts.length);
          data.city = cityFromAddress.map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
          
          // Now just use the street parts for address
          const streetParts = addressParts.slice(0, streetEndIndex);
          data.address = streetParts.map(part => {
            if (/^\d+$/.test(part)) {
              return part; // Keep numbers as-is
            }
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
          }).join(' ');
        } else {
          // No clear city separation, use all as address
          data.address = addressParts.map(part => {
            if (/^\d+$/.test(part)) {
              return part;
            }
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
          }).join(' ');
        }
        
        console.log('[Zillow Parser] Parsed data:', {
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode
        });
      }
    } else if (stateIndex >= 0) {
      // Fallback: if we only found state but no zip
      data.state = parts[stateIndex].toUpperCase();
      
      // Assume city is 1-2 words before state
      const cityStartIndex = Math.max(0, stateIndex - 2);
      const cityParts = parts.slice(cityStartIndex, stateIndex);
      if (cityParts.length > 0) {
        data.city = cityParts.map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
      }
      
      // Address is everything before city
      if (cityStartIndex > 0) {
        const addressParts = parts.slice(0, cityStartIndex);
        data.address = addressParts.map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
      }
    }
  }
  
  // Don't try to extract price from URL - it's unreliable and causes false matches
  // Price should come from RentCast API or be entered manually
  // Removed faulty price extraction that was matching zpid and street numbers
  
  return data;
}

function extractLoopNetBasics(url: string, data: BasicPropertyData): BasicPropertyData {
  // LoopNet URL pattern varies
  const urlParts = url.split('/');
  
  // Try to extract location from URL
  const listingIndex = urlParts.findIndex(part => part === 'Listing');
  if (listingIndex >= 0) {
    // Format: /Listing/12345678/Address-City-State
    const addressParts = urlParts.slice(listingIndex + 2);
    if (addressParts.length > 0) {
      const combined = addressParts.join('-');
      const parts = combined.split('-');
      
      // Extract state (last 2-letter segment)
      const stateIndex = parts.findIndex(p => p.length === 2 && /^[A-Z]{2}$/i.test(p));
      if (stateIndex >= 0) {
        data.state = parts[stateIndex].toUpperCase();
        
        if (stateIndex > 0) {
          data.city = parts[stateIndex - 1];
        }
        
        if (stateIndex > 1) {
          data.address = parts.slice(0, stateIndex - 1).join(' ');
        }
      }
    }
  }
  
  data.propertyType = 'Commercial';
  return data;
}

function extractRealtorBasics(url: string, data: BasicPropertyData): BasicPropertyData {
  // Realtor.com URL pattern: /realestateandhomes-detail/address_city_state_zip
  const detailMatch = url.match(/realestateandhomes-detail\/([^\/]+)/);
  if (detailMatch) {
    const parts = detailMatch[1].split('_');
    
    if (parts.length >= 4) {
      data.address = parts[0].replace(/-/g, ' ');
      data.city = parts[1].replace(/-/g, ' ');
      data.state = parts[2].toUpperCase();
      data.zipCode = parts[3];
    }
  }
  
  return data;
}

function extractRedfinBasics(url: string, data: BasicPropertyData): BasicPropertyData {
  // Redfin URL pattern: /state/city/home/address
  const urlParts = url.split('/');
  const homeIndex = urlParts.findIndex(part => part === 'home');
  
  if (homeIndex >= 2) {
    // State is usually 2 positions before 'home'
    data.state = urlParts[homeIndex - 2]?.toUpperCase();
    data.city = urlParts[homeIndex - 1]?.replace(/-/g, ' ');
    
    if (homeIndex < urlParts.length - 1) {
      data.address = urlParts[homeIndex + 1].replace(/-/g, ' ');
    }
  }
  
  return data;
}


function estimateSquareFootage(data: BasicPropertyData): number {
  // Estimate based on bedrooms
  const bedroomSizes: Record<number, number> = {
    1: 800,
    2: 1200,
    3: 1800,
    4: 2400,
    5: 3000
  };
  
  return bedroomSizes[data.bedrooms || 3] || 1800;
}