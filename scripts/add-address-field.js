const fs = require('fs');
const path = require('path');

// Load properties
const propertiesPath = path.join(__dirname, '../data/properties.json');
const data = JSON.parse(fs.readFileSync(propertiesPath, 'utf8'));

console.log('Adding address field to properties...\n');

let updated = 0;
const updatedProperties = data.map(property => {
  // Check if address field is missing or empty
  if (!property.address) {
    updated++;
    
    // Generate address from available fields
    let address = '';
    
    // Priority 1: Use title if it looks like an address
    if (property.title && (property.title.includes(' St') || 
                          property.title.includes(' Ave') || 
                          property.title.includes(' Dr') ||
                          property.title.includes(' Rd') ||
                          property.title.includes(' Way') ||
                          property.title.includes(' Ter') ||
                          property.title.includes(' Pl') ||
                          property.title.includes(' NE ') ||
                          property.title.includes(' NW ') ||
                          property.title.includes(' SE ') ||
                          property.title.includes(' SW ') ||
                          /^\d+\s/.test(property.title))) {
      address = property.title;
    }
    // Priority 2: Build from components
    else if (property.addressLine1) {
      address = property.addressLine1;
    }
    // Priority 3: Use title as fallback
    else {
      address = property.title;
    }
    
    console.log(`Property: ${property.title}`);
    console.log(`  Generated Address: ${address}`);
    console.log(`  Location: ${property.location || property.city + ', ' + property.state}`);
    console.log('');
    
    return {
      ...property,
      address: address
    };
  }
  
  return property;
});

// Save updated properties
fs.writeFileSync(propertiesPath, JSON.stringify(updatedProperties, null, 2));

console.log(`\n✅ Updated ${updated} properties with address field`);
console.log('Properties file has been updated.');