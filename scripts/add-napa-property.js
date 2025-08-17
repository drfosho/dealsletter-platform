// Use native fetch (Node 18+) or install node-fetch if needed
require('dotenv').config({ path: '.env.local' });

const napaProperty = {
  id: `napa-caymus-${Date.now()}`,
  title: "Napa 3-Unit House Hack - Live in Wine Country Paradise!",
  address: "850 Caymus St",
  city: "Napa",
  state: "CA",
  zipCode: "94559",
  location: "Napa, CA",
  propertyType: "Multi-Family",
  type: "House Hack",
  price: 825000,
  downPayment: 28875,
  downPaymentPercent: 3.5,
  monthlyRent: 5600,
  capRate: 6.1,
  monthlyCashFlow: -1240, // Initial negative but becomes positive with strategies
  totalROI: 1900, // 5-year ROI projection
  investmentStrategy: "House Hack",
  strategy: "Live in one unit, rent others",
  confidence: "Very High",
  riskLevel: "Low",
  daysOnMarket: 0,
  bedrooms: 5, // 3BR main + 2 studios
  bathrooms: 3,
  sqft: 2800, // Estimated total
  yearBuilt: 1880,
  features: [
    "Two separate buildings",
    "Warehouse for conversion",
    "5 blocks from downtown Napa",
    "3BR main house + 2 studios",
    "Wine country location",
    "Multiple income streams",
    "ADU conversion potential",
    "FHA eligible",
    "Walk to restaurants & wine tasting",
    "Development potential"
  ],
  images: [],
  description: "Incredible house hack opportunity in downtown Napa! Two buildings on one lot with warehouse bonus. Live in a studio while collecting $5,600/month from the main house and other studio. Just 5 blocks from downtown Napa's restaurants and wine tasting rooms. Perfect for wine country lifestyle with mortgage paid by tenants!",
  
  // Financial Details
  interestRate: 6.75,
  loanTerm: 30,
  monthlyPI: 5166,
  closingCosts: 16500,
  rehabCosts: 0, // Initial, warehouse conversion later
  rehabDetails: {
    "Warehouse to ADU Conversion": 100000,
    "Future improvements": 0
  },
  propertyTaxes: 860,
  insurance: 250,
  hoa: 0,
  hoaFees: 0,
  utilities: 0, // Tenants pay
  maintenance: 200,
  propertyManagement: 0, // Self-managed
  vacancy: 280, // 5% vacancy factor
  capitalExpenditures: 200,
  
  // Neighborhood & Location
  neighborhoodClass: "A",
  neighborhood: "Downtown Napa",
  lotSize: "0.25 acres",
  
  // Rental Analysis
  currentRent: 5600,
  projectedRent: 8100, // After warehouse conversion
  rentUpside: 2500,
  currentCapRate: 6.1,
  proFormaCapRate: 9.8,
  proFormaCashFlow: 1260,
  cashOnCashReturn: -51.4, // Initial negative, becomes 52.3% after conversion
  
  // Premium Newsletter Sections
  strategicOverview: `This is a rare house hack opportunity in the heart of Napa Valley. With just $28,875 down using an FHA loan, you can control a property with three income-producing units plus a warehouse with massive potential. The strategy is simple: live in one studio while renting the main house and other studio for $5,600/month, covering most of your housing costs. The real opportunity lies in the warehouse conversion - add an ADU and you'll actually get PAID to live in downtown Napa. This property offers multiple exit strategies and income optimization paths in one of California's most desirable wine country locations.`,
  
  valueAddDescription: `The warehouse conversion is the hidden goldmine. For approximately $100k (financeable through HELOC after year 1), convert to a legal ADU renting for $2,500/month. Additional value-adds include: Airbnb arbitrage on weekends ($300/night), wine country event hosting ($1,000+ per event), commercial warehouse rental to winemakers ($1,500/month), or wine storage business ($2,000/month). The two-building configuration provides incredible flexibility for various income strategies.`,
  
  locationAnalysis: {
    walkScore: 85,
    proximity: "5 blocks to downtown Napa",
    nearbyEmployers: ["Wine industry", "Queen of the Valley Hospital", "Hospitality sector"],
    publicTransit: "Vine Transit nearby",
    schools: "Napa Valley USD",
    shopping: "Oxbow Public Market, First Street Napa",
    appreciation: "5-7% annual historically",
    marketTrends: "Limited housing supply, high rental demand, wine country premium"
  },
  
  rentAnalysis: {
    currentRents: {
      "Main House (3BR/2BA)": 3200,
      "Studio #1": 2400,
      "Studio #2 (You live here)": 0,
      "Warehouse": 0
    },
    marketRents: {
      "Main House": 3200,
      "Studio": 2400,
      "Warehouse ADU": 2500,
      "Airbnb (weekend)": 300
    },
    rentalDemand: "Very High - wine industry workers, healthcare, hospitality, remote tech",
    vacancyRate: "Under 3% in Napa",
    rentGrowth: "4-5% annually"
  },
  
  propertyMetrics: {
    pricePerUnit: 275000,
    pricePerSqFt: 295,
    grossRentMultiplier: 12.3,
    debtServiceCoverage: 0.82, // Improves to 1.18 with warehouse
    breakEvenOccupancy: "92%",
    internalRateOfReturn: "38%",
    equityMultiple: 19.0 // Over 5 years
  },
  
  financingScenarios: [
    {
      name: "FHA 3.5% Down (Recommended)",
      downPayment: 28875,
      loanAmount: 796125,
      rate: 6.75,
      monthlyPayment: 5730,
      cashFlow: -1240,
      totalCashNeeded: 45375
    },
    {
      name: "Conventional 5% Down",
      downPayment: 41250,
      loanAmount: 783750,
      rate: 7.25,
      monthlyPayment: 5544,
      cashFlow: -1004,
      totalCashNeeded: 57750
    },
    {
      name: "Conventional 20% Down",
      downPayment: 165000,
      loanAmount: 660000,
      rate: 7.0,
      monthlyPayment: 4391,
      cashFlow: 169,
      totalCashNeeded: 181500
    }
  ],
  
  thirtyYearProjections: {
    totalRentalIncome: 2016000, // Base rents
    totalCashFlow: 378000, // After warehouse conversion
    principalPaydown: 796125,
    propertyAppreciation: 1375000, // At 5% annual
    totalReturn: 2549125,
    averageAnnualReturn: 84971,
    totalROI: 8830, // Percentage
    equityAtYear30: 2200000
  },
  
  marketAnalysis: {
    comparables: [
      { address: "Similar 3-unit", price: 950000, sqft: 2600 },
      { address: "Downtown duplex", price: 750000, sqft: 2000 },
      { address: "4-plex nearby", price: 1100000, sqft: 3200 }
    ],
    medianPrice: 825000,
    priceGrowth: "7% YoY",
    daysOnMarket: 25,
    inventoryLevel: "Very Low",
    buyerDemand: "High",
    sellerConcessions: "Rare in this market"
  },
  
  rehabAnalysis: {
    immediate: {
      "Move-in ready": 0,
      "Minor updates": 5000
    },
    phase1: {
      "Warehouse planning/permits": 15000,
      "Timeline": "6 months"
    },
    phase2: {
      "Warehouse to ADU conversion": 100000,
      "Timeline": "4-6 months",
      "ROI": "30% cash-on-cash"
    },
    phase3: {
      "Landscape/outdoor space": 25000,
      "Event space setup": 15000,
      "Timeline": "Year 3"
    },
    totalBudget: 160000,
    postRehabValue: 1100000
  },
  
  // Listing Details
  status: "active",
  isDraft: false,
  listingUrl: "https://www.loopnet.com/Listing/850-Caymus-St-Napa-CA/37220526/",
  listingSource: "LoopNet",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

async function addNapaProperty() {
  try {
    console.log('Adding Napa Wine Country property to dashboard...\n');
    
    // Get the base URL from environment or use localhost
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/admin/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add admin auth if needed
        'x-admin-key': process.env.ADMIN_API_KEY || 'admin-key-placeholder'
      },
      body: JSON.stringify(napaProperty)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to add property: ${error}`);
    }

    const result = await response.json();
    console.log('✅ Property added successfully!');
    console.log('Property ID:', result.id);
    console.log('\n📊 Key Metrics:');
    console.log('- Price: $825,000');
    console.log('- FHA Down: $28,875 (3.5%)');
    console.log('- Monthly Rent: $5,600');
    console.log('- Your Cost: $1,240/month');
    console.log('- After Warehouse: GET PAID $1,260/month!');
    console.log('- 5-Year ROI: 1,900%');
    console.log('\n🏡 View in dashboard: /dashboard');
    console.log('✏️ Edit in admin: /admin/properties');
    console.log('\n📸 Remember to add property images in the admin panel!');
    
  } catch (error) {
    console.error('❌ Error adding property:', error);
    console.log('\n💡 Try adding manually through the admin panel at /admin/properties');
  }
}

// Run if called directly
if (require.main === module) {
  addNapaProperty();
}

module.exports = { napaProperty, addNapaProperty };