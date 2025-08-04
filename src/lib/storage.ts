import { promises as fs } from 'fs';
import path from 'path';
import { staticDeals } from './staticDeals';

const STORAGE_FILE = path.join(process.cwd(), 'data', 'properties.json');
const DELETED_IDS_FILE = path.join(process.cwd(), 'data', 'deleted-ids.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load deleted IDs from file
async function loadDeletedIds(): Promise<(string | number)[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DELETED_IDS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Save deleted IDs to file
export async function saveDeletedIds(deletedIds: (string | number)[]): Promise<void> {
  try {
    await ensureDataDir();
    await fs.writeFile(DELETED_IDS_FILE, JSON.stringify(deletedIds, null, 2));
    console.log('Saved deleted IDs:', deletedIds.length);
  } catch (error) {
    console.error('Error saving deleted IDs:', error);
  }
}

// Load properties from file or use static deals as default
export async function loadProperties(): Promise<Record<string, unknown>[]> {
  try {
    await ensureDataDir();
    
    // Load saved properties
    let savedProperties: Record<string, unknown>[] = [];
    try {
      const data = await fs.readFile(STORAGE_FILE, 'utf-8');
      savedProperties = JSON.parse(data);
      console.log('Loaded properties from file:', savedProperties.length);
    } catch {
      console.log('No saved properties file found');
    }
    
    // Load deleted IDs
    const deletedIds = await loadDeletedIds();
    console.log('Loaded deleted IDs:', deletedIds);
    
    // Filter out deleted static deals
    const activeStaticDeals = staticDeals.filter(deal => 
      !deletedIds.includes(deal.id)
    );
    console.log('Active static deals after filtering:', activeStaticDeals.length);
    
    // Merge static deals with saved properties (avoiding duplicates)
    const staticIds = staticDeals.map(d => d.id);
    const nonStaticProperties = savedProperties.filter((p: Record<string, unknown>) => 
      !staticIds.includes(p.id as number)
    );
    
    return [...activeStaticDeals, ...nonStaticProperties];
  } catch (error) {
    console.error('Error loading properties:', error);
    return [...staticDeals];
  }
}

// Clear deleted IDs (restore all static deals)
export async function clearDeletedIds(): Promise<void> {
  try {
    await ensureDataDir();
    await fs.writeFile(DELETED_IDS_FILE, JSON.stringify([], null, 2));
    console.log('Cleared all deleted IDs');
  } catch (error) {
    console.error('Error clearing deleted IDs:', error);
  }
}

// Save properties to file
export async function saveProperties(properties: Record<string, unknown>[]): Promise<void> {
  try {
    await ensureDataDir();
    
    // Get all current property IDs
    const currentPropertyIds = properties.map(p => p.id);
    
    // Identify which static deals have been deleted
    const staticIds = staticDeals.map(d => d.id);
    const deletedStaticIds = staticIds.filter(id => 
      !currentPropertyIds.includes(id)
    );
    
    // Update deleted IDs file if any static deals were deleted
    if (deletedStaticIds.length > 0) {
      const existingDeletedIds = await loadDeletedIds();
      const allDeletedIds = [...new Set([...existingDeletedIds, ...deletedStaticIds])];
      await saveDeletedIds(allDeletedIds);
      console.log('Updated deleted IDs with:', deletedStaticIds);
    }
    
    // Filter out static deals before saving (they're stored separately)
    const propertiesToSave = properties.filter(p => !staticIds.includes(p.id as number));
    
    await fs.writeFile(STORAGE_FILE, JSON.stringify(propertiesToSave, null, 2));
    console.log('Saved properties to file:', propertiesToSave.length);
  } catch (error) {
    console.error('Error saving properties:', error);
  }
}