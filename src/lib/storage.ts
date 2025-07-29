import { promises as fs } from 'fs';
import path from 'path';
import { staticDeals } from './staticDeals';

const STORAGE_FILE = path.join(process.cwd(), 'data', 'properties.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load properties from file or use static deals as default
export async function loadProperties(): Promise<Record<string, unknown>[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(STORAGE_FILE, 'utf-8');
    const savedProperties = JSON.parse(data);
    console.log('Loaded properties from file:', savedProperties.length);
    
    // Merge static deals with saved properties (avoiding duplicates)
    const staticIds = staticDeals.map(d => d.id);
    const nonStaticProperties = savedProperties.filter((p: any) => !staticIds.includes(p.id));
    
    return [...staticDeals, ...nonStaticProperties];
  } catch (error) {
    console.log('No saved properties file found, using static deals only');
    return [...staticDeals];
  }
}

// Save properties to file
export async function saveProperties(properties: Record<string, unknown>[]): Promise<void> {
  try {
    await ensureDataDir();
    
    // Filter out static deals before saving
    const staticIds = staticDeals.map(d => d.id);
    const propertiesToSave = properties.filter(p => !staticIds.includes(p.id as number));
    
    await fs.writeFile(STORAGE_FILE, JSON.stringify(propertiesToSave, null, 2));
    console.log('Saved properties to file:', propertiesToSave.length);
  } catch (error) {
    console.error('Error saving properties:', error);
  }
}