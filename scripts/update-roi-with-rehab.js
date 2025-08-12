const fs = require('fs');
const path = require('path');

// Load properties
const propertiesPath = path.join(__dirname, '../data/properties.json');
const data = JSON.parse(fs.readFileSync(propertiesPath, 'utf8'));

console.log('Updating ROI calculations to include rehab costs...\n');

let updated = 0;
const updatedProperties = data.map(property => {
  // Only update properties with rehab costs
  if (property.rehabCosts && property.rehabCosts > 0) {
    updated++;
    console.log(`Updating ROI for: ${property.title}`);
    console.log(`  Strategy: ${property.strategy}`);
    console.log(`  Price: $${property.price.toLocaleString()}`);
    console.log(`  Rehab Costs: $${property.rehabCosts.toLocaleString()}`);
    
    // Calculate total investment
    const downPayment = property.downPayment || (property.price * 0.25);
    const closingCosts = property.closingCosts || (property.price * 0.03);
    const totalInvestment = downPayment + property.rehabCosts + closingCosts;
    
    // For Fix & Flip properties
    if (property.strategy === 'Fix & Flip' || property.strategy === 'Flip') {
      // ARV (After Repair Value) - if not set, estimate at 30-50% above total cost
      const arv = property.arv || Math.round((property.price + property.rehabCosts) * 1.35);
      
      // Calculate profit
      const sellingCosts = arv * 0.08; // 8% for agent fees and closing
      const holdingCosts = property.price * 0.7 * 0.08 * 0.5; // 6 months of interest
      const totalCosts = property.price + property.rehabCosts + closingCosts + sellingCosts + holdingCosts;
      const profit = arv - totalCosts;
      
      // Calculate Flip ROI
      const flipROI = Math.round((profit / totalInvestment) * 100);
      
      console.log(`  ARV: $${arv.toLocaleString()}`);
      console.log(`  Estimated Profit: $${Math.round(profit).toLocaleString()}`);
      console.log(`  Flip ROI: ${flipROI}%`);
      
      return {
        ...property,
        arv: arv,
        totalInvestment: Math.round(totalInvestment),
        estimatedProfit: Math.round(profit),
        flipROI: flipROI
      };
    }
    
    // For BRRRR properties
    if (property.strategy === 'BRRRR') {
      // After rehab, property should be worth more
      const arvBrrrr = property.arv || Math.round((property.price + property.rehabCosts) * 1.15);
      
      // Refinance at 75% of ARV
      const refinanceAmount = arvBrrrr * 0.75;
      const cashOut = refinanceAmount - (property.price * 0.75); // Original loan amount
      const cashLeft = totalInvestment - cashOut;
      
      // Calculate new cash flow after refinance
      const newMonthlyDebt = (refinanceAmount * 0.07 / 12); // 7% interest
      const projectedRent = property.projectedRent || property.monthlyRent * 1.3;
      const expenses = projectedRent * 0.4; // 40% expense ratio
      const newCashFlow = projectedRent - newMonthlyDebt - expenses;
      
      // Cash-on-cash return based on cash left in deal
      const annualCashFlow = newCashFlow * 12;
      const cashOnCash = cashLeft > 0 ? Math.round((annualCashFlow / cashLeft) * 100) : 999;
      
      console.log(`  ARV after rehab: $${arvBrrrr.toLocaleString()}`);
      console.log(`  Cash left in deal: $${Math.round(cashLeft).toLocaleString()}`);
      console.log(`  New monthly cash flow: $${Math.round(newCashFlow).toLocaleString()}`);
      console.log(`  Cash-on-Cash Return: ${cashOnCash > 100 ? 'Infinite' : cashOnCash + '%'}`);
      
      return {
        ...property,
        arv: arvBrrrr,
        totalInvestment: Math.round(totalInvestment),
        cashLeftInDeal: Math.round(cashLeft),
        refinanceAmount: Math.round(refinanceAmount),
        proFormaCashFlow: Math.round(newCashFlow),
        cashOnCashReturn: cashOnCash
      };
    }
    
    // For Buy & Hold properties with rehab
    if (property.strategy === 'Buy & Hold') {
      // Improved rent after rehab
      const improvedRent = property.projectedRent || Math.round(property.monthlyRent * 1.15);
      const monthlyExpenses = improvedRent * 0.35; // 35% expense ratio
      const monthlyDebt = property.monthlyPI || ((property.price * 0.75) * 0.065 / 12);
      const improvedCashFlow = improvedRent - monthlyExpenses - monthlyDebt;
      
      // Total ROI including appreciation and cash flow
      const annualCashFlow = improvedCashFlow * 12;
      const annualAppreciation = property.price * 0.03; // 3% appreciation
      const totalReturn = annualCashFlow + annualAppreciation;
      const totalROI = Math.round((totalReturn / totalInvestment) * 100);
      
      console.log(`  Improved monthly rent: $${improvedRent.toLocaleString()}`);
      console.log(`  Improved cash flow: $${Math.round(improvedCashFlow).toLocaleString()}/mo`);
      console.log(`  Total ROI: ${totalROI}%`);
      
      return {
        ...property,
        totalInvestment: Math.round(totalInvestment),
        projectedRent: improvedRent,
        proFormaCashFlow: Math.round(improvedCashFlow),
        totalROI: totalROI
      };
    }
    
    console.log('');
  }
  
  return property;
});

// Save updated properties
fs.writeFileSync(propertiesPath, JSON.stringify(updatedProperties, null, 2));

console.log(`\n✅ Updated ${updated} properties with rehab-adjusted ROI calculations`);
console.log('Properties file has been updated.');