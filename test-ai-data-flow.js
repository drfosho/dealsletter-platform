// Test script to verify AI analysis data flow
// Run this in the browser console after the modal opens

console.log('=== TESTING AI DATA FLOW ===');

// Sample data that matches what the AI should return
const testData = {
  // Basic fields
  title: "1419 Leavenworth St",
  address: "1419 Leavenworth St",
  city: "San Francisco",
  state: "CA",
  zipCode: "94109",
  price: 3950000,
  downPayment: 987500,
  downPaymentPercent: 25,
  monthlyRent: 12600,
  bedrooms: 12,
  bathrooms: 12,
  sqft: 8500,
  yearBuilt: 1925,
  
  // Premium content that should populate in modal
  strategicOverview: "This 1925-vintage Nob Hill apartment building represents one of San Francisco's most compelling value-add opportunities...",
  
  valueAddDescription: "The property's 50% vacancy presents an extraordinary repositioning opportunity...",
  
  locationAnalysis: {
    overview: "Nob Hill stands as San Francisco's most prestigious residential neighborhood...",
    walkScore: 98,
    transitScore: 100,
    neighborhoodClass: "A"
  },
  
  rentAnalysis: {
    currentRentPerUnit: 2100,
    marketRentPerUnit: 3200,
    rentGrowthRate: 3.5,
    stabilizationTimeline: "9-12 months",
    vacantUnits: 6,
    totalUnits: 12,
    monthlyRentUpside: 25800,
    annualRentUpside: 309600
  },
  
  propertyMetrics: {
    pricePerSqft: 465,
    pricePerUnit: 329167,
    grossRentMultiplier: 8.6,
    debtServiceCoverageRatio: 1.42,
    breakEvenOccupancy: 68,
    internalRateOfReturn: 24.3,
    equityMultiple: 2.84,
    paybackPeriod: 4.2
  },
  
  financingScenarios: [{
    name: "Traditional Bank Financing",
    description: "Conservative 25% down conventional loan...",
    downPayment: 987500,
    downPaymentPercent: 25,
    interestRate: 7.25,
    monthlyCashFlow: 6889,
    cashOnCashReturn: 6.8
  }],
  
  thirtyYearProjections: {
    assumptions: {
      rentGrowthRate: 3.5,
      expenseGrowthRate: 3.0,
      appreciationRate: 4.5,
      vacancyRate: 5
    },
    projections: [{
      year: 1,
      grossRent: 273600,
      cashFlow: -118212,
      capRate: 3.1,
      equity: 987500,
      totalROI: -9.7
    }]
  }
};

// Check if modal is open
const modalElement = document.querySelector('[role="dialog"]');
if (modalElement) {
  console.log('Modal is open');
  
  // Check which tabs show data indicators
  const tabs = modalElement.querySelectorAll('button');
  tabs.forEach(tab => {
    const hasCheckmark = tab.textContent.includes('✓');
    console.log(`Tab: ${tab.textContent.replace('✓', '').trim()} - Has data: ${hasCheckmark}`);
  });
  
  // Check if data is in React state
  const reactProps = modalElement._reactInternalInstance || modalElement.__reactInternalFiber;
  console.log('React props:', reactProps);
}

console.log('Test data structure:', testData);
console.log('To test: paste the property text and check if this structure appears in console logs');