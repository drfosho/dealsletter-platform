// Static deals that appear on the dashboard
export const staticDeals = [
  {
    id: 2,
    title: "4223 Menlo Ave",
    address: "4223 Menlo Ave",
    city: "San Diego",
    state: "CA",
    zipCode: "92105",
    location: "San Diego, CA 92105",
    type: "House Hack",
    propertyType: "Single Family",
    strategy: "House Hack",
    investmentStrategy: "House Hack",
    price: 675000,
    downPayment: 23625,
    downPaymentPercent: 3.5,
    capRate: 5.2,
    proFormaCapRate: 6.1,
    monthlyRent: 5500,
    monthlyCashFlow: 1067,
    proFormaCashFlow: 1067,
    status: "active",
    daysOnMarket: 1,
    confidence: "very high",
    images: ["/api/placeholder/400/300"],
    bedrooms: 5,
    bathrooms: 3,
    sqft: 1848,
    yearBuilt: 1940,
    features: ["Separate Entrances", "Parking", "Walkable"],
    description: "5-bedroom house hack with main house + ADU. Live in one, rent the others.",
    riskLevel: "low",
    timeframe: "Immediate",
    cashRequired: 45625,
    totalROI: 28.1,
    isDraft: false,
    listingUrl: "https://www.zillow.com/homedetails/4223-Menlo-Ave-San-Diego-CA-92105/17061899_zpid/",
    listingSource: "Zillow",
    rentAnalysis: {
      currentRentPerUnit: 5500,
      marketRentPerUnit: 5500,
      monthlyRentUpside: 0,
      totalCurrentMonthlyRent: 5500,
      totalMarketMonthlyRent: 5500,
      percentRentIncrease: 0
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 3,
    title: "4738 35th Street",
    address: "4738 35th Street",
    city: "San Diego",
    state: "CA",
    zipCode: "92116",
    location: "San Diego, CA 92116",
    type: "Value-Add Duplex",
    propertyType: "Duplex",
    strategy: "BRRRR",
    investmentStrategy: "BRRRR",
    units: 2,
    isMultiFamily: true,
    price: 1150000,
    downPayment: 287500,
    downPaymentPercent: 25,
    capRate: 3.8,
    proFormaCapRate: 5.4,
    monthlyRent: 5200,
    monthlyCashFlow: 875,
    proFormaCashFlow: 875,
    status: "active",
    daysOnMarket: 0,
    confidence: "high",
    images: ["/api/placeholder/400/300"],
    bedrooms: 4,
    bathrooms: 2,
    sqft: 1650,
    yearBuilt: 1955,
    features: ["A+ Schools", "Below Market Rents", "Low Crime"],
    description: "Duplex in prime North Park location with 30% rent upside potential.",
    riskLevel: "low",
    timeframe: "3-6 months",
    cashRequired: 287500,
    totalROI: 18.5,
    isDraft: false,
    rentAnalysis: {
      currentRentPerUnit: 2600,
      marketRentPerUnit: 3380,
      monthlyRentUpside: 1560,
      totalCurrentMonthlyRent: 5200,
      totalMarketMonthlyRent: 6760,
      percentRentIncrease: 30
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 4,
    title: "3327 Cherokee Ave",
    address: "3327 Cherokee Ave",
    city: "San Diego",
    state: "CA",
    zipCode: "92104",
    location: "San Diego, CA 92104",
    type: "Premium Flip",
    propertyType: "Single Family",
    strategy: "Fix & Flip",
    investmentStrategy: "Fix & Flip",
    price: 895000,
    downPayment: 447500,
    downPaymentPercent: 50,
    arv: 1350000,
    rehabCost: 150000,
    holdingCosts: 45000,
    netProfit: 260000,
    roi: 58.1,
    status: "active",
    daysOnMarket: 0,
    confidence: "medium",
    images: ["/api/placeholder/400/300"],
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1400,
    yearBuilt: 1928,
    features: ["Corner Lot", "Original Hardwood", "Spectacular Views"],
    description: "Spanish-style home in North Park with incredible downtown views. Needs full renovation.",
    riskLevel: "medium",
    timeframe: "6-9 months",
    cashRequired: 597500,
    totalROI: 58.1,
    isDraft: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 5,
    title: "1642 Montecito Way",
    address: "1642 Montecito Way",
    city: "Ramona",
    state: "CA",
    zipCode: "92065",
    location: "Ramona, CA 92065",
    type: "Horse Property",
    propertyType: "Single Family",
    strategy: "Fix & Flip",
    investmentStrategy: "Fix & Flip",
    price: 759900,
    downPayment: 379950,
    downPaymentPercent: 50,
    arv: 1100000,
    rehabCost: 125000,
    holdingCosts: 38000,
    netProfit: 177100,
    roi: 46.6,
    status: "active",
    daysOnMarket: 1,
    confidence: "high",
    images: ["/api/placeholder/400/300"],
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2652,
    yearBuilt: 1988,
    lotSize: "3.68 acres",
    features: ["Pool/Spa", "Horse Facilities", "RV Parking", "City Views"],
    description: "3.68-acre estate with pool, spa, and horse facilities. Needs updating but solid bones.",
    riskLevel: "medium",
    timeframe: "6-9 months",
    cashRequired: 504950,
    totalROI: 46.6,
    isDraft: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 6,
    title: "236 Edgehill Dr",
    address: "236 Edgehill Dr",
    city: "La Mesa",
    state: "CA",
    zipCode: "91941",
    location: "La Mesa, CA 91941",
    type: "Value-Add Multifamily",
    propertyType: "Fourplex",
    strategy: "Buy & Hold",
    investmentStrategy: "Buy & Hold",
    units: 4,
    isMultiFamily: true,
    price: 1495000,
    downPayment: 373750,
    downPaymentPercent: 25,
    capRate: 4.2,
    proFormaCapRate: 5.8,
    monthlyRent: 7200,
    monthlyCashFlow: 1450,
    proFormaCashFlow: 1450,
    status: "active",
    daysOnMarket: 3,
    confidence: "very high",
    images: ["/api/placeholder/400/300"],
    bedrooms: 8,
    bathrooms: 4,
    sqft: 3200,
    yearBuilt: 1972,
    features: ["Recently Renovated Units", "Separate Meters", "Low Maintenance"],
    description: "Turnkey fourplex with recent renovations. Three 2BR/1BA units plus one 1BR/1BA.",
    riskLevel: "low",
    timeframe: "Immediate",
    cashRequired: 373750,
    totalROI: 15.6,
    isDraft: false,
    rentAnalysis: {
      currentRentPerUnit: 1800,
      marketRentPerUnit: 2100,
      monthlyRentUpside: 1200,
      totalCurrentMonthlyRent: 7200,
      totalMarketMonthlyRent: 8400,
      percentRentIncrease: 16.7
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 7,
    title: "1815 3rd Ave",
    address: "1815 3rd Ave",
    city: "San Diego",
    state: "CA",
    zipCode: "92101",
    location: "San Diego, CA 92101",
    type: "Downtown High-Rise",
    propertyType: "Condo",
    strategy: "Buy & Hold",
    investmentStrategy: "Buy & Hold",
    price: 875000,
    downPayment: 175000,
    downPaymentPercent: 20,
    monthlyRent: 4500,
    capRate: 3.9,
    monthlyCashFlow: 650,
    proFormaCashFlow: 650,
    status: "active",
    daysOnMarket: 0,
    confidence: "medium",
    images: ["/api/placeholder/400/300"],
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1250,
    yearBuilt: 2018,
    floor: "27th",
    features: ["City & Bay Views", "Concierge", "Gym/Pool", "High-End Finishes"],
    description: "Luxury 27th floor condo in Banker's Hill. Views of bay, airport, and Coronado Bridge.",
    riskLevel: "low",
    timeframe: "Immediate",
    cashRequired: 175000,
    totalROI: 8.9,
    hoaFees: 850,
    isDraft: false,
    rentAnalysis: {
      currentRentPerUnit: 4500,
      marketRentPerUnit: 4500,
      monthlyRentUpside: 0,
      totalCurrentMonthlyRent: 4500,
      totalMarketMonthlyRent: 4500,
      percentRentIncrease: 0
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 8,
    title: "1130 Myra Ave",
    address: "1130 Myra Ave",
    city: "Chula Vista",
    state: "CA",
    zipCode: "91911",
    location: "Chula Vista, CA 91911",
    type: "ADU Opportunity",
    propertyType: "Single Family",
    strategy: "BRRRR",
    investmentStrategy: "BRRRR",
    price: 695000,
    downPayment: 173750,
    downPaymentPercent: 25,
    capRate: 3.5,
    proFormaCapRate: 6.2,
    monthlyRent: 3200,
    proFormaCashFlow: 850,
    proFormaCashFlow2: 2100,
    status: "active",
    daysOnMarket: 1,
    confidence: "high",
    images: ["/api/placeholder/400/300"],
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1456,
    yearBuilt: 1962,
    lotSize: "6500 sq ft",
    features: ["Large Lot", "ADU Plans Approved", "New AC"],
    description: "3BR home on 6,500 sq ft lot with approved ADU plans. Projected $2,100/mo cash flow after ADU.",
    riskLevel: "medium",
    timeframe: "6-12 months",
    cashRequired: 273750,
    totalROI: 35.4,
    isDraft: false,
    rentAnalysis: {
      currentRentPerUnit: 3200,
      marketRentPerUnit: 5600,
      monthlyRentUpside: 2400,
      totalCurrentMonthlyRent: 3200,
      totalMarketMonthlyRent: 5600,
      percentRentIncrease: 75
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 9,
    title: "1642 Pentuckett Ave",
    address: "1642 Pentuckett Ave",
    city: "San Diego",
    state: "CA",
    zipCode: "92104",
    location: "San Diego, CA 92104",
    type: "BRRRR Special",
    propertyType: "Single Family",
    strategy: "BRRRR",
    investmentStrategy: "BRRRR",
    price: 625000,
    downPayment: 125000,
    downPaymentPercent: 20,
    capRate: 2.8,
    proFormaCapRate: 5.2,
    monthlyRent: 2800,
    proFormaCashFlow: 450,
    proFormaCashFlow2: 1225,
    arv: 825000,
    status: "active",
    daysOnMarket: 0,
    confidence: "very high",
    images: ["/api/placeholder/400/300"],
    bedrooms: 2,
    bathrooms: 1,
    sqft: 936,
    yearBuilt: 1941,
    features: ["Under Market Value", "Low Downpayment", "Quick Close"],
    description: "Estate sale priced $200k under market. Needs cosmetic work only. ARV $825k after $35k rehab.",
    riskLevel: "low",
    timeframe: "3-6 months",
    cashRequired: 160000,
    totalROI: 12.5,
    isDraft: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 10,
    title: "10116 Lake Ave",
    address: "10116 Lake Ave",
    city: "Tampa",
    state: "FL",
    zipCode: "33619",
    location: "Tampa, FL 33619",
    type: "Mobile Home Park",
    propertyType: "Mobile Home Park",
    strategy: "Buy & Hold",
    investmentStrategy: "Buy & Hold",
    price: 3200000,
    downPayment: 2300000,
    downPaymentPercent: 72,
    pricePerUnit: 106667,
    units: 30,
    currentCapRate: 11,
    capRate: 11,
    monthlyIncome: 36442,
    monthlyNOI: 26211,
    operatingExpenses: 10793,
    cashFlow: 22045,
    monthlyCashFlow: 22045,
    cashOnCashReturn: 11.5,
    sellerFinancing: "5% Years 1-2",
    sellerFinancingAmount: 1000000,
    monthlyPayment: 4166,
    currentAvgRent: 1215,
    marketAvgRent: 1465,
    immediateUpside: 250,
    monthToMonthUnits: 23,
    year1CashFlow: 319740,
    year1CashOnCash: 13.9,
    stabilizedCashFlow: 404532,
    stabilizedCashOnCash: 17.6,
    fiveYearCashFlow: 1900000,
    fiveYearAppreciation: 500000,
    fiveYearProfit: 2400000,
    fiveYearROI: 104,
    status: "active",
    daysOnMarket: 0,
    confidence: "high",
    images: ["/api/placeholder/400/300"],
    bedrooms: 30,
    bathrooms: 30,
    sqft: 0,
    yearBuilt: null,
    features: ["Seller Financing 5%", "100% Occupied", "$250/unit Below Market", "75% Month-to-Month"],
    description: "30 INDIVIDUAL mobile homes on single-family lots with SELLER FINANCING! All units renovated 2020-2025. Current 14% cash-on-cash grows to 17.6% by year 3. Own the homes AND land - no pad rent issues!",
    riskLevel: "low",
    timeframe: "Long-term",
    cashRequired: 2300000,
    totalROI: 11.5,
    isDraft: false,
    listingUrl: "https://www.loopnet.com/Listing/10116-Lake-Ave-Tampa-FL/29876543/",
    listingSource: "LoopNet",
    rentAnalysis: {
      currentRentPerUnit: 1215,
      marketRentPerUnit: 1400,
      monthlyRentUpside: 5550,
      totalCurrentMonthlyRent: 36442,
      totalMarketMonthlyRent: 42000,
      percentRentIncrease: 15.2
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 11,
    title: "20246 Gist Rd",
    address: "20246 Gist Rd",
    city: "Los Gatos",
    state: "CA",
    zipCode: "95033",
    location: "Los Gatos, CA 95033",
    type: "Premium Mountain Flip",
    propertyType: "Single Family",
    strategy: "Fix & Flip",
    investmentStrategy: "Fix & Flip",
    price: 899000,
    offerPrice: 950000,
    downPayment: 95000,
    downPaymentPercent: 10,
    arv: 2100000,
    arvPerSqFt: 1064,
    rehabBudget: 275000,
    hardMoneyLoan: 855000,
    totalLoanAmount: 1130000,
    interestRate: 10.45,
    holdingCosts: 95105,
    interestPayments: 67005,
    insuranceUtilitiesTaxes: 28100,
    totalCosts: 1330105,
    netProfit: 674895,
    roi: 710,
    totalROI: 710,
    annualizedROI: 947,
    kitchenRemodel: 65000,
    bathroomRemodel: 45000,
    interiorFinishes: 85000,
    exteriorCurbAppeal: 50000,
    systemsPermits: 30000,
    status: "active",
    daysOnMarket: 0,
    confidence: "high",
    images: ["/api/placeholder/400/300"],
    bedrooms: 4,
    bathrooms: 2,
    sqft: 1974,
    yearBuilt: null,
    lotSize: "2.2 Acres",
    features: ["2.2 ACRES", "Award-Winning Los Gatos Schools", "Mountain Privacy", "Tech Executive Target"],
    description: "Los Gatos mountain property on 2.2 ACRES! Needs cosmetic updating but sits in Silicon Valley's most desirable area. Comps $974-$1,510/sq ft on lots under 0.5 acres. Conservative ARV targeting $1,064/sq ft.",
    riskLevel: "medium",
    timeframe: "9 months",
    cashRequired: 95000,
    monthlyRent: 0,
    capRate: 0,
    monthlyCashFlow: 0,
    isDraft: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 12,
    title: "9638 E St",
    address: "9638 E St",
    city: "Oakland",
    state: "CA",
    zipCode: "94603",
    location: "Oakland, CA 94603",
    type: "HUD Home Flip",
    propertyType: "Single Family",
    strategy: "Fix & Flip",
    investmentStrategy: "Fix & Flip",
    price: 281000,
    downPayment: 28100,
    downPaymentPercent: 10,
    arv: 725000,
    rehabBudget: 110000,
    totalInvestment: 419100,
    netProfit: 217000,
    roi: 228,
    totalROI: 228,
    annualizedROI: 456,
    status: "active",
    daysOnMarket: 2,
    confidence: "very high",
    images: ["/api/placeholder/400/300"],
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1387,
    yearBuilt: 1955,
    features: ["HUD Home", "10% Down", "Quick Close", "Approved for 203k"],
    description: "HUD foreclosure in Mills Montclair. Priced at $281k with ARV of $725k. Needs full renovation but comps support huge profit margin. Eligible for FHA 203k loan with just 10% down!",
    riskLevel: "medium",
    timeframe: "6 months",
    cashRequired: 138100,
    monthlyRent: 0,
    capRate: 0,
    monthlyCashFlow: 0,
    isDraft: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 15,
    title: "Napa 3-Unit House Hack - Live in Wine Country Paradise!",
    address: "850 Caymus St",
    city: "Napa",
    state: "CA",
    zipCode: "94559",
    location: "Napa, CA 94559",
    type: "House Hack",
    propertyType: "Multi-Family",
    strategy: "House Hack - Live Free in Wine Country",
    investmentStrategy: "House Hack",
    units: 3,
    isMultiFamily: true,
    price: 825000,
    downPayment: 28875,
    downPaymentPercent: 3.5,
    currentCapRate: 6.1,
    capRate: 6.1,
    proFormaCapRate: 9.8,
    monthlyRent: 5600,
    projectedRent: 8100,
    proFormaCashFlow: 1260,
    monthlyCashFlow: -1240,
    rentUpside: 2500,
    status: "active",
    daysOnMarket: 0,
    confidence: "very high",
    images: ["/api/placeholder/400/300"],
    bedrooms: 5,
    bathrooms: 3,
    sqft: 2800,
    yearBuilt: 1880,
    features: [
      "Two Buildings on One Lot",
      "Warehouse with ADU Potential", 
      "5 Blocks from Downtown Napa",
      "3BR Main House + 2 Studios",
      "FHA Eligible - 3.5% Down",
      "Wine Country Premium Location",
      "Multiple Income Streams",
      "Walk to Restaurants & Wine Tasting",
      "Event Hosting Potential",
      "$2,500/mo Warehouse ADU Opportunity"
    ],
    description: "Incredible house hack in downtown Napa! Two buildings on one lot with warehouse bonus. Live in a studio while collecting $5,600/month from the main house and other studio. Just 5 blocks from downtown Napa. After warehouse ADU conversion, you'll GET PAID $1,260/month to live in wine country!",
    riskLevel: "low",
    timeframe: "immediate",
    cashRequired: 45375,
    totalROI: 190.0,  // 1900% expressed as decimal (matches other properties format)
    isDraft: false,
    listingUrl: "https://www.loopnet.com/Listing/850-Caymus-St-Napa-CA/37220526/",
    listingSource: "LoopNet",
    
    // Financial Details
    interestRate: 6.75,
    loanTerm: 30,
    monthlyPI: 5166,
    monthlyMIP: 564,
    closingCosts: 16500,
    rehabCosts: 100000,
    rehabDetails: {
      "Warehouse to ADU Conversion": 100000,
      "Move-in Ready": 0
    },
    propertyTaxes: 860,
    insurance: 250,
    hoa: 0,
    hoaFees: 0,
    utilities: 0,
    maintenance: 200,
    propertyManagement: 0,
    vacancy: 280,
    capitalExpenditures: 200,
    
    // Neighborhood & Location
    neighborhoodClass: "A",
    neighborhood: "Downtown Napa",
    lotSize: "0.25 acres",
    walkScore: 85,
    
    // Rental Analysis
    currentRent: 5600,
    cashOnCashReturn: -5.14,  // -51.4% expressed as decimal
    
    // Premium Newsletter Sections
    strategicOverview: `This is a rare house hack opportunity in the heart of Napa Valley. With just $28,875 down using an FHA loan, you can control a property with three income-producing units plus a warehouse with massive potential. Live in one studio while renting the main house and other studio for $5,600/month, covering most of your housing costs. Your net cost is only $1,240/month - cheaper than renting! The real opportunity lies in the warehouse conversion - add an ADU for $100k and you'll actually GET PAID $1,260/month to live in downtown Napa. Located just 5 blocks from downtown with restaurants, wine tasting rooms, and Oxbow Market. The 5-year projection shows $550,000 total return on your $28,875 investment - a 1,900% ROI!`,
    
    valueAddDescription: `The warehouse conversion is the hidden goldmine. For $100k (financeable through HELOC after year 1), convert to a legal ADU renting for $2,500/month. Additional value-adds: Weekend Airbnb arbitrage ($300/night), wine country event hosting ($1,000+ per event), commercial warehouse rental to winemakers ($1,500/month), or wine storage business ($2,000/month). The two-building configuration provides incredible flexibility for various income strategies.`,
    
    locationAnalysis: {
      neighborhood: "Downtown Napa",
      walkScore: 85,
      transitScore: 35,
      bikeScore: 75,
      proximityToDowntown: "5 blocks",
      proximityToHighway: "2 miles to Highway 29",
      nearbyEmployers: [
        { name: "Wine Industry", distance: "Throughout valley", employees: "45,000+" },
        { name: "Queen of the Valley Hospital", distance: "1.5 miles", employees: "2,000+" },
        { name: "Napa Valley College", distance: "3 miles", employees: "500+" }
      ],
      publicTransit: {
        busLines: ["Vine Transit Route 10", "Route 11"],
        nearestStop: "0.3 miles",
        commuteOptions: "San Francisco Ferry (Vallejo) 30 min drive"
      },
      schools: {
        elementary: "Shearer Elementary - 7/10 rating",
        middle: "Silverado Middle - 6/10 rating",
        high: "Napa High - 7/10 rating",
        district: "Napa Valley USD"
      },
      shopping: [
        { name: "Oxbow Public Market", distance: "0.5 miles", type: "Gourmet food hall" },
        { name: "First Street Napa", distance: "0.4 miles", type: "Shopping & dining" },
        { name: "Whole Foods", distance: "1.2 miles", type: "Grocery" }
      ],
      amenities: [
        "Downtown restaurants & cafes",
        "Wine tasting rooms",
        "Napa Valley Wine Train",
        "Napa River Trail",
        "Premium shopping & dining"
      ],
      demographics: {
        population: 79246,
        medianAge: 40.2,
        medianIncome: 92000,
        collegeEducated: 38,
        ownerOccupied: 58
      },
      crimeRate: "Below state average",
      futureDeveopment: "Limited due to agricultural preserve",
      appreciationHistory: "5-7% annual average last 10 years",
      marketTrends: "Limited housing supply, high demand, wine country premium"
    },
    
    rentAnalysis: {
      currentRents: {
        "Main House (3BR/2BA)": 3200,
        "Studio #1": 2400,
        "Studio #2 (Owner Occupied)": 0,
        "Warehouse": 0
      },
      marketRents: {
        "Main House": 3200,
        "Studio": 2400,
        "Warehouse ADU": 2500,
        "Airbnb Weekend": 300
      },
      rentalDemand: "Very High",
      vacancyRate: 3,
      rentGrowth: "4-5% annually",
      rentGrowthRate: 4,
      comparableRents: [
        { address: "Similar 3BR Napa", rent: 3300, sqft: 1600 },
        { address: "Studio Downtown", rent: 2200, sqft: 500 },
        { address: "2BR Unit Nearby", rent: 2800, sqft: 900 }
      ],
      totalUnits: 3,
      currentOccupancy: 100,
      currentRentPerUnit: 1867,
      marketRentPerUnit: 2700,
      monthlyRentUpside: 2500,
      totalCurrentMonthlyRent: 5600,
      totalMarketMonthlyRent: 8100,
      percentRentIncrease: 44.6
    },
    
    propertyMetrics: {
      pricePerUnit: 275000,
      pricePerSqFt: 295,
      grossRentMultiplier: 12.3,
      debtServiceCoverageRatio: 0.82,
      breakEvenOccupancy: 92,
      internalRateOfReturn: 38,
      equityMultiple: 19.0,
      paybackPeriod: 2.6
    },
    
    financingScenarios: [
      {
        name: "FHA 3.5% Down (Best for House Hack)",
        downPayment: 28875,
        loanAmount: 796125,
        rate: 6.75,
        monthlyPayment: 5730,
        cashFlow: -1240,
        totalCashNeeded: 45375,
        cashOnCashReturn: -32.8,
        totalROI: 190.0,
        note: "Live almost free in Napa Valley!"
      },
      {
        name: "Conventional 5% Down",
        downPayment: 41250,
        loanAmount: 783750,
        rate: 7.25,
        monthlyPayment: 5544,
        cashFlow: -1004,
        totalCashNeeded: 57750,
        cashOnCashReturn: -20.9,
        totalROI: 175.0
      },
      {
        name: "Conventional 20% Down",
        downPayment: 165000,
        loanAmount: 660000,
        rate: 7.0,
        monthlyPayment: 4391,
        cashFlow: 169,
        totalCashNeeded: 181500,
        cashOnCashReturn: 1.1,
        totalROI: 95.0,
        note: "Positive cash flow from day 1"
      }
    ],
    
    thirtyYearProjections: {
      assumptions: {
        rentGrowthRate: 3,
        expenseGrowthRate: 2.5,
        appreciationRate: 5,
        vacancyRate: 5,
        managementFee: 0,
        maintenanceRate: 5,
        capExRate: 5
      },
      projections: [
        { year: 1, cashFlow: -14880, cumulativeCashFlow: -14880, propertyValue: 866250, equity: 69125, loanBalance: 797125, totalROI: -32.8 },
        { year: 2, cashFlow: 15120, cumulativeCashFlow: 255, propertyValue: 909563, equity: 212438, loanBalance: 697125, totalROI: 33.4, note: "Warehouse ADU complete" },
        { year: 3, cashFlow: 15876, cumulativeCashFlow: 16131, propertyValue: 955041, equity: 259916, loanBalance: 695125, totalROI: 55.5 },
        { year: 5, cashFlow: 17500, cumulativeCashFlow: 51631, propertyValue: 1052622, equity: 361497, loanBalance: 691125, totalROI: 113.8 },
        { year: 10, cashFlow: 22750, cumulativeCashFlow: 165381, propertyValue: 1344589, equity: 668464, loanBalance: 676125, totalROI: 364.2 },
        { year: 20, cashFlow: 36400, cumulativeCashFlow: 455381, propertyValue: 2194481, equity: 1568356, loanBalance: 626125, totalROI: 1584.2 },
        { year: 30, cashFlow: 58240, cumulativeCashFlow: 925381, propertyValue: 3569906, equity: 3569906, loanBalance: 0, totalROI: 3204.9 }
      ],
      totalRentalIncome: 2016000,
      totalCashFlow: 925381,
      principalPaydown: 796125,
      propertyAppreciation: 2744906,
      totalReturn: 4466412,
      averageAnnualReturn: 148880,
      totalROI: 883.0,
      equityAtYear30: 3569906
    },
    
    marketAnalysis: {
      comparables: [
        { address: "Similar 3-unit Napa", price: 950000, sqft: 2600, pricePerSqFt: 365, soldDate: "2 months ago" },
        { address: "Downtown duplex", price: 750000, sqft: 2000, pricePerSqFt: 375, soldDate: "1 month ago" },
        { address: "4-plex nearby", price: 1100000, sqft: 3200, pricePerSqFt: 344, soldDate: "3 months ago" }
      ],
      medianPrice: 825000,
      medianPricePerSqFt: 361,
      priceGrowth: 7,
      priceGrowthYoY: "7% Year over Year",
      daysOnMarket: 25,
      averageDaysOnMarket: 28,
      inventoryLevel: "0.8 months supply",
      inventoryTrend: "Declining",
      buyerDemand: "Very High",
      sellerMarket: true,
      sellerConcessions: "Rare in this market",
      marketTemperature: "Hot",
      seasonality: "Peak season spring/summer",
      economicFactors: [
        "Wine tourism driving demand",
        "Tech worker migration from Bay Area",
        "Limited new construction",
        "Agricultural preserve restricts development"
      ],
      forecast: "Continued appreciation 5-7% annually",
      investmentGrade: "A"
    },
    
    rehabAnalysis: {
      immediate: {
        scope: "Move-in ready",
        items: [],
        cost: 0,
        timeline: "Immediate"
      },
      phase1: {
        scope: "Warehouse Planning",
        items: [
          { item: "Architectural plans", cost: 8000 },
          { item: "Permits & approvals", cost: 7000 }
        ],
        cost: 15000,
        timeline: "6 months",
        roi: "N/A - Planning phase"
      },
      phase2: {
        scope: "Warehouse to ADU Conversion",
        items: [
          { item: "Framing & structure", cost: 25000 },
          { item: "Plumbing & electrical", cost: 30000 },
          { item: "Kitchen & bath", cost: 25000 },
          { item: "Finishes & flooring", cost: 20000 }
        ],
        cost: 100000,
        timeline: "4-6 months",
        roi: "30% cash-on-cash return",
        monthlyRentIncrease: 2500
      },
      phase3: {
        scope: "Amenity Upgrades",
        items: [
          { item: "Landscape design", cost: 25000 },
          { item: "Event space setup", cost: 15000 }
        ],
        cost: 40000,
        timeline: "Year 3",
        roi: "Event income $1000+/event"
      },
      totalBudget: 155000,
      postRehabValue: 1100000,
      valueAdd: 275000,
      rehabROI: 177
    },
    
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 16,
    title: "Oakland 5-Plex - CASH FLOW MONSTER in Opportunity Zone!",
    address: "2023 80th Ave",
    city: "Oakland",
    state: "CA",
    zipCode: "94621",
    location: "Oakland, CA 94621",
    type: "Multi-Family Investment",
    propertyType: "Multi-Family",
    strategy: "Buy & Hold with Value-Add",
    investmentStrategy: "Buy & Hold",
    units: 5,
    isMultiFamily: true,
    price: 1100000,
    downPayment: 275000,
    downPaymentPercent: 25,
    currentCapRate: 8.90,
    capRate: 8.90,
    proFormaCapRate: 9.9,
    monthlyRent: 9476,
    currentRent: 9476,
    projectedRent: 14000,
    proFormaCashFlow: 3688,
    monthlyCashFlow: 2876,
    rentUpside: 4524,
    status: "active",
    daysOnMarket: 0,
    confidence: "high",
    images: ["/api/placeholder/400/300"],
    bedrooms: 10,
    bathrooms: 6,
    sqft: null,
    yearBuilt: 1963,
    features: [
      "8.90% Cap Rate - Exceptional!",
      "Federal Opportunity Zone - Tax Benefits",
      "1:1 Parking Ratio - Rare!",
      "One Vacant Unit - Immediate Upside",
      "Park Location - Next to Arroyo Viejo Park",
      "$220,000 per unit",
      "0.14 Acre Lot - ADU Potential",
      "Gated Parking Lot",
      "Strong Rental Demand",
      "Below Replacement Cost"
    ],
    description: "East Oakland property delivering an incredible 8.90% cap rate with immediate upside! Located in a federal Opportunity Zone with tax benefits, featuring 1:1 parking, and one vacant unit ready for rent increase. At just $220k/unit with strong cash flow, this is a rare Oakland opportunity!",
    riskLevel: "medium",
    timeframe: "immediate",
    cashRequired: 275000,
    totalROI: 285,
    cashOnCashReturn: 12.5,
    cashFlow: 34512,
    isDraft: false,
    listingUrl: "https://www.loopnet.com/Listing/2023-80th-Ave-Oakland-CA/37275325/",
    listingSource: "LoopNet",
    
    // Financial Details
    interestRate: 7.25,
    loanTerm: 30,
    loanAmount: 825000,
    monthlyPI: 5632,
    closingCosts: 22000,
    rehabCosts: 100000,
    rehabDetails: {
      "ADU Addition (750 SF)": 100000,
      "Security Cameras": 5000,
      "Deferred Maintenance": 15000,
      "Unit Improvements": 20000
    },
    propertyTaxes: 1146,
    insurance: 458,
    hoa: 0,
    hoaFees: 0,
    utilities: 200,
    maintenance: 550,
    propertyManagement: 1050,
    vacancy: 656,
    capitalExpenditures: 558,
    operatingExpenses: 4568,
    monthlyExpenses: 4568,
    annualExpenses: 54819,
    netOperatingIncome: 102093,
    
    // Unit Mix and Rent Details
    unitMix: {
      "2BR/1BA Units (4)": {
        quantity: 4,
        currentRent: 2369,
        marketRent: 2600,
        totalCurrent: 9476,
        totalMarket: 10400
      },
      "4BR/2BA Unit": {
        quantity: 1,
        currentRent: 0,
        marketRent: 3600,
        totalCurrent: 0,
        totalMarket: 3600
      }
    },
    
    // Opportunity Zone Benefits
    opportunityZoneBenefits: {
      taxDeferral: "Defer capital gains taxes",
      year5Reduction: "10% reduction in tax basis",
      year7Reduction: "15% reduction in tax basis",
      year10Benefit: "ZERO taxes on appreciation after 10 years",
      exampleSavings: {
        capitalGain: 100000,
        year5Savings: 1500,
        year7Savings: 2500,
        year10AppreciationValue: 1900000,
        year10TaxSavings: 190000,
        note: "Based on 23.8% capital gains rate"
      }
    },
    
    // Neighborhood & Location
    neighborhoodClass: "C",
    neighborhood: "East Oakland",
    lotSize: "0.14 acres",
    walkScore: 65,
    
    // Location Analysis
    locationAnalysis: {
      neighborhood: "East Oakland",
      walkScore: 65,
      transitScore: 45,
      bikeScore: 60,
      proximityToDowntown: "7 miles to Downtown Oakland",
      proximityToHighway: "1 mile to I-580",
      nearbyEmployers: [
        { name: "Oakland International Airport", distance: "5 miles", employees: "10,000+" },
        { name: "Kaiser Permanente", distance: "8 miles", employees: "15,000+" },
        { name: "Port of Oakland", distance: "10 miles", employees: "5,000+" }
      ],
      publicTransit: {
        busLines: ["AC Transit Lines 45, 46, 73"],
        nearestStop: "0.2 miles",
        commuteOptions: "BART Coliseum Station 3 miles"
      },
      schools: {
        elementary: "East Oakland Pride Elementary - 0.5 miles",
        middle: "Frick Academy - 0.7 miles",
        high: "Castlemont High - 0.9 miles",
        district: "Oakland USD"
      },
      shopping: [
        { name: "Eastmont Town Center", distance: "1.5 miles", type: "Shopping Center" },
        { name: "Foothill Square", distance: "2 miles", type: "Retail" },
        { name: "Walmart", distance: "2.5 miles", type: "Grocery" }
      ],
      amenities: [
        "Arroyo Viejo Park - Next Door!",
        "Recreation Center - Community Hub",
        "AC Transit Lines",
        "Eastmont Town Center",
        "Working Family Neighborhood"
      ],
      demographics: {
        population: 35000,
        medianAge: 35,
        medianIncome: 55000,
        collegeEducated: 22,
        ownerOccupied: 35
      },
      crimeRate: "Higher than Oakland average",
      futureDeveopment: "Limited new construction",
      appreciationHistory: "3-5% annual average",
      marketTrends: "Strong rental demand, affordable for working families, improving neighborhood"
    },
    
    // Rental Analysis
    rentAnalysis: {
      currentRents: {
        "Unit 1 (2BR/1BA)": 2369,
        "Unit 2 (2BR/1BA)": 2369,
        "Unit 3 (4BR/2BA)": 0,
        "Unit 4 (2BR/1BA)": 2369,
        "Unit 5 (2BR/1BA)": 2369
      },
      marketRents: {
        "2BR/1BA": 2600,
        "4BR/2BA": 3600,
        "ADU (750 SF)": 1800,
        "Parking Space": 100,
        "RV/Boat Storage": 200
      },
      rentalDemand: "Very Strong",
      vacancyRate: 5,
      rentGrowth: "3-4% annually",
      rentGrowthRate: 3.5,
      comparableRents: [
        { address: "Similar 2BR East Oakland", rent: 2550, sqft: 900 },
        { address: "4BR House Nearby", rent: 3500, sqft: 1400 },
        { address: "2BR Unit Complex", rent: 2650, sqft: 850 }
      ],
      totalUnits: 5,
      currentOccupancy: 80,
      proFormaOccupancy: 95,
      currentRentPerUnit: 1895,
      marketRentPerUnit: 2800,
      monthlyRentUpside: 4524,
      percentRentIncrease: 47.7,
      averageCurrentRent: 1895,
      averageMarketRent: 2800,
      totalCurrentMonthlyRent: 9476,
      totalMarketMonthlyRent: 14000
    },
    
    // Property Metrics
    propertyMetrics: {
      pricePerUnit: 220000,
      pricePerSqFt: null,
      grossRentMultiplier: 9.7,
      currentGrossRentMultiplier: 9.7,
      proFormaGrossRentMultiplier: 6.5,
      debtServiceCoverageRatio: 1.51,
      breakEvenOccupancy: 65,
      internalRateOfReturn: 22,
      equityMultiple: 3.85,
      paybackPeriod: 8.0,
      currentYield: 8.90,
      proFormaYield: 9.9
    },
    
    // Investment Scenarios
    investmentScenarios: {
      conservative: {
        name: "As-Is + Vacant Unit Only",
        strategy: "Lease vacant unit, keep current rents",
        monthlyIncome: 13076,
        annualIncome: 156912,
        netOperatingIncome: 102093,
        capRate: 9.3,
        monthlyCashFlow: 2876,
        cashFlow: 34512,
        cashOnCashReturn: 12.5,
        totalROI: 125
      },
      realistic: {
        name: "Bring All Units to Market",
        strategy: "Market rents + parking income",
        monthlyIncome: 14000,
        annualIncome: 168000,
        netOperatingIncome: 109200,
        capRate: 9.9,
        monthlyCashFlow: 3688,
        cashFlow: 44256,
        cashOnCashReturn: 16.1,
        totalROI: 161
      },
      aggressive: {
        name: "Full Optimization with ADU",
        strategy: "Market rents + ADU + maximize all income",
        monthlyIncome: 16300,
        annualIncome: 195600,
        netOperatingIncome: 127140,
        capRate: 11.6,
        monthlyCashFlow: 5400,
        cashFlow: 65000,
        cashOnCashReturn: 20,
        totalROI: 200,
        additionalInvestment: 100000
      }
    },
    
    // Value Add Strategies
    valueAddStrategies: [
      {
        strategy: "Lease Vacant Unit IMMEDIATELY",
        description: "Unit 3 (4BR/2BA) currently vacant. Market rent $3,600/month",
        investment: 0,
        annualIncomeIncrease: 43200,
        roiImpact: "Increases NOI instantly"
      },
      {
        strategy: "Bring ALL Units to Market Rents",
        description: "2BR units from $2,369 to $2,600 (+$231 each), 4BR to $3,600",
        investment: 5000,
        monthlyIncomeIncrease: 4524,
        annualIncomeIncrease: 54288,
        newCapRate: 9.9
      },
      {
        strategy: "ADU Addition",
        description: "Build 750 SF ADU on 0.14 acre lot",
        investment: 100000,
        monthlyRent: 1800,
        annualIncomeIncrease: 21600,
        valueIncrease: 250000
      },
      {
        strategy: "Parking Income",
        description: "Rent extra spaces and RV/boat storage",
        investment: 2000,
        monthlyIncome: 500,
        annualIncomeIncrease: 6000
      },
      {
        strategy: "Opportunity Zone Tax Strategy",
        description: "Maximize tax benefits through long-term hold",
        taxSavings: "Defer gains, 10-15% reduction, zero taxes on appreciation after 10 years",
        tenYearProjectedValue: 1900000,
        taxFreeProfits: 800000
      }
    ],
    
    // 5-Year Investment Plan
    fiveYearPlan: {
      year1: {
        action: "Stabilize - Lease vacant 4BR unit",
        monthlyIncome: 13076,
        cashFlow: 34512,
        propertyValue: 1155000
      },
      year2to3: {
        action: "Optimize - Raise rents to market, add parking income",
        monthlyIncome: 14500,
        cashFlow: 50000,
        propertyValue: 1270000
      },
      year4to5: {
        action: "Expand - Consider ADU addition",
        monthlyIncome: 16000,
        cashFlow: 65000,
        propertyValue: 1885000
      },
      exitValue: 1885000,
      totalProfit: 785000,
      fiveYearROI: 285
    },
    
    // 30-Year Projections
    thirtyYearProjections: {
      assumptions: {
        rentGrowthRate: 3.5,
        expenseGrowthRate: 2.5,
        appreciationRate: 4,
        vacancyRate: 5,
        managementFee: 8,
        maintenanceRate: 10,
        capExRate: 10
      },
      projections: [
        { 
          year: 1,
          grossRent: 113712,
          vacancy: 5686,
          effectiveRent: 108026,
          expenses: 54819,
          netOperatingIncome: 53207,
          debtService: 67584,
          cashFlow: -14377,
          cumulativeCashFlow: -14377,
          propertyValue: 1144000,
          loanBalance: 817460,
          equity: 326540,
          principalPaydown: 7540,
          totalReturn: 19163,
          totalROI: 7.0,
          note: "With vacant unit leased"
        },
        { 
          year: 2,
          grossRent: 156912,
          vacancy: 7846,
          effectiveRent: 149066,
          expenses: 56189,
          netOperatingIncome: 92877,
          debtService: 67584,
          cashFlow: 25293,
          cumulativeCashFlow: 10916,
          propertyValue: 1189760,
          loanBalance: 809633,
          equity: 380127,
          principalPaydown: 7827,
          totalReturn: 93880,
          totalROI: 34.1,
          note: "Full occupancy achieved"
        },
        { 
          year: 3,
          grossRent: 162403,
          vacancy: 8120,
          effectiveRent: 154283,
          expenses: 57594,
          netOperatingIncome: 96689,
          debtService: 67584,
          cashFlow: 29105,
          cumulativeCashFlow: 40021,
          propertyValue: 1237350,
          loanBalance: 801509,
          equity: 435841,
          principalPaydown: 8124,
          totalReturn: 148635,
          totalROI: 54.0
        },
        { 
          year: 5,
          grossRent: 173936,
          vacancy: 8697,
          effectiveRent: 165239,
          expenses: 60484,
          netOperatingIncome: 104755,
          debtService: 67584,
          cashFlow: 37171,
          cumulativeCashFlow: 107485,
          propertyValue: 1338226,
          loanBalance: 784543,
          equity: 553683,
          principalPaydown: 8755,
          totalReturn: 293908,
          totalROI: 106.9
        },
        { 
          year: 10,
          grossRent: 218965,
          vacancy: 10948,
          effectiveRent: 208017,
          expenses: 68446,
          netOperatingIncome: 139571,
          debtService: 67584,
          cashFlow: 71987,
          cumulativeCashFlow: 434322,
          propertyValue: 1628895,
          loanBalance: 736425,
          equity: 892470,
          principalPaydown: 11062,
          totalReturn: 783267,
          totalROI: 284.8
        },
        { 
          year: 15,
          grossRent: 275734,
          vacancy: 13787,
          effectiveRent: 261947,
          expenses: 77491,
          netOperatingIncome: 184456,
          debtService: 67584,
          cashFlow: 116872,
          cumulativeCashFlow: 908574,
          propertyValue: 1982134,
          loanBalance: 672887,
          equity: 1309247,
          principalPaydown: 13978,
          totalReturn: 1626295,
          totalROI: 591.4
        },
        { 
          year: 20,
          grossRent: 347276,
          vacancy: 17364,
          effectiveRent: 329912,
          expenses: 87721,
          netOperatingIncome: 242191,
          debtService: 67584,
          cashFlow: 174607,
          cumulativeCashFlow: 1608314,
          propertyValue: 2413797,
          loanBalance: 590194,
          equity: 1823603,
          principalPaydown: 17664,
          totalReturn: 2818589,
          totalROI: 1024.9
        },
        { 
          year: 25,
          grossRent: 437339,
          vacancy: 21867,
          effectiveRent: 415472,
          expenses: 99335,
          netOperatingIncome: 316137,
          debtService: 67584,
          cashFlow: 248553,
          cumulativeCashFlow: 2576994,
          propertyValue: 2940199,
          loanBalance: 483719,
          equity: 2456480,
          principalPaydown: 22315,
          totalReturn: 4481959,
          totalROI: 1629.8
        },
        { 
          year: 30,
          grossRent: 550761,
          vacancy: 27538,
          effectiveRent: 523223,
          expenses: 112510,
          netOperatingIncome: 410713,
          debtService: 67584,
          cashFlow: 343129,
          cumulativeCashFlow: 3901204,
          propertyValue: 3581642,
          loanBalance: 0,
          equity: 3581642,
          principalPaydown: 67584,
          totalReturn: 6757846,
          totalROI: 2457.4
        }
      ]
    },
    
    // Strategic Overview
    strategicOverview: `This East Oakland property delivers an exceptional 8.90% cap rate with immediate upside! Located in a federal Opportunity Zone with massive tax benefits, featuring 1:1 parking (rare in Oakland), and one vacant unit ready for immediate lease-up. At just $220k/unit with strong cash flow from day one, this property offers the rare combination of immediate cash flow (12.5%) with massive tax advantages and appreciation potential. The vacant 4BR/2BA unit can be leased immediately for $3,600/month, boosting annual income by $43,200. With market rents $500+ below current, bringing all units to market rates increases cash flow to $3,688/month (16.1% cash-on-cash). The 0.14 acre lot allows for ADU addition, potentially adding $1,800/month in rental income. Opportunity Zone benefits include tax deferral, 10-15% reduction in basis, and ZERO taxes on appreciation after 10 years. Perfect for investors who want immediate 12%+ returns, have capital gains to defer, understand East Oakland dynamics, can manage tenant transitions, and think long-term wealth plus tax benefits.`,
    
    // Risk Analysis
    riskAnalysis: {
      strengths: [
        "✅ 8.90% cap rate (exceptional!)",
        "✅ Opportunity Zone tax benefits",
        "✅ 1:1 parking ratio (rare!)",
        "✅ Vacant unit = immediate upside",
        "✅ Park location premium",
        "✅ Only $220k/unit",
        "✅ Strong rental demand",
        "✅ Below replacement cost",
        "✅ Limited new construction",
        "✅ Improving neighborhood"
      ],
      considerations: [
        "❌ East Oakland location",
        "❌ Class C building (1963)",
        "❌ Higher crime area",
        "❌ Tenant quality concerns",
        "❌ Deferred maintenance likely"
      ],
      mitigations: [
        "Screen tenants carefully",
        "Install security cameras",
        "Regular property maintenance",
        "Build community relationships",
        "Professional management",
        "Security deposits and guarantors",
        "Regular property inspections",
        "Maintain property insurance",
        "Build reserve fund",
        "Work with local police"
      ]
    },
    
    // Due Diligence Items
    dueDiligenceItems: [
      "Full property inspection",
      "Review all current leases",
      "Verify actual rents collected",
      "Check tenant payment history",
      "Environmental assessment",
      "Title and survey review",
      "Verify Opportunity Zone designation",
      "Review utility costs",
      "Check for code violations",
      "Assess deferred maintenance",
      "Review property tax history",
      "Verify insurance costs",
      "Check zoning for ADU",
      "Crime statistics review",
      "Market rent survey"
    ],
    
    // Exit Strategies
    exitStrategies: [
      {
        strategy: "5-Year Value-Add Exit",
        description: "Maximize rents, add ADU, sell at 7% cap rate for $1,885,000",
        timeline: "5 years",
        estimatedProfit: 785000,
        projectedValue: 1885000,
        roi: 285
      },
      {
        strategy: "10-Year Opportunity Zone Hold",
        description: "Hold for full tax benefits with zero taxes on $800,000 appreciation",
        timeline: "10 years",
        estimatedProfit: 800000,
        projectedValue: 1900000,
        taxFreeGains: 800000
      },
      {
        strategy: "Refinance & Hold",
        description: "Cash-out refinance after value-add improvements to pull out $350,000",
        timeline: "2-3 years",
        estimatedProfit: 350000,
        newValue: 1500000,
        cashOut: 350000,
        continuedCashFlow: 4000
      },
      {
        strategy: "1031 Exchange",
        description: "Trade up to 8-12 unit building with $500,000 in deferred gains",
        timeline: "3-5 years",
        estimatedProfit: 500000,
        deferredGains: 500000,
        nextProperty: "8-12 unit building"
      }
    ],
    
    // Investment Thesis
    investmentThesis: {
      keyPoints: [
        "Exceptional 8.90% cap rate in strong rental market",
        "Opportunity Zone provides massive tax advantages",
        "Immediate upside with vacant unit ready for lease",
        "Below replacement cost at $220k/unit",
        "Strong rental demand from working families",
        "1:1 parking ratio is huge competitive advantage",
        "Multiple value-add opportunities (ADU, parking, rent increases)",
        "Park location provides neighborhood stability"
      ],
      idealInvestor: "Cash flow focused investors with capital gains to defer who understand value-add opportunities and can handle East Oakland management",
      holdPeriod: "5-10 years for maximum returns",
      expectedReturns: "12.5% immediate, 16%+ after optimization, 20%+ with ADU"
    },
    
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 17,
    title: "Sacramento 5-Plex - CASH COW with 9.3% Cap Rate!",
    address: "5341 Young St",
    city: "Sacramento",
    state: "CA",
    zipCode: "95824",
    location: "Sacramento, CA 95824",
    type: "Multi-Family Investment",
    propertyType: "Multi-Family",
    strategy: "Buy & Hold with Value-Add",
    investmentStrategy: "Buy & Hold",
    units: 5,
    isMultiFamily: true,
    price: 728000,
    downPayment: 182000,
    downPaymentPercent: 25,
    currentCapRate: 9.29,
    capRate: 9.29,
    proFormaCapRate: 11,
    monthlyRent: 6655,
    currentRent: 6655,
    projectedRent: 8050,
    proFormaCashFlow: 3302,
    monthlyCashFlow: 1907,
    rentUpside: 1395,
    status: "active",
    daysOnMarket: 0,
    confidence: "very high",
    images: ["/api/placeholder/400/300"],
    bedrooms: 6,
    bathrooms: 6,
    sqft: null,
    yearBuilt: 1979,
    features: [
      "9.29% Cap Rate - Phenomenal!",
      "Federal Opportunity Zone - Tax Benefits",
      "100% Occupied - Fully Stabilized",
      "15.4% Expense Ratio - Incredibly Low!",
      "$145,600 per unit",
      "Near Highway 99 & I-5",
      "State Capital Stability",
      "Growing Tech Sector",
      "5%+ Annual Rent Growth",
      "2-Story Unit with Laundry"
    ],
    description: "Fruitridge Manor property delivering an outstanding 9.29% cap rate with 100% occupancy! Located in an Opportunity Zone with extremely low expenses (15% ratio), this fully stabilized asset offers immediate cash flow with room for rent growth. At just $145,600/unit, this is Sacramento investing at its finest!",
    riskLevel: "low",
    timeframe: "immediate",
    cashRequired: 182000,
    totalROI: 262,
    cashOnCashReturn: 12.6,
    cashFlow: 22884,
    isDraft: false,
    listingUrl: "https://www.loopnet.com/Listing/5341-Young-St-Sacramento-CA/37264186/",
    listingSource: "LoopNet",
    
    // Financial Details
    interestRate: 7.25,
    loanTerm: 30,
    loanAmount: 546000,
    monthlyPI: 3726,
    closingCosts: 14560,
    rehabCosts: 15000,
    rehabDetails: {
      "RUBS Implementation": 0,
      "Coin-Operated Laundry": 5000,
      "Storage Units Construction": 5000,
      "Security Improvements": 5000
    },
    propertyTaxes: 758,
    insurance: 303,
    hoa: 0,
    hoaFees: 0,
    utilities: 400,
    maintenance: 364,
    propertyManagement: 532,
    vacancy: 333,
    capitalExpenditures: 200,
    operatingExpenses: 1022,
    monthlyExpenses: 1022,
    annualExpenses: 12260,
    netOperatingIncome: 67600,
    
    // Unit Mix and Rent Details
    unitMix: {
      "Unit 1 (1BR)": {
        quantity: 1,
        currentRent: 1300,
        marketRent: 1550,
        totalCurrent: 1300,
        totalMarket: 1550
      },
      "Unit 2 (1BR)": {
        quantity: 1,
        currentRent: 1195,
        marketRent: 1550,
        totalCurrent: 1195,
        totalMarket: 1550
      },
      "Unit 3 (1BR)": {
        quantity: 1,
        currentRent: 1450,
        marketRent: 1550,
        totalCurrent: 1450,
        totalMarket: 1550
      },
      "Unit 4 (1BR)": {
        quantity: 1,
        currentRent: 1400,
        marketRent: 1550,
        totalCurrent: 1400,
        totalMarket: 1550
      },
      "Unit 5 (2BR/2BA)": {
        quantity: 1,
        currentRent: 1310,
        marketRent: 1850,
        totalCurrent: 1310,
        totalMarket: 1850
      }
    },
    
    // Opportunity Zone Benefits
    opportunityZoneBenefits: {
      taxDeferral: "Defer capital gains taxes",
      year5Reduction: "10% reduction in tax basis",
      year7Reduction: "15% reduction in tax basis",
      year10Benefit: "ZERO taxes on appreciation after 10 years",
      note: "TAX-FREE WEALTH BUILDING"
    },
    
    // Neighborhood & Location
    neighborhoodClass: "C",
    neighborhood: "Fruitridge Manor",
    lotSize: null,
    walkScore: null,
    
    // Location Analysis
    locationAnalysis: {
      neighborhood: "Fruitridge Manor",
      proximityToHighway: "Near Highway 99 & I-5",
      nearbyEmployers: [
        { name: "State of California", distance: "Downtown", employees: "75,000+" },
        { name: "UC Davis Medical Center", distance: "5 miles", employees: "10,000+" },
        { name: "Intel Folsom", distance: "20 miles", employees: "6,000+" },
        { name: "Kaiser Permanente", distance: "3 miles", employees: "5,000+" }
      ],
      publicTransit: {
        busLines: ["Multiple SacRT routes"],
        nearestStop: "Within walking distance",
        commuteOptions: "Blue Line light rail access"
      },
      schools: {
        note: "Multiple schools within 1 mile",
        elementary: "Within 1 mile",
        middle: "Within 1 mile",
        high: "Within 1 mile",
        district: "Sacramento City USD"
      },
      shopping: [
        { name: "Florin Towne Centre", distance: "Nearby", type: "Shopping Center" },
        { name: "Local shops", distance: "Walking distance", type: "Retail" }
      ],
      amenities: [
        "Near Highway 99 & I-5",
        "Florin Towne Centre nearby",
        "Multiple schools within 1 mile",
        "Several parks nearby",
        "Blue Line light rail access"
      ],
      demographics: {
        marketNote: "Working-class area",
        stateCapitalStability: true,
        growingTechSector: true,
        housingShortageSeverity: "High",
        populationGrowth: "Positive",
        rentGrowthRate: "5%+ annually"
      },
      marketTrends: "State capital stability, growing tech sector, housing shortage, population growth, 5%+ annual rent growth"
    },
    
    // Rental Analysis
    rentAnalysis: {
      currentRents: {
        "Unit 1 (1BR)": 1300,
        "Unit 2 (1BR)": 1195,
        "Unit 3 (1BR)": 1450,
        "Unit 4 (1BR)": 1400,
        "Unit 5 (2BR/2BA)": 1310
      },
      marketRents: {
        "1BR": 1550,
        "2BR/2BA": 1850,
        "Laundry Income (per machine)": 150,
        "Storage Unit": 50
      },
      rentalDemand: "Very High",
      vacancyRate: 0,
      currentOccupancy: 100,
      rentGrowth: "5%+ annually",
      rentGrowthRate: 5,
      totalUnits: 5,
      proFormaOccupancy: 95,
      marketRentIncrease: 1395,
      percentIncrease: 21,
      comparableRents: [
        { address: "Similar 1BR Fruitridge", rent: 1500, sqft: 650 },
        { address: "2BR Fruitridge Manor", rent: 1800, sqft: 900 },
        { address: "1BR Near Florin", rent: 1600, sqft: 700 }
      ],
      currentRentPerUnit: 1331,
      marketRentPerUnit: 1610,
      monthlyRentUpside: 1395,
      percentRentIncrease: 21,
      averageCurrentRent: 1331,
      averageMarketRent: 1610,
      totalCurrentMonthlyRent: 6655,
      totalMarketMonthlyRent: 8050
    },
    
    // Property Metrics
    propertyMetrics: {
      pricePerUnit: 145600,
      pricePerSqFt: null,
      grossRentMultiplier: 9.1,
      currentGrossRentMultiplier: 9.1,
      proFormaGrossRentMultiplier: 7.5,
      debtServiceCoverageRatio: 1.51,
      breakEvenOccupancy: 70,
      internalRateOfReturn: 25,
      equityMultiple: 3.62,
      paybackPeriod: 8.0,
      currentYield: 9.29,
      proFormaYield: 11,
      expenseRatio: 15.4,
      note: "Exceptionally low expense ratio!",
      annualizedReturn: 26.2,
      monthlyNOI: 5633,
      annualGrossIncome: 79860,
      effectiveGrossIncome: 79860,
      netOperatingIncome: 67600
    },
    
    // Investment Scenarios
    investmentScenarios: {
      conservative: {
        name: "As-Is Operations",
        strategy: "Keep current operations, maintain occupancy",
        monthlyIncome: 6655,
        annualIncome: 79860,
        netOperatingIncome: 67600,
        capRate: 9.29,
        monthlyCashFlow: 1907,
        cashFlow: 22884,
        cashOnCashReturn: 12.6,
        totalROI: 126
      },
      realistic: {
        name: "Optimized with RUBS",
        strategy: "Market rents + RUBS + laundry income",
        monthlyIncome: 8050,
        annualIncome: 96600,
        netOperatingIncome: 84340,
        capRate: 11.6,
        monthlyCashFlow: 3302,
        cashFlow: 39624,
        cashOnCashReturn: 21.8,
        totalROI: 218
      },
      aggressive: {
        name: "Full Value-Add",
        strategy: "All improvements + maximum rents",
        monthlyIncome: 8500,
        annualIncome: 102000,
        netOperatingIncome: 86700,
        capRate: 11.9,
        monthlyCashFlow: 3750,
        cashFlow: 45000,
        cashOnCashReturn: 25,
        totalROI: 250
      }
    },
    
    // Value Add Strategies
    valueAddStrategies: [
      {
        strategy: "RUBS Implementation",
        description: "Currently tenants pay NO utilities! Implement water/sewer/trash billing",
        investment: 0,
        monthlySavings: 400,
        annualSavings: 4800,
        roiImpact: "Reduces expenses by 40%, instant NOI boost"
      },
      {
        strategy: "Laundry Income",
        description: "Add coin-operated laundry - 2 machines",
        investment: 5000,
        monthlyIncome: 300,
        annualIncome: 3600,
        firstYearROI: 72
      },
      {
        strategy: "Storage/Parking",
        description: "Build storage units and maximize lot usage",
        investment: 5000,
        monthlyIncome: 250,
        annualIncome: 3000,
        units: 5,
        rentPerUnit: 50
      },
      {
        strategy: "Rent Optimization",
        description: "Bring all units to market rent",
        investment: 0,
        monthlyIncomeIncrease: 1395,
        annualIncomeIncrease: 16740,
        percentIncrease: 21
      },
      {
        strategy: "Opportunity Zone Benefits",
        description: "TAX-FREE WEALTH BUILDING through long-term hold",
        taxDeferral: true,
        year5Reduction: 10,
        year7Reduction: 15,
        year10Benefit: "Zero taxes on appreciation"
      }
    ],
    
    // 5-Year Investment Plan
    fiveYearPlan: {
      year1: {
        action: "Optimize Operations - Implement RUBS, add laundry",
        monthlyIncome: 7255,
        cashFlow: 25000,
        occupancy: 100,
        propertyValue: 764400,
        equity: 218400,
        totalReturn: 43000
      },
      year2to3: {
        action: "Raise Rents - Bring units to market rate, add storage",
        monthlyIncome: 8500,
        cashFlow: 40000,
        propertyValue: 950000,
        equity: 404000,
        cumulativeCashFlow: 105000
      },
      year4to5: {
        action: "Maximum Value - All improvements complete, consider selling or refi",
        monthlyIncome: 9000,
        cashFlow: 45000,
        propertyValue: 1205000,
        equity: 659000,
        cumulativeCashFlow: 195000
      },
      exitValue: 1205000,
      totalProfit: 477000,
      fiveYearROI: 262,
      averageAnnualReturn: 52.4,
      totalCashFlow: 195000,
      appreciationGain: 477000,
      totalReturn: 672000
    },
    
    // Financial Comparison
    financialComparison: {
      thisProperty: {
        capRate: 9.29,
        pricePerUnit: 145600,
        expenseRatio: 15.4,
        occupancy: 100,
        cashOnCashReturn: 12.6
      },
      marketAverage: {
        capRate: "5-6%",
        pricePerUnit: "$200,000+",
        expenseRatio: "35-40%",
        occupancy: "93%",
        cashOnCashReturn: "6-8%"
      },
      note: "EXCEPTIONAL compared to market!"
    },
    
    // 30-Year Projections
    thirtyYearProjections: {
      assumptions: {
        rentGrowthRate: 3,
        expenseGrowthRate: 2.5,
        appreciationRate: 4,
        vacancyRate: 5,
        managementFee: 8,
        maintenanceRate: 10,
        capExRate: 10
      },
      projections: [
        { 
          year: 1, 
          grossRent: 79860,
          vacancy: 3993,
          effectiveRent: 75867,
          expenses: 12260,
          netOperatingIncome: 63607,
          debtService: 44712,
          cashFlow: 18895,
          cumulativeCashFlow: 18895,
          propertyValue: 757120,
          loanBalance: 540290,
          equity: 216830,
          principalPaydown: 5710,
          totalReturn: 48605,
          totalROI: 26.7
        },
        { 
          year: 2,
          grossRent: 82256,
          vacancy: 4113,
          effectiveRent: 78143,
          expenses: 12567,
          netOperatingIncome: 65576,
          debtService: 44712,
          cashFlow: 20864,
          cumulativeCashFlow: 39759,
          propertyValue: 787405,
          loanBalance: 534370,
          equity: 253035,
          principalPaydown: 5920,
          totalReturn: 86764,
          totalROI: 47.7
        },
        { 
          year: 3,
          grossRent: 84724,
          vacancy: 4236,
          effectiveRent: 80488,
          expenses: 12881,
          netOperatingIncome: 67607,
          debtService: 44712,
          cashFlow: 22895,
          cumulativeCashFlow: 62654,
          propertyValue: 818901,
          loanBalance: 528238,
          equity: 290663,
          principalPaydown: 6132,
          totalReturn: 136581,
          totalROI: 75.0
        },
        { 
          year: 4,
          grossRent: 87266,
          vacancy: 4363,
          effectiveRent: 82903,
          expenses: 13203,
          netOperatingIncome: 69700,
          debtService: 44712,
          cashFlow: 24988,
          cumulativeCashFlow: 87642,
          propertyValue: 851657,
          loanBalance: 521884,
          equity: 329773,
          principalPaydown: 6354,
          totalReturn: 187384,
          totalROI: 103.0
        },
        { 
          year: 5,
          grossRent: 89884,
          vacancy: 4494,
          effectiveRent: 85390,
          expenses: 13533,
          netOperatingIncome: 71857,
          debtService: 44712,
          cashFlow: 27145,
          cumulativeCashFlow: 114787,
          propertyValue: 885723,
          loanBalance: 515298,
          equity: 370425,
          principalPaydown: 6586,
          totalReturn: 241920,
          totalROI: 133.0
        },
        { 
          year: 10,
          grossRent: 104048,
          vacancy: 5202,
          effectiveRent: 98846,
          expenses: 15320,
          netOperatingIncome: 83526,
          debtService: 44712,
          cashFlow: 38814,
          cumulativeCashFlow: 282547,
          propertyValue: 1078507,
          loanBalance: 479847,
          equity: 598660,
          principalPaydown: 8316,
          totalReturn: 515397,
          totalROI: 283.2
        },
        { 
          year: 15,
          grossRent: 120496,
          vacancy: 6025,
          effectiveRent: 114471,
          expenses: 17344,
          netOperatingIncome: 97127,
          debtService: 44712,
          cashFlow: 52415,
          cumulativeCashFlow: 519617,
          propertyValue: 1313513,
          loanBalance: 433282,
          equity: 880231,
          principalPaydown: 10507,
          totalReturn: 932048,
          totalROI: 512.1
        },
        { 
          year: 20,
          grossRent: 139535,
          vacancy: 6977,
          effectiveRent: 132558,
          expenses: 19628,
          netOperatingIncome: 112930,
          debtService: 44712,
          cashFlow: 68218,
          cumulativeCashFlow: 833952,
          propertyValue: 1600283,
          loanBalance: 374798,
          equity: 1225485,
          principalPaydown: 13276,
          totalReturn: 1503637,
          totalROI: 826.2
        },
        { 
          year: 25,
          grossRent: 161571,
          vacancy: 8079,
          effectiveRent: 153492,
          expenses: 22223,
          netOperatingIncome: 131269,
          debtService: 44712,
          cashFlow: 86557,
          cumulativeCashFlow: 1242346,
          propertyValue: 1949945,
          loanBalance: 301815,
          equity: 1648130,
          principalPaydown: 16775,
          totalReturn: 2252251,
          totalROI: 1237.5
        },
        { 
          year: 30,
          grossRent: 187069,
          vacancy: 9353,
          effectiveRent: 177716,
          expenses: 25159,
          netOperatingIncome: 152557,
          debtService: 44712,
          cashFlow: 107845,
          cumulativeCashFlow: 1754858,
          propertyValue: 2375433,
          loanBalance: 0,
          equity: 2375433,
          principalPaydown: 44712,
          totalReturn: 3312291,
          totalROI: 1820.0
        }
      ]
    },
    
    // Strategic Overview
    strategicOverview: `This Fruitridge Manor property delivers an outstanding 9.29% cap rate with 100% occupancy! Located in a federal Opportunity Zone with extremely low expenses (15.4% ratio - incredibly low for the market), this fully stabilized asset offers immediate cash flow with significant rent growth potential. At just $145,600/unit with strong cash flow from day one, this property offers exceptional returns in Sacramento's growing market. The property features a 2-story unit with laundry and all units are currently occupied. With $1,395/month in rent upside potential (21% increase), simple value-adds like RUBS implementation (tenants currently pay NO utilities), and coin-operated laundry, this property can achieve 21.8% cash-on-cash returns. The Opportunity Zone location provides massive tax benefits including tax deferral, 10-15% reduction in basis, and ZERO taxes on appreciation after 10 years. Perfect for investors who want immediate double-digit returns, seek Opportunity Zone tax benefits, appreciate fully stabilized assets, can execute simple value-adds, and understand Sacramento's growth driven by state capital stability, growing tech sector, and severe housing shortage.`,
    
    // Risk Analysis
    riskAnalysis: {
      strengths: [
        "✅ 9.29% cap rate (phenomenal!)",
        "✅ 100% occupied",
        "✅ 15% expense ratio (crazy low!)",
        "✅ Opportunity Zone benefits",
        "✅ Only $145,600/unit",
        "✅ 2-story unit with laundry",
        "✅ State capital stability",
        "✅ Growing tech sector",
        "✅ Housing shortage",
        "✅ 5%+ annual rent growth"
      ],
      considerations: [
        "❌ Fruitridge Manor (working-class area)",
        "❌ 1979 building age",
        "❌ Below-market rents",
        "❌ No current RUBS"
      ],
      mitigations: [
        "Professional management",
        "Gradual rent increases",
        "Preventive maintenance",
        "Security improvements",
        "Tenant screening",
        "Build reserve fund",
        "Regular property inspections",
        "Maintain property insurance"
      ]
    },
    
    // Due Diligence Items
    dueDiligenceItems: [
      "Review actual P&L statements",
      "Verify 15.4% expense ratio",
      "Check all current leases",
      "Confirm actual rents collected",
      "Property inspection",
      "Verify Opportunity Zone designation",
      "Review utility billing setup",
      "Check for deferred maintenance",
      "Market rent survey",
      "Environmental assessment",
      "Title and survey review",
      "Insurance quote verification",
      "Property tax verification",
      "Tenant payment history"
    ],
    
    // Exit Strategies
    exitStrategies: [
      {
        strategy: "5-Year Value-Add Exit",
        description: "Optimize operations with RUBS and laundry, sell at 7% cap for $1,205,000",
        timeline: "5 years",
        estimatedProfit: 477000,
        projectedValue: 1205000,
        roi: 262
      },
      {
        strategy: "10-Year Opportunity Zone Hold",
        description: "Hold for full tax benefits with zero taxes on $772,000 appreciation",
        timeline: "10 years",
        estimatedProfit: 772000,
        projectedValue: 1500000,
        taxFreeGains: 772000
      },
      {
        strategy: "Refinance & Hold",
        description: "Cash-out refinance after value-add to pull out $200,000",
        timeline: "2 years",
        estimatedProfit: 200000,
        newValue: 1000000,
        cashOut: 200000,
        continuedCashFlow: 3500
      },
      {
        strategy: "1031 Exchange",
        description: "Trade up to 10-20 unit building with $400,000 in deferred gains",
        timeline: "3-5 years",
        estimatedProfit: 400000,
        deferredGains: 400000,
        nextProperty: "10-20 unit building"
      }
    ],
    
    // Investment Thesis
    investmentThesis: {
      keyPoints: [
        "Exceptional 9.29% cap rate",
        "Incredibly low 15% expenses",
        "100% occupied (no vacancy loss)",
        "Opportunity Zone location",
        "Simple value-add potential",
        "Below replacement cost",
        "Sacramento market strength",
        "State capital stability",
        "Tech sector growth",
        "Severe housing shortage driving rents"
      ],
      idealInvestor: "Cash flow focused investors seeking immediate returns with simple value-add opportunities and Opportunity Zone tax benefits",
      holdPeriod: "5-10 years for maximum returns",
      expectedReturns: "12.6% immediate, 21.8% after optimization, 25%+ with all improvements",
      warning: "At $145,600/unit with a 9.3% cap rate and 15% expenses, this is the kind of deal that builds generational wealth. Properties like this in Sacramento are EXTINCT - MOVE FAST!"
    },
    
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 18,
    title: "Kansas City 6-Plex - MIDTOWN VALUE-ADD GOLDMINE!",
    address: "712-714 W 38th St",
    city: "Kansas City",
    state: "MO",
    zipCode: "64111",
    location: "Kansas City, MO 64111",
    type: "Multi-Family Value-Add",
    propertyType: "Multi-Family",
    strategy: "Value-Add with 2BR Conversions",
    investmentStrategy: "Value-Add",
    units: 6,
    isMultiFamily: true,
    price: 775000,
    downPayment: 193750,
    downPaymentPercent: 25,
    currentCapRate: 6.5,
    capRate: 6.5,
    proFormaCapRate: 10.5,
    monthlyRent: 4985,
    currentRent: 4985,
    projectedRent: 11100,
    proFormaCashFlow: 5614,
    monthlyCashFlow: -78,
    rentUpside: 6115,
    status: "active",
    daysOnMarket: 0,
    confidence: "high",
    images: ["/api/placeholder/400/300"],
    bedrooms: 6,
    bathrooms: 6,
    sqft: null,
    yearBuilt: 1923,
    features: [
      "Walk Score 88 - Walker's Paradise!",
      "Valentine District - Prime Location",
      "$129,167 per unit - Underpriced!",
      "2BR Conversion Potential - Game Changer",
      "Updated Systems",
      "Original Hardwood Floors",
      "Historic Charm + Modern Updates",
      "0.5 miles to Westport",
      "1 mile to Plaza District",
      "Rapid Gentrification Area"
    ],
    description: "Prime Valentine neighborhood location with Walk Score 88! This charming 6-unit building features updated systems, original hardwood floors, and massive value-add potential through 2BR conversions. At just $129k/unit in KC's hottest walkable district, this property offers incredible upside!",
    riskLevel: "medium",
    timeframe: "12-24 months",
    cashRequired: 241750,
    totalROI: 345,
    cashOnCashReturn: -0.5,
    cashFlow: -936,
    isDraft: false,
    listingUrl: "https://www.loopnet.com/Listing/712-714-W-38th-St-Kansas-City-MO/37253356/",
    listingSource: "LoopNet",
    
    // Financial Details
    interestRate: 7.25,
    loanTerm: 30,
    loanAmount: 581250,
    monthlyPI: 3966,
    closingCosts: 15500,
    rehabCosts: 48000,
    rehabDetails: {
      "2BR Conversion (per unit)": 8000,
      "Total Conversion Cost (6 units)": 48000,
      "Strategic Updates (4 units)": 12000,
      "RUBS Implementation": 0,
      "In-Unit Laundry (included in conversion)": 0
    },
    propertyTaxes: 806,
    insurance: 323,
    hoa: 0,
    hoaFees: 0,
    utilities: 300,
    maintenance: 388,
    propertyManagement: 478,
    vacancy: 299,
    capitalExpenditures: 300,
    operatingExpenses: 2094,
    monthlyExpenses: 2094,
    annualExpenses: 25124,
    netOperatingIncome: 46660,
    
    // Unit Mix and Rent Details
    unitMix: {
      "Current Configuration (1BR)": {
        quantity: 6,
        currentRent: 997,
        marketRent: 1350,
        totalCurrent: 4985,
        totalMarket: 8100,
        occupied: 5,
        vacant: 1
      },
      "After Conversion (2BR)": {
        quantity: 6,
        currentRent: 0,
        marketRent: 1850,
        totalCurrent: 0,
        totalMarket: 11100,
        note: "Convert living rooms to bedrooms, add in-unit laundry"
      }
    },
    
    // Current Occupancy
    currentOccupancy: {
      totalUnits: 6,
      occupied: 5,
      vacant: 1,
      occupancyRate: 83,
      note: "5 of 6 units occupied"
    },
    
    // Neighborhood & Location
    neighborhoodClass: "A",
    neighborhood: "Valentine District",
    lotSize: null,
    walkScore: 88,
    
    // Location Analysis
    locationAnalysis: {
      neighborhood: "Valentine District",
      walkScore: 88,
      walkScoreDescription: "Walker's Paradise",
      transitScore: null,
      bikeScore: null,
      proximityToDowntown: "2.5 miles",
      proximityToAmenities: {
        westport: "0.5 miles",
        plazaDistrict: "1 mile",
        downtown: "2.5 miles",
        kuMedical: "1.5 miles"
      },
      nearbyEmployers: [
        { name: "KU Medical Center", distance: "1.5 miles", employees: "10,000+" },
        { name: "Plaza District Businesses", distance: "1 mile", employees: "5,000+" },
        { name: "Westport Entertainment District", distance: "0.5 miles", employees: "2,000+" },
        { name: "Downtown KC", distance: "2.5 miles", employees: "50,000+" }
      ],
      publicTransit: {
        busLines: ["Multiple KC Metro routes"],
        nearestStop: "Within walking distance",
        commuteOptions: "Street parking only"
      },
      schools: {
        note: "Urban neighborhood - verify specific schools",
        district: "Kansas City Public Schools"
      },
      shopping: [
        { name: "Sun Fresh Market", distance: "Walking distance", type: "Grocery" },
        { name: "Westport Shopping", distance: "0.5 miles", type: "Retail/Entertainment" },
        { name: "Plaza Shopping", distance: "1 mile", type: "Premium Retail" }
      ],
      amenities: [
        "Restaurants & bars everywhere",
        "Coffee shops on every corner",
        "Gyms and yoga studios",
        "Parks and green spaces",
        "Young professional magnet",
        "Artist/creative community",
        "Historic charm preserved"
      ],
      demographics: {
        targetTenant: "Young professionals",
        communityType: "Artist/creative community",
        gentrificationStatus: "Rapid gentrification",
        newConstruction: "Limited",
        historicCharm: "Preserved"
      },
      marketTrends: "Young professional magnet, artist/creative community, rapid gentrification, limited new construction, historic charm preserved"
    },
    
    // Rental Analysis
    rentAnalysis: {
      currentRents: {
        "Average (5 occupied units)": 997,
        "Vacant Unit": 0
      },
      marketRents: {
        "1BR Current Configuration": 1350,
        "2BR After Conversion": 1850,
        "2BR with Premium Finishes": 2000,
        "In-Unit Laundry Premium": 100
      },
      rentalDemand: "Very High",
      vacancyRate: 17,
      currentOccupancy: 83,
      rentGrowth: "Strong in gentrifying area",
      rentGrowthRate: 4,
      totalUnits: 6,
      proFormaOccupancy: 95,
      rentIncreasePerUnit1BR: 353,
      rentIncreasePerUnit2BR: 853,
      totalRentUpside: 6115,
      currentRentPerUnit: 831,
      marketRentPerUnit: 1850,
      monthlyRentUpside: 6115,
      percentRentIncrease: 122.6,
      averageCurrentRent: 997,
      averageMarketRent: 1850,
      totalCurrentMonthlyRent: 4985,
      totalMarketMonthlyRent: 11100
    },
    
    // Property Metrics
    propertyMetrics: {
      pricePerUnit: 129167,
      pricePerSqFt: null,
      grossRentMultiplier: 13.0,
      currentGrossRentMultiplier: 13.0,
      proFormaGrossRentMultiplier: 5.8,
      debtServiceCoverageRatio: 0.98,
      breakEvenOccupancy: 102,
      internalRateOfReturn: 28,
      equityMultiple: 4.45,
      paybackPeriod: 7.0,
      currentYield: 6.5,
      proFormaYield: 10.5,
      note: "Currently slight negative cash flow, transforms with value-add"
    },
    
    // Comparable Sales Analysis
    comparableSales: [
      {
        address: "1608 W 38th",
        pricePerUnit: 137143,
        note: "Recent Valentine sale"
      },
      {
        address: "703-705 W 38th",
        pricePerUnit: 137143,
        note: "Recent Valentine sale"
      },
      {
        address: "1610 W 38th",
        pricePerUnit: 151667,
        note: "Recent Volker sale"
      }
    ],
    subjectComparison: {
      subjectPricePerUnit: 129167,
      averageCompPrice: 141984,
      discount: "$12,817 per unit below comps",
      conclusion: "UNDERPRICED!"
    },
    
    // Investment Scenarios
    investmentScenarios: {
      current: {
        name: "Current State",
        strategy: "As-is with 5 units rented",
        monthlyIncome: 4985,
        annualIncome: 59820,
        netOperatingIncome: 38877,
        capRate: 5.0,
        monthlyCashFlow: -78,
        cashFlow: -936,
        cashOnCashReturn: -0.5,
        note: "Slight negative cash flow"
      },
      conservative: {
        name: "Market Rents Only",
        strategy: "Fill vacant unit, raise to market $1,350/month",
        monthlyIncome: 8100,
        annualIncome: 97200,
        netOperatingIncome: 63180,
        capRate: 8.2,
        monthlyCashFlow: 2214,
        cashFlow: 26568,
        cashOnCashReturn: 13.7,
        totalROI: 137
      },
      realistic: {
        name: "Phased 2BR Conversion",
        strategy: "Convert 3-4 units Year 1, complete by Year 2",
        monthlyIncome: 9500,
        annualIncome: 114000,
        netOperatingIncome: 74100,
        capRate: 9.6,
        monthlyCashFlow: 3750,
        cashFlow: 45000,
        cashOnCashReturn: 20,
        totalROI: 200,
        totalInvestment: 241750
      },
      aggressive: {
        name: "Full 2BR Conversion",
        strategy: "All 6 units to 2BR with in-unit laundry",
        monthlyIncome: 11100,
        annualIncome: 133200,
        netOperatingIncome: 86580,
        capRate: 11.2,
        monthlyCashFlow: 5614,
        cashFlow: 67368,
        cashOnCashReturn: 27.5,
        totalROI: 275,
        totalInvestment: 241750,
        note: "Including $48k conversion costs"
      },
      luxury: {
        name: "Premium Strategy",
        strategy: "2BR conversions + luxury finishes, push to $2,000 rents",
        monthlyIncome: 12000,
        annualIncome: 144000,
        netOperatingIncome: 93600,
        capRate: 12.1,
        monthlyCashFlow: 5833,
        cashFlow: 70000,
        cashOnCashReturn: 30,
        totalROI: 300
      }
    },
    
    // Value Add Strategies
    valueAddStrategies: [
      {
        strategy: "Raise to Market Rents",
        description: "Current $997 to market $1,350/month",
        investment: 0,
        increasePerUnit: 353,
        monthlyIncomeIncrease: 2118,
        annualIncomeIncrease: 25416,
        newCapRate: 8.2
      },
      {
        strategy: "2BR Conversion BRILLIANCE",
        description: "Convert living rooms to bedrooms, add in-unit laundry",
        investment: 48000,
        costPerUnit: 8000,
        newRentPerUnit: 1850,
        monthlyIncomeIncrease: 5118,
        annualIncomeIncrease: 61416,
        newCapRate: 11.2,
        note: "Perfect layout for conversion"
      },
      {
        strategy: "In-Unit Laundry Premium",
        description: "Already included in 2BR conversion plan",
        premium: 100,
        tenantRetention: "Major retention tool",
        competitiveAdvantage: "Eliminates laundromat trips"
      },
      {
        strategy: "Luxury Unit Strategy",
        description: "2 units already luxury finished, focus on remaining 4",
        investment: 12000,
        costPerUnit: 3000,
        targetRent: 2000,
        note: "Create consistent premium product"
      },
      {
        strategy: "RUBS Implementation",
        description: "Water currently master metered - bill back utilities",
        investment: 0,
        monthlySavings: 300,
        annualSavings: 3600,
        directNOIIncrease: true
      }
    ],
    
    // 5-Year Investment Plan
    fiveYearPlan: {
      year1: {
        action: "Stabilize & Start - Fill vacant unit, begin 2BR conversions (2 units), implement RUBS",
        monthlyIncome: 8100,
        unitsConverted: 2,
        occupancy: 100
      },
      year2: {
        action: "Convert & Optimize - Complete remaining conversions, all units at 2BR",
        monthlyIncome: 11100,
        unitsConverted: 6,
        configuration: "All 2BR with in-unit laundry"
      },
      year3to5: {
        action: "Maximize - Premium finishes in all units, push rents to $2,000+, consider condo conversion",
        monthlyIncome: 12000,
        potentialCondoConversion: true,
        propertyValue: 1443000
      },
      exitValue: 1443000,
      totalProfit: 668000,
      fiveYearROI: 345,
      exitCapRate: 6
    },
    
    // Strategic Overview
    strategicOverview: `Prime Valentine neighborhood location with Walk Score 88 (Walker's Paradise)! This charming 6-unit building features updated systems, original hardwood floors, and massive value-add potential through 2BR conversions. Currently showing slight negative cash flow at -$78/month with 5 of 6 units occupied, but this transforms completely with value-add execution. The property is perfectly positioned for 2BR conversions with ideal layout - convert living rooms to bedrooms and add in-unit laundry for just $8,000/unit. At current market rents of $1,350 for 1BR units, the property achieves 13.7% cash-on-cash returns. After 2BR conversions commanding $1,850/month, cash flow jumps to $5,614/month (27.5% cash-on-cash return including conversion costs). Located in the rapidly gentrifying Valentine District just 0.5 miles from Westport and 1 mile from Plaza District, with young professionals and creative community driving demand. Recent comparable sales at $137-152k/unit prove the subject at $129,167/unit is UNDERPRICED. The 5-year plan shows exit value at $1,443,000 with $668,000 profit (345% ROI). This is textbook value-add: Buy at $129k/unit, invest $8k/unit, achieve $1,850 rents, exit at $240k/unit.`,
    
    // Risk Analysis
    riskAnalysis: {
      strengths: [
        "✅ Walk Score 88 (incredible!)",
        "✅ $129,167/unit (cheap!)",
        "✅ 2BR conversion potential",
        "✅ Updated systems",
        "✅ Historic charm + modern updates",
        "✅ Prime Valentine location",
        "✅ Rapid gentrification area",
        "✅ Young professional demand",
        "✅ Below comparable sales",
        "✅ Perfect conversion layout"
      ],
      considerations: [
        "❌ Currently slight negative cash flow",
        "❌ Street parking only",
        "❌ 1923 building (maintenance)",
        "❌ Conversion costs needed",
        "❌ One vacant unit"
      ],
      mitigations: [
        "Quick lease-up (high demand area)",
        "Phased conversion approach",
        "Professional management",
        "Preventive maintenance program",
        "Build reserve fund",
        "Screen tenants carefully",
        "Regular property inspections"
      ],
      warning: "Currently shows slight negative cash flow, but with one lease-up and market rents, immediately turns positive. The 2BR conversion strategy transforms this into a 27%+ cash-on-cash MONSTER!"
    },
    
    // Due Diligence Items
    dueDiligenceItems: [
      "Verify conversion feasibility with city",
      "Get contractor quotes for 2BR conversions",
      "Inspect all mechanical systems",
      "Review all current leases",
      "Check parking situation thoroughly",
      "Verify Walk Score and location benefits",
      "Environmental assessment",
      "Title and survey review",
      "Review historic district requirements",
      "Check for code violations",
      "Assess actual maintenance needs",
      "Market rent survey for 2BR units",
      "Review comparable sales",
      "Tenant payment history"
    ],
    
    // Exit Strategies
    exitStrategies: [
      {
        strategy: "5-Year Value-Add Exit",
        description: "Complete 2BR conversions and sell at 6% cap for $1,443,000",
        timeline: "5 years",
        estimatedProfit: 668000,
        projectedValue: 1443000,
        roi: 345
      },
      {
        strategy: "Condo Conversion",
        description: "Convert to condos at $250,000/unit in hot Valentine market",
        timeline: "3-4 years",
        estimatedProfit: 725000,
        estimatedValuePerUnit: 250000,
        totalValue: 1500000,
        note: "Subject to market conditions and city approval"
      },
      {
        strategy: "Refinance & Hold",
        description: "Cash-out refinance after conversions to pull out $300,000",
        timeline: "2 years",
        estimatedProfit: 300000,
        newValue: 1200000,
        cashOut: 300000,
        continuedCashFlow: 5000
      },
      {
        strategy: "1031 Exchange",
        description: "Trade up to 10-20 unit building with $500,000 in deferred gains",
        timeline: "3-5 years",
        estimatedProfit: 500000,
        deferredGains: 500000,
        nextProperty: "10-20 unit building in Crossroads or River Market"
      }
    ],
    
    // 30-Year Projections (After 2BR Conversions)
    thirtyYearProjections: {
      assumptions: {
        rentGrowthRate: 3,
        expenseGrowthRate: 2.5,
        appreciationRate: 4,
        vacancyRate: 5,
        managementFee: 8,
        maintenanceRate: 10,
        capExRate: 10,
        note: "Assumes 2BR conversions completed Year 1"
      },
      projections: [
        { 
          year: 1,
          grossRent: 71784,
          vacancy: 3589,
          effectiveRent: 68195,
          expenses: 25124,
          netOperatingIncome: 43071,
          debtService: 47592,
          cashFlow: -4521,
          cumulativeCashFlow: -4521,
          propertyValue: 806000,
          loanBalance: 574803,
          equity: 231197,
          principalPaydown: 6447,
          totalReturn: 27676,
          totalROI: 14.3,
          note: "During conversion period"
        },
        { 
          year: 2,
          grossRent: 133200,
          vacancy: 6660,
          effectiveRent: 126540,
          expenses: 25752,
          netOperatingIncome: 100788,
          debtService: 47592,
          cashFlow: 53196,
          cumulativeCashFlow: 48675,
          propertyValue: 838240,
          loanBalance: 568099,
          equity: 270141,
          principalPaydown: 6704,
          totalReturn: 145340,
          totalROI: 75.0,
          note: "2BR conversions complete"
        },
        { 
          year: 3,
          grossRent: 137196,
          vacancy: 6860,
          effectiveRent: 130336,
          expenses: 26396,
          netOperatingIncome: 103940,
          debtService: 47592,
          cashFlow: 56348,
          cumulativeCashFlow: 105023,
          propertyValue: 871770,
          loanBalance: 561127,
          equity: 310643,
          principalPaydown: 6972,
          totalReturn: 238967,
          totalROI: 123.3
        },
        { 
          year: 5,
          grossRent: 145523,
          vacancy: 7276,
          effectiveRent: 138247,
          expenses: 27716,
          netOperatingIncome: 110531,
          debtService: 47592,
          cashFlow: 62939,
          cumulativeCashFlow: 234648,
          propertyValue: 942871,
          loanBalance: 546105,
          equity: 396766,
          principalPaydown: 7532,
          totalReturn: 439164,
          totalROI: 226.7
        },
        { 
          year: 10,
          grossRent: 168488,
          vacancy: 8424,
          effectiveRent: 160064,
          expenses: 31372,
          netOperatingIncome: 128692,
          debtService: 47592,
          cashFlow: 81100,
          cumulativeCashFlow: 601703,
          propertyValue: 1148154,
          loanBalance: 505971,
          equity: 642183,
          principalPaydown: 9515,
          totalReturn: 889136,
          totalROI: 459.0
        },
        { 
          year: 15,
          grossRent: 195096,
          vacancy: 9755,
          effectiveRent: 185341,
          expenses: 35527,
          netOperatingIncome: 149814,
          debtService: 47592,
          cashFlow: 102222,
          cumulativeCashFlow: 1068463,
          propertyValue: 1398374,
          loanBalance: 454831,
          equity: 943543,
          principalPaydown: 12023,
          totalReturn: 1547256,
          totalROI: 798.6
        },
        { 
          year: 20,
          grossRent: 225865,
          vacancy: 11293,
          effectiveRent: 214572,
          expenses: 40229,
          netOperatingIncome: 174343,
          debtService: 47592,
          cashFlow: 126751,
          cumulativeCashFlow: 1627718,
          propertyValue: 1703089,
          loanBalance: 389820,
          equity: 1313269,
          principalPaydown: 15195,
          totalReturn: 2387237,
          totalROI: 1232.1
        },
        { 
          year: 25,
          grossRent: 261538,
          vacancy: 13077,
          effectiveRent: 248461,
          expenses: 45559,
          netOperatingIncome: 202902,
          debtService: 47592,
          cashFlow: 155310,
          cumulativeCashFlow: 2324383,
          propertyValue: 2074987,
          loanBalance: 307267,
          equity: 1767720,
          principalPaydown: 19208,
          totalReturn: 3547853,
          totalROI: 1831.4
        },
        { 
          year: 30,
          grossRent: 302875,
          vacancy: 15144,
          effectiveRent: 287731,
          expenses: 51608,
          netOperatingIncome: 236123,
          debtService: 47592,
          cashFlow: 188531,
          cumulativeCashFlow: 3187608,
          propertyValue: 2527633,
          loanBalance: 0,
          equity: 2527633,
          principalPaydown: 47592,
          totalReturn: 4962991,
          totalROI: 2562.0
        }
      ]
    },
    
    // Investment Thesis
    investmentThesis: {
      keyPoints: [
        "Prime Valentine location with Walk Score 88",
        "Simple 2BR conversion opportunity",
        "$353-853/month rent upside per unit",
        "Below market purchase price vs comps",
        "Updated major systems",
        "Perfect conversion layout",
        "Rapid neighborhood gentrification",
        "Young professional tenant base",
        "Limited new construction supply",
        "Historic charm creates premium"
      ],
      idealInvestor: "Value-add investors who understand conversion potential, can fund renovation costs, appreciate walkable locations, want Kansas City exposure, and think beyond current state",
      holdPeriod: "2-5 years for maximum returns",
      expectedReturns: "13.7% after market rents, 27.5% after conversions, 30%+ with premium finishes",
      criticalSuccess: "The 2BR conversion is the key - perfect layout makes this straightforward",
      finalThought: "With perfect conversion layout, Walk Score 88, and $850+/month rent upside per unit, this Valentine gem can go from break-even to $67k+ annual cash flow. Properties with this potential in walkable KC neighborhoods are RARE - act fast!"
    },
    
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 20,
    title: "Walnut Grove Cottages - 13-Unit Cash Cow",
    address: "13991 River Rd",
    city: "Walnut Grove",
    state: "CA",
    zipCode: "95690",
    location: "Walnut Grove, CA 95690",
    neighborhood: "Sacramento River Delta",
    type: "Multifamily Investment",
    propertyType: "Multifamily",
    strategy: "Buy & Hold",
    investmentStrategy: "Buy & Hold",
    units: 13,
    isMultiFamily: true,
    price: 1350000,
    pricePerUnit: 103846,
    
    // Financial Metrics
    downPayment: 337500,
    downPaymentPercent: 25,
    loanAmount: 1012500,
    interestRate: 7.25,
    loanTerm: 30,
    monthlyPI: 6909,
    
    // Income & Expenses
    monthlyRent: 17555,
    grossAnnualIncome: 210660,
    vacancy: 6320,
    effectiveGrossIncome: 204340,
    propertyTaxes: 15930,
    operatingExpenses: 61968,
    totalExpenses: 77898,
    expenseRatio: 37,
    netOperatingIncome: 126442,
    noi: 126442,
    
    // Key Metrics
    capRate: 9.37,
    currentCapRate: 9.37,
    proFormaCapRate: 12.56,
    monthlyCashFlow: 3628,
    cashFlow: 43534,
    proFormaCashFlow: 6825,
    cashOnCashReturn: 12.9,
    roi: 24.3,
    totalROI: 24.3,
    
    // Property Details
    bedrooms: 13, // Total across all units
    bathrooms: 13,
    sqft: 11000, // Estimated total
    yearBuilt: 1991,
    lotSize: "1.52 acres",
    propertyCondition: "Well-maintained",
    
    // Unit Mix
    unitMix: {
      "2BR Cottages": {
        quantity: 8,
        currentRent: 1475,
        marketRent: 1675,
        totalCurrent: 11800,
        totalMarket: 13400
      },
      "1BR Cottages": {
        quantity: 2,
        currentRent: 1264,
        marketRent: 1464,
        totalCurrent: 2528,
        totalMarket: 2928
      },
      "Studio Cottages": {
        quantity: 2,
        currentRent: 1225,
        marketRent: 1425,
        totalCurrent: 2450,
        totalMarket: 2850
      },
      "4BR Cottage": {
        quantity: 1,
        currentRent: 1863,
        marketRent: 2063,
        totalCurrent: 1863,
        totalMarket: 2063
      }
    },
    
    // Value-Add Strategy
    valueAddStrategy: {
      immediate: [
        "Implement RUBS (Ratio Utility Billing System) - adds $14,271/year",
        "Push rents to market - $200-300/unit upside",
        "Add covered parking/storage units",
        "Pet-friendly policy with deposits"
      ],
      longTerm: [
        "Add 2 more units on the 1.52 acres",
        "Construction cost: $150K/unit",
        "Additional income: $36,000/year",
        "Instant equity creation: $100K+"
      ]
    },
    
    // Features
    features: [
      "Individual Detached Cottages",
      "No Shared Walls",
      "Private Yards",
      "Steps from Sacramento River",
      "1.52 Acres",
      "Development Potential",
      "Below Replacement Cost",
      "Seller Financing Available"
    ],
    
    // Location Analysis
    locationAnalysis: {
      walkScore: 45,
      transitScore: 0,
      bikeScore: 55,
      neighborhood: "Small-town charm with big-city access",
      nearbyAmenities: [
        "Sacramento River waterfront",
        "Historic downtown Walnut Grove",
        "30 minutes to Sacramento",
        "Agricultural employment base",
        "Low crime, family-friendly area"
      ],
      marketTrends: [
        "Limited housing supply in area",
        "Sacramento spillover demand",
        "Cottage premium vs apartments",
        "Strong agricultural worker demand"
      ]
    },
    
    // Investment Summary
    description: "13 detached single-story cottages on 1.52 acres with 9.37% cap rate. Individual cottages at apartment pricing with immediate RUBS value-add opportunity. Turnkey property with clear path to 12.56% pro forma cap.",
    
    executiveSummary: "Exceptional 13-unit cottage property offering individual homes at multifamily pricing. Current 9.37% cap rate jumps to 12.56% with RUBS implementation. At $103K/unit for detached cottages, this represents institutional returns at a fraction of replacement cost. Seller financing potentially available.",
    
    strategicOverview: `Individual cottages command 15-20% premium over apartments while maintaining lower turnover. RUBS implementation adds instant $14K annual income. Below-market rents offer $200-300/unit upside. Development potential for 2 additional units on 1.52 acres. Key advantages: 9.37% cap rate in California, detached cottages vs shared walls, RUBS doubles cash flow immediately, $300K below replacement cost, development rights included, seller financing option at 6%. Exit strategies include stabilizing at market rents for $2.5M value, adding 2 units for $2.8M value, or selling to institutional buyer at 7.5% cap.`,
    
    // Financing Scenarios
    financingScenarios: [
      {
        name: "Traditional Bank Financing",
        downPayment: 337500,
        loanAmount: 1012500,
        rate: 7.25,
        monthlyPayment: 6909,
        cashFlow: 3628,
        cashOnCash: 12.9
      },
      {
        name: "Seller Financing",
        downPayment: 270000,
        loanAmount: 1080000,
        rate: 6.0,
        monthlyPayment: 6479,
        cashFlow: 4058,
        cashOnCash: 18.1
      }
    ],
    
    // Pro Forma Projections
    proFormaProjections: {
      year1: {
        noi: 175000,
        cashFlow: 87000,
        cashOnCash: 25.8
      },
      year3: {
        noi: 200000,
        value: 2500000,
        equity: 1150000
      },
      year5: {
        noi: 210000,
        value: 2800000,
        equity: 1450000,
        totalReturn: 430
      }
    },
    
    // Risk Assessment
    riskLevel: "low",
    risks: [
      "Rural location may limit liquidity",
      "Older vintage property (1991)",
      "Small market dynamics",
      "Distance management challenges"
    ],
    mitigants: [
      "9.37% cap provides margin of safety",
      "Individual cottages reduce turnover",
      "RUBS implementation is proven",
      "Professional property management available"
    ],
    
    // Action Items
    dueDiligence: [
      "Verify current rent roll and occupancy",
      "Inspect all 13 cottages thoroughly",
      "Review utility billing history",
      "Confirm development potential with county",
      "Negotiate seller financing terms"
    ],
    
    // 30-Year Financial Projections
    thirtyYearProjections: {
      assumptions: {
        rentGrowthRate: 3,
        expenseGrowthRate: 2.5,
        appreciationRate: 4,
        vacancyRate: 3,
        managementFee: 8,
        maintenanceRate: 8,
        capExRate: 5
      },
      projections: [
        { 
          year: 1,
          grossRent: 210660,
          vacancy: 6320,
          effectiveRent: 204340,
          expenses: 77898,
          netOperatingIncome: 126442,
          debtService: 82908,
          cashFlow: 43534,
          cumulativeCashFlow: 43534,
          propertyValue: 1404000,
          loanBalance: 1001250,
          equity: 402750,
          principalPaydown: 11250,
          totalReturn: 109784,
          totalROI: 32.5,
          note: "Base year - current operations"
        },
        { 
          year: 2,
          grossRent: 231000,
          vacancy: 6930,
          effectiveRent: 224070,
          expenses: 79895,
          netOperatingIncome: 144175,
          debtService: 82908,
          cashFlow: 61267,
          cumulativeCashFlow: 104801,
          propertyValue: 1460160,
          loanBalance: 989435,
          equity: 470725,
          principalPaydown: 11815,
          totalReturn: 237042,
          totalROI: 70.2,
          note: "RUBS implemented, rents to market"
        },
        { 
          year: 3,
          grossRent: 238000,
          vacancy: 7140,
          effectiveRent: 230860,
          expenses: 81893,
          netOperatingIncome: 148967,
          debtService: 82908,
          cashFlow: 66059,
          cumulativeCashFlow: 170860,
          propertyValue: 1518566,
          loanBalance: 977100,
          equity: 541466,
          principalPaydown: 12335,
          totalReturn: 345792,
          totalROI: 102.5
        },
        { 
          year: 5,
          grossRent: 253000,
          vacancy: 7590,
          effectiveRent: 245410,
          expenses: 86112,
          netOperatingIncome: 159298,
          debtService: 82908,
          cashFlow: 76390,
          cumulativeCashFlow: 320130,
          propertyValue: 1642032,
          loanBalance: 950785,
          equity: 691247,
          principalPaydown: 13580,
          totalReturn: 554957,
          totalROI: 164.5
        },
        { 
          year: 10,
          grossRent: 293000,
          vacancy: 8790,
          effectiveRent: 284210,
          expenses: 97436,
          netOperatingIncome: 186774,
          debtService: 82908,
          cashFlow: 103866,
          cumulativeCashFlow: 720456,
          propertyValue: 1998670,
          loanBalance: 882340,
          equity: 1116330,
          principalPaydown: 17895,
          totalReturn: 1256126,
          totalROI: 372.3
        },
        { 
          year: 15,
          grossRent: 339000,
          vacancy: 10170,
          effectiveRent: 328830,
          expenses: 110250,
          netOperatingIncome: 218580,
          debtService: 82908,
          cashFlow: 135672,
          cumulativeCashFlow: 1310598,
          propertyValue: 2432854,
          loanBalance: 799875,
          equity: 1632979,
          principalPaydown: 22610,
          totalReturn: 2408202,
          totalROI: 713.8
        },
        { 
          year: 20,
          grossRent: 393000,
          vacancy: 11790,
          effectiveRent: 381210,
          expenses: 124736,
          netOperatingIncome: 256474,
          debtService: 82908,
          cashFlow: 173566,
          cumulativeCashFlow: 2084464,
          propertyValue: 2961566,
          loanBalance: 699365,
          equity: 2262201,
          principalPaydown: 28520,
          totalReturn: 3897130,
          totalROI: 1154.7
        },
        { 
          year: 25,
          grossRent: 455000,
          vacancy: 13650,
          effectiveRent: 441350,
          expenses: 141168,
          netOperatingIncome: 300182,
          debtService: 82908,
          cashFlow: 217274,
          cumulativeCashFlow: 3137954,
          propertyValue: 3605204,
          loanBalance: 576245,
          equity: 3028959,
          principalPaydown: 35985,
          totalReturn: 5628898,
          totalROI: 1667.4
        },
        { 
          year: 30,
          grossRent: 527000,
          vacancy: 15810,
          effectiveRent: 511190,
          expenses: 159785,
          netOperatingIncome: 351405,
          debtService: 82908,
          cashFlow: 268497,
          cumulativeCashFlow: 4470704,
          propertyValue: 4389541,
          loanBalance: 0,
          equity: 4389541,
          principalPaydown: 82908,
          totalReturn: 7197745,
          totalROI: 2132.6
        }
      ],
      totalRentalIncome: 8952900,
      totalCashFlow: 4470704,
      principalPaydown: 1012500,
      propertyAppreciation: 3039541,
      totalReturn: 7197745,
      averageAnnualReturn: 239925,
      totalROI: 2132.6,
      equityAtYear30: 4389541,
      analysis: "With RUBS implementation and rent increases to market, this property generates exceptional returns. The 2,132% ROI over 30 years represents a 21X return on initial investment."
    },
    
    confidence: "very high",
    status: "active",
    daysOnMarket: 0,
    timeframe: "Immediate",
    cashRequired: 337500,
    
    isDraft: false,
    isFeatured: true,
    listingUrl: "https://www.loopnet.com/Listing/13991-River-Rd-Walnut-Grove-CA/37585444/",
    listingSource: "LoopNet",
    
    images: [
      "/api/placeholder/400/300"
    ],
    
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 19,
    title: "Kansas City BRRRR - Historic Northeast Cash Flow Machine",
    address: "3505 Garner Ave",
    city: "Kansas City",
    state: "MO",
    zipCode: "64124",
    location: "Kansas City, MO 64124",
    neighborhood: "Historic Northeast",
    type: "Victorian BRRRR",
    propertyType: "Single Family",
    strategy: "BRRRR",
    investmentStrategy: "BRRRR",
    price: 110000,
    arv: 210000,
    
    // Financial Metrics - Initial Purchase
    downPayment: 11000,
    downPaymentPercent: 10,
    loanAmount: 99000,
    interestRate: 10.45,
    loanType: "Hard Money",
    monthlyPI: 862, // Interest-only
    pointsFees: 1980,
    
    // Renovation & Costs
    rehabCosts: 28000,
    rehabDetails: {
      "Kitchen refresh": 6000,
      "Bathroom updates": 4000,
      "Flooring repairs/refinish": 3500,
      "Interior paint": 2500,
      "Exterior paint/curb appeal": 3000,
      "Electrical/outlets update": 2000,
      "Landscaping/cleanup": 2000,
      "Minor repairs": 2000,
      "Staging/photos": 1000,
      "Contingency": 2000
    },
    holdingCosts: 5448,
    totalProjectCost: 138000,
    
    // Refinance Strategy
    refinanceDetails: {
      newLoanAmount: 157500,
      ltv: 75,
      refinanceRate: 7.5,
      term: 30,
      monthlyPayment: 1101,
      cashOut: 30500,
      cashLeftInDeal: 15928,
      recoveryRate: 65.7
    },
    
    // Post-Refinance Metrics
    monthlyRent: 1650,
    potentialRent: 1850, // Section 8
    monthlyExpenses: 1766,
    monthlyCashFlow: -116,
    cashFlow: -1392,
    cashOnCashReturn: -8.7,
    
    // Alternative Scenarios
    alternativeStrategies: {
      higherRent: {
        rent: 1750,
        cashFlow: 16,
        annual: 192
      },
      lowerLTV: {
        ltv: 70,
        loanAmount: 147000,
        payment: 1028,
        cashFlow: 11
      },
      section8: {
        rent: 1900,
        cashFlow: 134,
        annual: 1608
      }
    },
    
    // Property Details
    bedrooms: 4,
    bathrooms: 2,
    sqft: 1796,
    pricePerSqft: 61,
    yearBuilt: 1890,
    propertyCondition: "Recently renovated interior, needs cosmetic updates",
    
    // Key Metrics
    capRate: 10.8, // Based on ARV
    forcedAppreciation: 100000,
    totalCashRequired: 46428,
    
    // 5-Year Projections
    fiveYearProjections: {
      forcedAppreciation: 72000,
      marketAppreciation: 35000,
      mortgagePaydown: 22000,
      totalEquityCreated: 129000,
      cashFlow: -7000,
      netWealthCreated: 106072,
      roiOnCash: 666
    },
    
    // Features
    features: [
      "Victorian Architecture",
      "Recently Renovated Interior",
      "4 Bedrooms",
      "Historic Neighborhood",
      "High ARV Potential",
      "Section 8 Eligible",
      "Corner Lot",
      "Original Hardwood Floors"
    ],
    
    // Location Analysis
    locationAnalysis: {
      walkScore: 65,
      transitScore: 35,
      bikeScore: 50,
      neighborhood: "Historic Northeast - Improving area with investment activity",
      nearbyAmenities: [
        "Downtown Kansas City - 10 minutes",
        "Cliff Drive Scenic Byway",
        "Kessler Park",
        "Historic Northeast District",
        "Major employment centers nearby"
      ],
      marketTrends: [
        "Neighborhood gentrification in progress",
        "Strong investor activity",
        "Rising property values",
        "Limited inventory driving appreciation"
      ]
    },
    
    // Investment Summary
    description: "Classic BRRRR opportunity with $100K forced appreciation potential. Recently renovated Victorian needs only cosmetic updates to achieve $210K ARV. 65% capital recovery on refinance.",
    
    executiveSummary: "Textbook BRRRR deal in KC's Historic Northeast. Purchase at $61/SF, add $28K in cosmetic updates, refinance at $210K ARV. Recover 65% of capital while creating $100K+ in immediate equity. Slight negative cash flow initially but massive wealth creation.",
    
    strategicOverview: `Buy deep discount, force appreciation through cosmetic renovation, refinance to recover capital, build long-term wealth through equity growth. Classic BRRRR execution in improving neighborhood. Key advantages: $100K forced appreciation opportunity, 65% capital recovery on refinance, recent interior renovation reduces risk, multiple exit strategies available, Section 8 potential for positive cash flow, historic neighborhood with upside. Exit options include holding for long-term appreciation, flipping immediately for $50K profit, seller financing at premium, or packaging with other properties.`,
    
    // Risk Assessment
    riskLevel: "medium",
    risks: [
      "Slight negative initial cash flow",
      "1890 build may have hidden issues",
      "Historic Northeast location",
      "Must hit ARV target precisely",
      "Renovation budget overruns possible"
    ],
    mitigants: [
      "Recent renovations reduce risk",
      "Conservative rehab budget with contingency",
      "Multiple strategies to achieve positive cash flow",
      "Massive equity cushion provides safety",
      "Strong comparable sales support ARV"
    ],
    
    // Due Diligence Items
    dueDiligence: [
      "Full inspection including foundation/structure",
      "Verify recent renovation permits",
      "Confirm ARV with multiple comps",
      "Get contractor bids for renovation",
      "Research Section 8 rental rates",
      "Check for any historic district restrictions"
    ],
    
    // BRRRR Execution Timeline
    brrrrTimeline: {
      month1: "Close with hard money, begin renovation",
      month2: "Complete interior updates",
      month3: "Finish exterior, list for appraisal",
      month4: "Complete refinance, place tenant",
      totalTime: "4 months to stabilization"
    },
    
    // 30-Year Financial Projections (Post-Refinance)
    thirtyYearProjections: {
      assumptions: {
        rentGrowthRate: 3.5,
        expenseGrowthRate: 3,
        appreciationRate: 4.5,
        vacancyRate: 5,
        managementFee: 8,
        maintenanceRate: 10,
        capExRate: 5
      },
      projections: [
        { 
          year: 1,
          grossRent: 19800,
          vacancy: 990,
          effectiveRent: 18810,
          expenses: 21192,
          netOperatingIncome: -2382,
          debtService: 13212,
          cashFlow: -15594,
          cumulativeCashFlow: -15594,
          propertyValue: 219450,
          loanBalance: 155625,
          equity: 63825,
          principalPaydown: 1875,
          totalReturn: 50106,
          totalROI: 107.9,
          note: "Post-refinance, standard rent"
        },
        { 
          year: 2,
          grossRent: 21600,
          vacancy: 1080,
          effectiveRent: 20520,
          expenses: 21828,
          netOperatingIncome: -1308,
          debtService: 13212,
          cashFlow: -14520,
          cumulativeCashFlow: -30114,
          propertyValue: 229315,
          loanBalance: 153688,
          equity: 75627,
          principalPaydown: 1937,
          totalReturn: 47050,
          totalROI: 101.3,
          note: "Section 8 rent achieved"
        },
        { 
          year: 3,
          grossRent: 22356,
          vacancy: 1118,
          effectiveRent: 21238,
          expenses: 22483,
          netOperatingIncome: -1245,
          debtService: 13212,
          cashFlow: -14457,
          cumulativeCashFlow: -44571,
          propertyValue: 239634,
          loanBalance: 151686,
          equity: 87948,
          principalPaydown: 2002,
          totalReturn: 46322,
          totalROI: 99.8
        },
        { 
          year: 5,
          grossRent: 23892,
          vacancy: 1195,
          effectiveRent: 22697,
          expenses: 23833,
          netOperatingIncome: -1136,
          debtService: 13212,
          cashFlow: -14348,
          cumulativeCashFlow: -73228,
          propertyValue: 261568,
          loanBalance: 147460,
          equity: 114108,
          principalPaydown: 2140,
          totalReturn: 55252,
          totalROI: 119.0
        },
        { 
          year: 10,
          grossRent: 28356,
          vacancy: 1418,
          effectiveRent: 26938,
          expenses: 26940,
          netOperatingIncome: -2,
          debtService: 13212,
          cashFlow: -13214,
          cumulativeCashFlow: -138892,
          propertyValue: 330775,
          loanBalance: 137250,
          equity: 193525,
          principalPaydown: 2640,
          totalReturn: 76859,
          totalROI: 165.6
        },
        { 
          year: 15,
          grossRent: 33648,
          vacancy: 1682,
          effectiveRent: 31966,
          expenses: 30487,
          netOperatingIncome: 1479,
          debtService: 13212,
          cashFlow: -11733,
          cumulativeCashFlow: -194625,
          propertyValue: 418394,
          loanBalance: 124785,
          equity: 293609,
          principalPaydown: 3256,
          totalReturn: 135232,
          totalROI: 291.3
        },
        { 
          year: 20,
          grossRent: 39936,
          vacancy: 1997,
          effectiveRent: 37939,
          expenses: 34501,
          netOperatingIncome: 3438,
          debtService: 13212,
          cashFlow: -9774,
          cumulativeCashFlow: -241665,
          propertyValue: 529135,
          loanBalance: 109515,
          equity: 419620,
          principalPaydown: 4015,
          totalReturn: 226970,
          totalROI: 488.9
        },
        { 
          year: 25,
          grossRent: 47412,
          vacancy: 2371,
          effectiveRent: 45041,
          expenses: 39048,
          netOperatingIncome: 5993,
          debtService: 13212,
          cashFlow: -7219,
          cumulativeCashFlow: -277360,
          propertyValue: 669349,
          loanBalance: 90685,
          equity: 578664,
          principalPaydown: 4950,
          totalReturn: 356254,
          totalROI: 767.3
        },
        { 
          year: 30,
          grossRent: 56268,
          vacancy: 2813,
          effectiveRent: 53455,
          expenses: 44195,
          netOperatingIncome: 9260,
          debtService: 13212,
          cashFlow: -3952,
          cumulativeCashFlow: -297172,
          propertyValue: 846621,
          loanBalance: 0,
          equity: 846621,
          principalPaydown: 13212,
          totalReturn: 595877,
          totalROI: 1283.5
        }
      ],
      totalRentalIncome: 1053432,
      totalCashFlow: -297172,
      principalPaydown: 157500,
      propertyAppreciation: 636621,
      totalReturn: 595877,
      averageAnnualReturn: 19863,
      totalROI: 1283.5,
      equityAtYear30: 846621,
      analysis: "Despite negative cash flow initially, the BRRRR strategy creates massive wealth through forced appreciation and equity growth. The 1,283% ROI represents 12.8X return on the $15,928 left in the deal. With Section 8 or strategic rent increases, cash flow turns positive after year 15."
    },
    
    confidence: "high",
    status: "active",
    daysOnMarket: 0,
    timeframe: "4 months",
    cashRequired: 46428,
    totalROI: 666,
    roi: 666,
    
    isDraft: false,
    isFeatured: true,
    listingUrl: "https://www.realtor.com/realestateandhomes-detail/3505-Garner-Ave_Kansas-City_MO_64124_M81492-45661",
    listingSource: "Realtor.com",
    
    images: [
      "/api/placeholder/400/300"
    ],
    
    createdAt: new Date(),
    updatedAt: new Date()
  }
];