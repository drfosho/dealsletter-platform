const fs = require('fs');
const path = require('path');

const propertiesPath = path.join(__dirname, '../data/properties.json');
const data = JSON.parse(fs.readFileSync(propertiesPath, 'utf8'));

console.log('Total properties:', data.length);
console.log('\n=== Properties needing rehab cost estimation ===\n');

const needsEstimation = [];
const hasRehabCosts = [];

data.forEach((p) => {
  if (p.rehabCosts && p.rehabCosts > 0) {
    hasRehabCosts.push(p);
  } else if (p.strategy === 'Fix & Flip' || p.strategy === 'Flip' || p.strategy === 'BRRRR') {
    needsEstimation.push(p);
    console.log(`ID: ${p.id}`);
    console.log(`  Title: ${p.title}`);
    console.log(`  Strategy: ${p.strategy}`);
    console.log(`  Sqft: ${p.sqft || 'N/A'}`);
    console.log(`  State: ${p.state}`);
    console.log(`  Year Built: ${p.yearBuilt || 'N/A'}`);
    console.log('');
  }
});

console.log('\n=== Summary ===');
console.log(`Properties with rehab costs: ${hasRehabCosts.length}`);
console.log(`Properties needing estimation: ${needsEstimation.length}`);

// Show properties with rehab costs
console.log('\n=== Properties with existing rehab costs ===');
hasRehabCosts.forEach(p => {
  console.log(`ID: ${p.id}, Title: ${p.title}, RehabCosts: $${p.rehabCosts.toLocaleString()}`);
});