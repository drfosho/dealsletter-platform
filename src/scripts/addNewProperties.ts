// Script to add new properties to the platform
import { createProperty } from '@/lib/properties';

const newProperties = [
  // Property 1: Oakland 6-Plex
  {
    id: Date.now() + 1,
    title: "Oakland 6-Plex - Section 8 GOLDMINE",
    address: "5476 Vicente Way",
    city: "Oakland",
    state: "CA",
    zipCode: "94609",
    location: "Oakland, CA 94609",
    type: "Multifamily",
    propertyType: "Multifamily",
    strategy: "Buy & Hold",
    investmentStrategy: "Buy & Hold",
    units: 6,
    isMultiFamily: true,
    price: 2299999,
    downPayment: 690000,
    downPaymentPercent: 30,
    currentCapRate: 7.97,
    capRate: 7.97,
    proFormaCapRate: 9.5,
    monthlyRent: 14520,
    projectedRent: 22239,
    rentUpside: 7719,
    monthlyCashFlow: 4289,
    proFormaCashFlow: 11244,
    cashFlow: 4289,
    totalROI: 391,
    roi: "391",
    status: "active",
    daysOnMarket: 5,
    confidence: "very high",
    images: ["/api/placeholder/400/300"],
    bedrooms: 11,
    bathrooms: 8,
    sqft: 4800,
    yearBuilt: 1965,
    lotSize: 10000,
    features: ["Section 8 Ready", "Recent Renovations", "Prime Lower Rockridge", "Coin Laundry Potential", "ADU Development Possible", "Near Whole Foods"],
    description: "Exceptional 6-unit building in Lower Rockridge with incredible 7.97% cap rate and massive Section 8 upside! Recent renovations, prime location near new Whole Foods, and diverse unit mix create multiple value-add opportunities. At 25% expense ratio and one vacant unit ready for Section 8, this is a rare Oakland gem!",
    riskLevel: "low",
    timeframe: "Immediate",
    cashRequired: 690000,
    isDraft: false,
    listingUrl: "https://www.loopnet.com/Listing/5476-Vicente-Way-Oakland-CA/37054020/",
    listingSource: "LoopNet",
    
    // Financial details
    interestRate: 7.25,
    loanTerm: 30,
    monthlyPI: 10995,
    closingCosts: 45000,
    rehabCosts: 0,
    propertyTaxes: 23000,
    insurance: 8400,
    hoaFees: 0,
    utilities: 3600,
    maintenance: 9000,
    propertyManagement: 14520,
    vacancy: 5,
    capitalExpenditures: 3,
    
    // Strategic Analysis
    strategicOverview: {
      title: "Section 8 Arbitrage Opportunity",
      summary: "Transform a solid 7.97% cap rate property into a 19.6% cash-on-cash return machine through Section 8 conversion",
      keyPoints: [
        "Current rent roll $14,520 with Section 8 potential of $22,239",
        "Unit 7 paying $998 can get $3,325 Section 8 rate",
        "Guaranteed government rent with annual increases",
        "Lower Rockridge location commands premium",
        "10,000 sq ft lot allows for ADU development"
      ]
    },
    
    valueAddDescription: "Convert units to Section 8 for immediate $7,719/month increase. Install coin laundry for $300/month. Add parking fees for $500/month. Consider 2 ADUs for additional $4,000/month.",
    
    locationAnalysis: {
      walkScore: 91,
      transitScore: 85,
      bikeScore: 88,
      nearbyEmployers: ["Kaiser Oakland", "UCSF Benioff", "UC Berkeley"],
      demographics: "Tech workers moving in, rapid gentrification, limited multifamily supply",
      crimeGrade: "B+",
      schoolRating: 7,
      marketTrend: "Hot - 5-7% annual rent growth"
    },
    
    rentAnalysis: {
      currentRents: {
        "3BR Units": "$4,150 avg",
        "2BR Units": "$2,073 avg", 
        "1BR Unit": "$2,472"
      },
      marketRents: {
        "3BR": "$4,200",
        "2BR": "$2,750",
        "1BR": "$2,400"
      },
      section8Rents: {
        "3BR": "$4,640",
        "2BR": "$3,325",
        "1BR": "$2,684"
      }
    },
    
    financingScenarios: [
      {
        name: "Traditional 30% Down",
        downPayment: 690000,
        loanAmount: 1609999,
        rate: 7.25,
        monthlyPayment: 10995,
        cashFlow: 4289,
        cashOnCash: 7.5
      },
      {
        name: "Section 8 Conversion",
        downPayment: 690000,
        loanAmount: 1609999,
        rate: 7.25,
        monthlyPayment: 10995,
        cashFlow: 11244,
        cashOnCash: 19.6
      }
    ],
    
    thirtyYearProjections: {
      totalCashFlow: 4050000,
      totalEquity: 3700000,
      estimatedValue: 5000000,
      totalReturn: 7750000,
      averageAnnualReturn: 37.4
    },
    
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Property 2: Sacramento 62-Unit
  {
    id: Date.now() + 2,
    title: "Sacramento 62-Unit Plaza Estates",
    address: "695 Plaza Ave",
    city: "Sacramento",
    state: "CA",
    zipCode: "95815",
    location: "Sacramento, CA 95815",
    type: "Value-Add",
    propertyType: "Multifamily",
    strategy: "Value-Add",
    investmentStrategy: "Value-Add",
    units: 62,
    isMultiFamily: true,
    price: 8250000,
    pricePerUnit: 133065,
    downPayment: 2475000,
    downPaymentPercent: 30,
    currentCapRate: 7.91,
    capRate: 7.91,
    proFormaCapRate: 9.5,
    monthlyRent: 86506,
    projectedRent: 110194,
    rentUpside: 26505,
    monthlyCashFlow: -14135,
    proFormaCashFlow: 52382,
    cashFlow: -14135,
    totalROI: 273,
    roi: "273",
    status: "active",
    daysOnMarket: 12,
    confidence: "high",
    images: ["/api/placeholder/400/300"],
    bedrooms: 83,
    bathrooms: 62,
    sqft: 48000,
    yearBuilt: 1972,
    features: ["70% Occupied", "Recent Renovations", "Below Market Rents", "RUBS Opportunity", "Professional Management Needed", "Strong Sacramento Market"],
    description: "Massive 62-unit value-add opportunity with incredible upside! Currently 70% occupied with 59.9% expenses - simple operational improvements will transform this into a cash flow machine. Below-market rents and poor management create perfect turnaround opportunity.",
    riskLevel: "medium-high",
    timeframe: "12-18 months",
    cashRequired: 2475000,
    isDraft: false,
    listingUrl: "https://www.loopnet.com/Listing/695-Plaza-Ave-Sacramento-CA/33367946/",
    listingSource: "LoopNet",
    
    // Financial details
    interestRate: 6.75,
    loanTerm: 30,
    monthlyPI: 37462,
    closingCosts: 165000,
    rehabCosts: 200000,
    propertyTaxes: 82500,
    insurance: 49500,
    hoaFees: 0,
    utilities: 72000,
    maintenance: 66000,
    propertyManagement: 61600,
    vacancy: 30,
    capitalExpenditures: 5,
    
    // Strategic Analysis
    strategicOverview: {
      title: "Turnaround Opportunity - From Negative to $628k Annual Cash Flow",
      summary: "Transform struggling 62-unit complex through lease-up, RUBS implementation, and expense optimization",
      keyPoints: [
        "Fill 19 vacant units for immediate $26,505/month income boost",
        "Implement RUBS for $3,720/month additional income",
        "Reduce expenses from 59.9% to 45% through new management",
        "Below-market rents with $155/unit upside potential",
        "Sacramento market experiencing rapid growth"
      ]
    },
    
    valueAddDescription: "Immediate lease-up campaign to 95% occupancy. Implement RUBS program. New professional management to reduce expenses. Unit upgrades commanding $200+ premium. Add amenities: dog park, BBQ areas, package lockers.",
    
    locationAnalysis: {
      walkScore: 85,
      transitScore: 45,
      bikeScore: 72,
      nearbyEmployers: ["Kaiser Permanente", "Sutter Health", "State of California"],
      demographics: "Rapid gentrification in Old North Sacramento, young professionals moving in",
      crimeGrade: "B-",
      schoolRating: 6,
      marketTrend: "Emerging - Limited apartment supply driving rent growth"
    },
    
    rentAnalysis: {
      currentRents: {
        "1BR": "$1,200 avg",
        "2BR": "$1,550 avg"
      },
      marketRents: {
        "1BR": "$1,300-1,600",
        "2BR": "$1,700-2,200"
      },
      achievableRents: {
        "1BR Renovated": "$1,550",
        "2BR Renovated": "$1,950"
      }
    },
    
    financingScenarios: [
      {
        name: "Current State (70% Occupied)",
        downPayment: 2475000,
        loanAmount: 5775000,
        rate: 6.75,
        monthlyPayment: 37462,
        cashFlow: -14135,
        cashOnCash: -6.8
      },
      {
        name: "Stabilized (95% Occupied)",
        downPayment: 2475000,
        loanAmount: 5775000,
        rate: 6.75,
        monthlyPayment: 37462,
        cashFlow: 52382,
        cashOnCash: 25.4
      }
    ],
    
    thirtyYearProjections: {
      totalCashFlow: 15000000,
      totalEquity: 9000000,
      estimatedValue: 18000000,
      totalReturn: 24000000,
      averageAnnualReturn: 32.3
    },
    
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Property 3: Imperial Beach 4-Plex
  {
    id: Date.now() + 3,
    title: "Imperial Beach 4-Plex House Hack",
    address: "562-564 11th St",
    city: "Imperial Beach",
    state: "CA",
    zipCode: "91932",
    location: "Imperial Beach, CA 91932",
    type: "House Hack",
    propertyType: "Fourplex",
    strategy: "House Hack",
    investmentStrategy: "House Hack",
    units: 4,
    isMultiFamily: true,
    price: 1800000,
    pricePerUnit: 450000,
    downPayment: 63000,
    downPaymentPercent: 3.5,
    currentCapRate: 4.8,
    capRate: 4.8,
    proFormaCapRate: 7.1,
    monthlyRent: 7200,
    projectedRent: 10700,
    rentUpside: 3500,
    monthlyCashFlow: -7675,
    proFormaCashFlow: 2500,
    cashFlow: -7675,
    totalROI: 1301,
    roi: "1301",
    status: "active",
    daysOnMarket: 3,
    confidence: "very high",
    images: ["/api/placeholder/400/300"],
    bedrooms: 9,
    bathrooms: 6,
    sqft: 3200,
    yearBuilt: 1972,
    features: ["1 Block to Beach", "FHA Eligible", "3BR Front House", "3 Income Units", "House Hack Potential", "Beachside Living"],
    description: "Ultimate house hack opportunity - live one block from the beach while tenants pay your mortgage! Front 3BR/2BA house plus three 2BR/1BA units. FHA 3.5% down eligible. Live in luxury, rent the rest, build massive wealth in paradise!",
    riskLevel: "low",
    timeframe: "Immediate",
    cashRequired: 63000,
    isDraft: false,
    listingUrl: "https://www.loopnet.com/Listing/562-564-11th-St-Imperial-Beach-CA/37184245/",
    listingSource: "LoopNet",
    
    // Financial details
    interestRate: 6.75,
    loanTerm: 30,
    monthlyPI: 11271,
    fhaMIP: 1229,
    closingCosts: 36000,
    rehabCosts: 0,
    propertyTaxes: 22500,
    insurance: 6000,
    hoaFees: 0,
    utilities: 0,
    maintenance: 7200,
    propertyManagement: 0,
    vacancy: 5,
    capitalExpenditures: 3,
    
    // Strategic Analysis
    strategicOverview: {
      title: "Beach House Hack - Live Free by the Ocean",
      summary: "Use FHA 3.5% down to control $1.8M beach property, live in paradise while building equity",
      keyPoints: [
        "Only $63,000 down payment needed with FHA",
        "Live in 3BR front house, rent 3 units for $7,200/month",
        "Rent spare bedrooms for additional $2,400/month",
        "After 1 year, move out and cash flow $2,500/month",
        "Beach property appreciation historically 6-8% annually"
      ]
    },
    
    valueAddDescription: "Year 1: Live in front house, rent 3 back units plus 2 spare bedrooms. Year 2: Move out, rent front house for $3,500. Consider Airbnb for higher returns. Add beach gear rental business. Event space rental potential.",
    
    locationAnalysis: {
      walkScore: 89,
      transitScore: 42,
      bikeScore: 95,
      nearbyEmployers: ["Naval Base Coronado", "Sharp Coronado Hospital"],
      demographics: "Military families, beach lovers, remote workers, limited beach property supply",
      crimeGrade: "B",
      schoolRating: 7,
      marketTrend: "Hot - Last affordable beach town in San Diego"
    },
    
    rentAnalysis: {
      currentRents: {
        "Front House": "Owner Occupied",
        "Back Units": "$2,400 each"
      },
      marketRents: {
        "3BR House": "$3,500",
        "2BR Units": "$2,400-2,600"
      },
      airbnbPotential: {
        "Nightly Rate": "$350-450",
        "Monthly Income": "$8,000+"
      }
    },
    
    financingScenarios: [
      {
        name: "FHA House Hack (Live-In)",
        downPayment: 63000,
        loanAmount: 1737000,
        rate: 6.75,
        monthlyPayment: 12500,
        cashFlow: -5275,
        cashOnCash: -100.4
      },
      {
        name: "Year 2+ Full Rental",
        downPayment: 63000,
        loanAmount: 1737000,
        rate: 6.75,
        monthlyPayment: 12500,
        cashFlow: 2500,
        cashOnCash: 47.6
      }
    ],
    
    thirtyYearProjections: {
      totalCashFlow: 820000,
      totalEquity: 1500000,
      estimatedValue: 3200000,
      totalReturn: 2320000,
      averageAnnualReturn: 122.5
    },
    
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Property 4: Kansas City 9-Room
  {
    id: Date.now() + 4,
    title: "Kansas City 9-Room Cash Cow",
    address: "3704 Central St",
    city: "Kansas City",
    state: "MO",
    zipCode: "64111",
    location: "Kansas City, MO 64111",
    type: "Rooming House",
    propertyType: "Rooming House",
    strategy: "Buy & Hold",
    investmentStrategy: "Buy & Hold",
    units: 9,
    isMultiFamily: false,
    price: 329000,
    pricePerUnit: 36556,
    downPayment: 82250,
    downPaymentPercent: 25,
    currentCapRate: 15.59,
    capRate: 15.59,
    proFormaCapRate: 18.5,
    monthlyRent: 7065,
    projectedRent: 9000,
    rentUpside: 1935,
    monthlyCashFlow: 2375,
    proFormaCashFlow: 3500,
    cashFlow: 2375,
    totalROI: 340,
    roi: "340",
    status: "active",
    daysOnMarket: 8,
    confidence: "very high",
    images: ["/api/placeholder/400/300"],
    bedrooms: 9,
    bathrooms: 4,
    sqft: 3168,
    yearBuilt: 1920,
    features: ["15.59% Cap Rate", "Furnished Rooms", "Near Medical District", "Month-to-Month Leases", "Travel Nurse Demand", "Corporate Housing Potential"],
    description: "Extraordinary 15.59% cap rate rooming house near major hospitals! Furnished room rental model generates $785/room with proven demand from medical professionals. Recent renovations complete. This is the cash flow opportunity of a lifetime!",
    riskLevel: "low-medium",
    timeframe: "Immediate",
    cashRequired: 82250,
    isDraft: false,
    listingUrl: "https://www.loopnet.com/Listing/3704-Central-St-Kansas-City-MO/37152173/",
    listingSource: "LoopNet",
    
    // Financial details
    interestRate: 8.0,
    loanTerm: 25,
    monthlyPI: 1900,
    closingCosts: 6600,
    rehabCosts: 0,
    propertyTaxes: 5500,
    insurance: 3600,
    hoaFees: 0,
    utilities: 7200,
    maintenance: 2147,
    propertyManagement: 7750,
    vacancy: 10,
    capitalExpenditures: 2,
    
    // Strategic Analysis
    strategicOverview: {
      title: "Medical District Rooming House Goldmine",
      summary: "Capitalize on furnished room rental premium near hospitals for exceptional returns",
      keyPoints: [
        "15.59% cap rate vs 4-6% for traditional apartments",
        "Furnished rooms command 31% premium over unfurnished",
        "Medical district location ensures constant demand",
        "Add 10th room for additional $10,800 annual income",
        "Corporate contracts possible at $1,000/room"
      ]
    },
    
    valueAddDescription: "Raise rents to market rate of $900/room. Convert common space to 10th room. Partner with hospitals for corporate housing contracts. Implement keyless entry and automated systems. Consider weekly rentals for higher returns.",
    
    locationAnalysis: {
      walkScore: 78,
      transitScore: 45,
      bikeScore: 65,
      nearbyEmployers: ["KU Medical Center", "St. Luke's Hospital", "Children's Mercy", "Research Medical"],
      demographics: "Medical professionals, students, traveling nurses, hospital visitors",
      crimeGrade: "B",
      schoolRating: 6,
      marketTrend: "Stable - Consistent medical district demand"
    },
    
    rentAnalysis: {
      currentRents: {
        "Furnished Room": "$785/month"
      },
      marketRents: {
        "Furnished Medical Housing": "$900-1,000",
        "Unfurnished Studio": "$600"
      },
      corporateRates: {
        "Hospital Contract": "$1,000-1,200/room"
      }
    },
    
    financingScenarios: [
      {
        name: "Current Operation",
        downPayment: 82250,
        loanAmount: 246750,
        rate: 8.0,
        monthlyPayment: 1900,
        cashFlow: 2375,
        cashOnCash: 34.7
      },
      {
        name: "Optimized (10 rooms @ $900)",
        downPayment: 82250,
        loanAmount: 246750,
        rate: 8.0,
        monthlyPayment: 1900,
        cashFlow: 3500,
        cashOnCash: 51.1
      }
    ],
    
    thirtyYearProjections: {
      totalCashFlow: 1080000,
      totalEquity: 450000,
      estimatedValue: 600000,
      totalReturn: 1530000,
      averageAnnualReturn: 62.0
    },
    
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Property 5: San Jose Flip
  {
    id: Date.now() + 5,
    title: "San Jose Hillside Half-Acre Flip",
    address: "2145 Mount Pleasant Rd",
    city: "San Jose",
    state: "CA",
    zipCode: "95148",
    location: "San Jose, CA 95148",
    type: "Fix & Flip",
    propertyType: "Single Family",
    strategy: "Fix & Flip",
    investmentStrategy: "Fix & Flip",
    price: 998000,
    pricePerSqFt: 503,
    downPayment: 99800,
    downPaymentPercent: 10,
    arv: 1458000,
    estimatedProfit: 134960,
    flipROI: 135,
    rehabBudget: 180000,
    holdingTime: 6,
    status: "active",
    daysOnMarket: 15,
    confidence: "high",
    images: ["/api/placeholder/400/300"],
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1985,
    lotSize: 21780,
    yearBuilt: 1930,
    features: ["Half-Acre Lot", "Hillside Privacy", "Cosmetic Rehab Only", "ADU Potential", "Silicon Valley Location", "32% Below ARV"],
    description: "Rare half-acre lot in San Jose with massive flip potential! Priced $460k below market, needs only cosmetic updates. The 21,780 sq ft lot offers development opportunities. Quick flip for $135k profit or add ADU for even bigger returns!",
    riskLevel: "medium",
    timeframe: "6 months",
    cashRequired: 150000,
    isDraft: false,
    listingUrl: "https://www.redfin.com/CA/San-Jose/2145-Mount-Pleasant-Rd-95148/home/1585858",
    listingSource: "Redfin",
    
    // Financial details
    interestRate: 10.45,
    loanTerm: 1,
    monthlyInterest: 9390,
    closingCosts: 20000,
    rehabCosts: 180000,
    propertyTaxes: 12000,
    insurance: 6000,
    utilities: 3600,
    
    // Rehab breakdown
    rehabDetails: {
      exterior: {
        paint: 10000,
        landscaping: 12000,
        porch: 8000,
        garage: 3000,
        driveway: 2000
      },
      interior: {
        paint: 12000,
        flooring: 16000,
        kitchen: 35000,
        bathrooms: 35000,
        finishing: 22000
      },
      misc: {
        staging: 8000,
        permits: 3000,
        contingency: 11000
      }
    },
    
    // Strategic Analysis
    strategicOverview: {
      title: "Silicon Valley Half-Acre Flip Opportunity",
      summary: "Capture $460k in equity through cosmetic renovation on rare half-acre lot",
      keyPoints: [
        "Half-acre lots extinct in San Jose - huge premium",
        "Cosmetic rehab only - no structural issues",
        "32% discount to ARV provides margin of safety",
        "ADU potential adds $200k to value",
        "Multiple exit strategies: flip, hold, or develop"
      ]
    },
    
    valueAddDescription: "Premium finishes throughout: white oak floors, waterfall quartz island, smart home package. Create outdoor living space with deck and fire pit. Market as 'Half-Acre Estate' to developers. Consider adding 800 sq ft ADU for $200k additional profit.",
    
    locationAnalysis: {
      walkScore: 42,
      transitScore: 28,
      bikeScore: 55,
      nearbyEmployers: ["Apple", "Google", "Meta", "Netflix"],
      demographics: "Tech professionals, established families, Silicon Valley elite",
      crimeGrade: "A",
      schoolRating: 9,
      marketTrend: "Very Hot - Silicon Valley always in demand"
    },
    
    comps: {
      recentSales: {
        "Similar Home 1": "$1,425,000",
        "Similar Home 2": "$1,485,000",
        "Similar Home 3": "$1,510,000"
      },
      avgPricePerSqFt: "$735",
      daysOnMarket: 12,
      listToSaleRatio: 1.08
    },
    
    financingScenarios: [
      {
        name: "Quick Flip (6 months)",
        investment: 150000,
        salePrice: 1458000,
        profit: 134960,
        roi: 135,
        annualizedROI: 270
      },
      {
        name: "Add ADU First",
        investment: 350000,
        salePrice: 1650000,
        profit: 285000,
        roi: 81,
        timeframe: "9 months"
      }
    ],
    
    exitStrategies: {
      flip: {
        timeline: "6 months",
        profit: 134960,
        roi: 135
      },
      holdAndRent: {
        monthlyRent: 4050,
        withADU: 6550,
        cashFlow: 2100
      },
      lotSplit: {
        potential: "Check with planning",
        estimatedValue: 2000000
      }
    },
    
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Function to add all properties
async function addAllProperties() {
  console.log('Starting to add new properties...');
  
  for (const property of newProperties) {
    try {
      const result = await createProperty(property);
      console.log(`✅ Added property: ${result.title}`);
    } catch (error) {
      console.error(`❌ Failed to add property: ${property.title}`, error);
    }
  }
  
  console.log('Finished adding all properties!');
}

// Run the script
addAllProperties().catch(console.error);