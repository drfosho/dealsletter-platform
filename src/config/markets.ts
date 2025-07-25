export interface Market {
  id: string;
  name: string;
  state: string;
  coordinates: [number, number]; // [lat, lng]
  cities: string[];
}

export const SUPPORTED_MARKETS: Market[] = [
  {
    id: 'san-diego',
    name: 'San Diego',
    state: 'CA',
    coordinates: [32.7157, -117.1611],
    cities: ['San Diego', 'La Jolla', 'Chula Vista', 'Carlsbad', 'Oceanside']
  },
  {
    id: 'bay-area',
    name: 'Bay Area',
    state: 'CA',
    coordinates: [37.7749, -122.4194],
    cities: ['San Francisco', 'Oakland', 'San Jose', 'Berkeley', 'Palo Alto', 'San Mateo', 'Fremont', 'Lafayette', 'San Leandro']
  },
  {
    id: 'los-angeles',
    name: 'Los Angeles',
    state: 'CA',
    coordinates: [34.0522, -118.2437],
    cities: ['Los Angeles', 'Santa Monica', 'Beverly Hills', 'Pasadena', 'Long Beach', 'Glendale']
  },
  {
    id: 'tampa',
    name: 'Tampa',
    state: 'FL',
    coordinates: [27.9506, -82.4572],
    cities: ['Tampa', 'St. Petersburg', 'Clearwater', 'Brandon', 'Lakeland']
  },
  {
    id: 'kansas-city',
    name: 'Kansas City',
    state: 'MO',
    coordinates: [39.0997, -94.5786],
    cities: ['Kansas City', 'Independence', 'Lee\'s Summit', 'Blue Springs']
  }
];

export function isLocationSupported(city: string, state: string): Market | null {
  const normalizedCity = city.toLowerCase().trim();
  const normalizedState = state.toLowerCase().trim();
  
  return SUPPORTED_MARKETS.find(market => {
    // Check if state matches
    if (market.state.toLowerCase() !== normalizedState) return false;
    
    // Check if city is in the market's cities list
    return market.cities.some(marketCity => 
      marketCity.toLowerCase() === normalizedCity
    );
  }) || null;
}

export function findNearestMarket(coordinates: { lat: number; lng: number }): Market | null {
  let nearestMarket: Market | null = null;
  let minDistance = Infinity;
  
  SUPPORTED_MARKETS.forEach(market => {
    const [marketLat, marketLng] = market.coordinates;
    // Simple distance calculation (not exact but good enough for this use case)
    const distance = Math.sqrt(
      Math.pow(marketLat - coordinates.lat, 2) + 
      Math.pow(marketLng - coordinates.lng, 2)
    );
    
    if (distance < minDistance && distance < 2) { // Within ~2 degrees
      minDistance = distance;
      nearestMarket = market;
    }
  });
  
  return nearestMarket;
}