import { loadProperties, saveProperties } from './storage';

// Shared properties storage with file persistence
// NOTE: This uses file storage in development, replace with database in production
let properties: Record<string, unknown>[] = [];
let isInitialized = false;

// Initialize properties from storage
async function initializeProperties() {
  if (!isInitialized) {
    properties = await loadProperties();
    isInitialized = true;
    console.log('Properties initialized with', properties.length, 'items');
  }
}

export async function getPublishedProperties() {
  await initializeProperties();
  
  // Return only non-draft properties
  console.log('=== getPublishedProperties called ===');
  console.log('Total properties:', properties.length);
  console.log('Properties:', properties.map(p => ({ 
    id: p.id, 
    title: p.title, 
    isDraft: 'isDraft' in p ? p.isDraft : undefined,
    status: 'status' in p ? p.status : undefined 
  })));
  
  // Check each property's draft status
  properties.forEach((p, index) => {
    console.log(`Property ${index}:`, {
      id: p.id,
      isDraft: p.isDraft,
      hasDraftKey: 'isDraft' in p,
      willBeFiltered: 'isDraft' in p ? p.isDraft : false
    });
  });
  
  const published = properties.filter(p => !('isDraft' in p ? p.isDraft : false));
  console.log('Published properties after filter:', published.length);
  console.log('Published IDs:', published.map(p => p.id));
  return published;
}

export async function getAllProperties() {
  await initializeProperties();
  return properties;
}

export async function getPropertyById(id: string) {
  await initializeProperties();
  return properties.find(p => p.id === id);
}

export async function createProperty(property: Record<string, unknown>) {
  await initializeProperties();
  
  console.log('=== createProperty called ===');
  console.log('Input property:', property);
  console.log('Input isDraft:', 'isDraft' in property ? property.isDraft : undefined);
  console.log('Properties array before push:', properties.length);
  
  // Generate a unique ID - check if provided ID already exists
  let propertyId = property.id || Date.now().toString();
  
  // If ID already exists, generate a new one
  while (properties.some(p => String(p.id) === String(propertyId))) {
    console.log(`ID ${propertyId} already exists, generating new one...`);
    propertyId = Date.now() + Math.floor(Math.random() * 10000);
  }
  
  const newProperty = {
    ...property,
    id: propertyId,
    createdAt: property.createdAt || new Date(),
    updatedAt: property.updatedAt || new Date()
  };
  
  console.log('New property to save:', newProperty);
  console.log('New property isDraft:', 'isDraft' in newProperty ? newProperty.isDraft : undefined);
  console.log('New property status:', 'status' in newProperty ? newProperty.status : undefined);
  console.log('Has strategicOverview:', 'strategicOverview' in newProperty ? !!newProperty.strategicOverview : false);
  console.log('Has thirtyYearProjections:', 'thirtyYearProjections' in newProperty ? !!newProperty.thirtyYearProjections : false);
  console.log('Has locationAnalysis:', 'locationAnalysis' in newProperty ? !!newProperty.locationAnalysis : false);
  console.log('Has financingScenarios:', 'financingScenarios' in newProperty && Array.isArray((newProperty as Record<string, unknown>).financingScenarios) ? ((newProperty as Record<string, unknown>).financingScenarios as unknown[]).length : 0);
  
  properties.push(newProperty);
  console.log('Total properties after push:', properties.length);
  console.log('All properties:', properties.map(p => ({ 
    id: p.id, 
    title: p.title, 
    isDraft: 'isDraft' in p ? p.isDraft : undefined,
    status: 'status' in p ? p.status : undefined
  })));
  
  // Verify the property was actually added
  const addedProperty = properties.find(p => p.id === newProperty.id);
  console.log('Verified property was added:', !!addedProperty);
  
  // Save to persistent storage
  await saveProperties(properties);
  console.log('Properties saved to file');
  
  return newProperty;
}

export async function updateProperty(id: string | number, updates: Record<string, unknown>) {
  await initializeProperties();
  
  const index = properties.findIndex(p => String(p.id) === String(id));
  if (index === -1) return null;
  
  properties[index] = {
    ...properties[index],
    ...updates,
    id: properties[index].id, // Preserve original ID
    updatedAt: new Date()
  };
  
  // Save to persistent storage
  await saveProperties(properties);
  
  return properties[index];
}

export async function deleteProperty(id: string | number) {
  await initializeProperties();
  
  console.log('=== deleteProperty called ===');
  console.log('Deleting property with ID:', id);
  console.log('Current properties count:', properties.length);
  
  const index = properties.findIndex(p => String(p.id) === String(id));
  if (index === -1) {
    console.log('Property not found for deletion');
    return false;
  }
  
  const deletedProperty = properties[index];
  console.log('Property to delete:', {
    id: deletedProperty.id,
    title: deletedProperty.title,
    isStatic: Number(deletedProperty.id) <= 12
  });
  
  properties.splice(index, 1);
  console.log('Properties after deletion:', properties.length);
  
  // Save to persistent storage (this will track deleted static deals)
  await saveProperties(properties);
  
  // Force re-initialization on next access to ensure deleted IDs are respected
  isInitialized = false;
  
  console.log('Deletion complete, reset initialization flag');
  return true;
}