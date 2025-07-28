// Shared properties storage (replace with database in production)
// NOTE: This is an in-memory array that will be reset on server restart
// In production, this should be replaced with a database
export const properties: any[] = [
  // Add a test property to verify the system is working
  {
    id: 'test-property-1',
    title: 'Test Property - 456 Debug Lane',
    address: '456 Debug Lane',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    propertyType: 'Single Family',
    price: 750000,
    downPayment: 187500,
    downPaymentPercent: 25,
    monthlyRent: 4500,
    capRate: 5.8,
    monthlyCashFlow: 800,
    totalROI: 15.2,
    investmentStrategy: 'Buy & Hold',
    confidence: 'high',
    riskLevel: 'low',
    daysOnMarket: 3,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1800,
    yearBuilt: 1995,
    features: ['Updated Kitchen', 'New Roof', 'Central AC'],
    isDraft: false,
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export async function getPublishedProperties() {
  // Return only non-draft properties
  console.log('=== getPublishedProperties called ===');
  console.log('Total properties:', properties.length);
  console.log('Properties:', properties.map(p => ({ id: p.id, title: p.title, isDraft: p.isDraft })));
  const published = properties.filter(p => !p.isDraft);
  console.log('Published properties:', published.length);
  return published;
}

export async function getAllProperties() {
  return properties;
}

export async function getPropertyById(id: string) {
  return properties.find(p => p.id === id);
}

export async function createProperty(property: any) {
  console.log('=== createProperty called ===');
  console.log('Input property:', property);
  console.log('Input isDraft:', property.isDraft);
  
  const newProperty = {
    ...property,
    id: property.id || Date.now().toString(),
    createdAt: property.createdAt || new Date(),
    updatedAt: property.updatedAt || new Date()
  };
  
  console.log('New property to save:', newProperty);
  console.log('New property isDraft:', newProperty.isDraft);
  
  properties.push(newProperty);
  console.log('Total properties after push:', properties.length);
  console.log('All properties:', properties.map(p => ({ id: p.id, title: p.title, isDraft: p.isDraft })));
  
  return newProperty;
}

export async function updateProperty(id: string, updates: any) {
  const index = properties.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  properties[index] = {
    ...properties[index],
    ...updates,
    updatedAt: new Date()
  };
  
  return properties[index];
}

export async function deleteProperty(id: string) {
  const index = properties.findIndex(p => p.id === id);
  if (index === -1) return false;
  
  properties.splice(index, 1);
  return true;
}