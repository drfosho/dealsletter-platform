const fs = require('fs');
const path = require('path');

// Import the rehab calculator logic
const REHAB_COST_PER_SQFT = {
  none: { min: 0, max: 0, default: 0 },
  light: { min: 15, max: 25, default: 20 },
  medium: { min: 30, max: 50, default: 40 },
  heavy: { min: 60, max: 100, default: 80 },
};

function determineRehabLevel(strategy, yearBuilt) {
  const currentYear = new Date().getFullYear();
  const propertyAge = yearBuilt ? currentYear - yearBuilt : 50;

  // Fix & Flip always needs at least medium rehab
  if (strategy === 'Fix & Flip' || strategy === 'Flip') {
    if (propertyAge > 40) return 'heavy';
    return 'medium';
  }

  // BRRRR strategy typically needs medium to heavy rehab
  if (strategy === 'BRRRR') {
    if (propertyAge > 30) return 'heavy';
    return 'medium';
  }

  // Buy & Hold might need light to medium rehab
  if (strategy === 'Buy & Hold') {
    if (propertyAge > 50) return 'medium';
    if (propertyAge > 20) return 'light';
    return 'none';
  }

  // Default
  if (propertyAge > 40) return 'medium';
  if (propertyAge > 20) return 'light';
  return 'none';
}

function calculateRehabCosts(squareFootage, level, state) {
  if (!squareFootage || squareFootage <= 0) {
    return { averageEstimate: 0 };
  }

  // High-cost states get 20% premium
  const highCostStates = ['CA', 'NY', 'MA', 'HI', 'DC', 'WA', 'OR', 'CT', 'NJ'];
  const locationMultiplier = state && highCostStates.includes(state) ? 1.2 : 1.0;

  const costRange = REHAB_COST_PER_SQFT[level];
  const adjustedDefault = costRange.default * locationMultiplier;
  const averageEstimate = Math.round(squareFootage * adjustedDefault);

  return { averageEstimate };
}

// Load properties
const propertiesPath = path.join(__dirname, '../data/properties.json');
const data = JSON.parse(fs.readFileSync(propertiesPath, 'utf8'));

console.log('Updating properties with estimated rehab costs...\n');

let updated = 0;
const updatedProperties = data.map(property => {
  // Only update if property doesn't have rehab costs and is a flip/BRRRR strategy
  if (!property.rehabCosts && 
      (property.strategy === 'Fix & Flip' || 
       property.strategy === 'Flip' || 
       property.strategy === 'BRRRR')) {
    
    const level = determineRehabLevel(property.strategy, property.yearBuilt);
    const estimate = calculateRehabCosts(property.sqft, level, property.state);
    
    if (estimate.averageEstimate > 0) {
      updated++;
      console.log(`Updating: ${property.title}`);
      console.log(`  Strategy: ${property.strategy}`);
      console.log(`  Sqft: ${property.sqft}`);
      console.log(`  Year Built: ${property.yearBuilt || 'Unknown'}`);
      console.log(`  Rehab Level: ${level}`);
      console.log(`  Estimated Cost: $${estimate.averageEstimate.toLocaleString()}`);
      console.log('');
      
      // Update the property with rehab costs
      return {
        ...property,
        rehabCosts: estimate.averageEstimate,
        rehabLevel: level
      };
    }
  }
  
  return property;
});

// Update ROI calculations for properties with new rehab costs
const finalProperties = updatedProperties.map(property => {
  if (property.strategy === 'Fix & Flip' || property.strategy === 'Flip') {
    // Recalculate flip ROI if we just added rehab costs
    if (property.rehabCosts && !data.find(p => p.id === property.id).rehabCosts) {
      const totalInvestment = (property.downPayment || property.price * 0.25) + property.rehabCosts;
      const profit = (property.arv || property.price * 1.3) - property.price - property.rehabCosts;
      const flipROI = Math.round((profit / totalInvestment) * 100);
      
      return {
        ...property,
        estimatedProfit: Math.round(profit),
        flipROI: flipROI,
        totalInvestment: totalInvestment
      };
    }
  }
  return property;
});

// Save updated properties
fs.writeFileSync(propertiesPath, JSON.stringify(finalProperties, null, 2));

console.log(`\n✅ Updated ${updated} properties with estimated rehab costs`);
console.log('Properties file has been updated.');