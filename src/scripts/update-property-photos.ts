// Script to update all static deals with appropriate photos
import PropertyPhotoService from '../services/property-photos';
import { staticDeals } from '../lib/staticDeals';
import fs from 'fs';
import path from 'path';

async function updatePropertyPhotos() {
  console.log('Updating property photos for all static deals...');
  
  const updatedDeals = await Promise.all(
    staticDeals.map(async (deal) => {
      const fullAddress = `${deal.address}, ${deal.city}, ${deal.state} ${deal.zipCode}`;
      
      // Get 5 photos for each property
      const photos = await PropertyPhotoService.getPropertyPhotos(
        fullAddress,
        deal.propertyType,
        undefined, // No RentCast photos for static deals
        5
      );
      
      console.log(`Property: ${deal.title}`);
      console.log(`  Address: ${fullAddress}`);
      console.log(`  Type: ${deal.propertyType}`);
      console.log(`  Photos: ${photos.length} images`);
      
      return {
        ...deal,
        images: photos
      };
    })
  );
  
  // Generate the updated staticDeals.ts file
  const fileContent = `// Static property deals with photos
import { PropertyData } from '@/types/property';

export const staticDeals: PropertyData[] = ${JSON.stringify(updatedDeals, null, 2)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/: "new Date\(\)"/g, ': new Date()')};
`;
  
  const outputPath = path.join(process.cwd(), 'src/lib/staticDeals-with-photos.ts');
  fs.writeFileSync(outputPath, fileContent);
  
  console.log(`\nUpdated deals saved to: ${outputPath}`);
  console.log('Please review and replace the original staticDeals.ts file');
}

// Run the update
updatePropertyPhotos().catch(console.error);