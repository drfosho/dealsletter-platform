// Comprehensive property data parser for investment analysis text

interface ParsedProperty {
  [key: string]: any;
}

export function parsePropertyAnalysis(text: string): ParsedProperty {
  const property: ParsedProperty = {
    // Basic Info - matching dashboard properties
    title: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    location: '', // Full location string like "Lafayette, CA 94549"
    type: 'Single Family', // e.g., "Premium Flip", "Duplex", "Value-Add Multifamily"
    propertyType: 'Single Family',
    strategy: 'Buy & Hold', // e.g., "Fix & Flip", "House Hack"
    
    // Property Details
    bedrooms: 0,
    bathrooms: 0,
    sqft: 0,
    yearBuilt: null,
    units: 1,
    lotSize: '',
    parking: '',
    condition: '',
    
    // Financial Metrics
    price: 0,
    downPayment: 0,
    downPaymentPercent: 25,
    recommendedOffer: 0,
    arv: 0, // After Repair Value for flips
    rehabBudget: 0,
    netProfit: 0,
    roi: 0,
    annualizedROI: 0,
    
    // Rental Income
    monthlyRent: 0,
    currentRent: 0,
    projectedRent: 0,
    effectiveMortgage: 0,
    pricePerUnit: 0,
    
    // Investment Metrics
    capRate: 0,
    currentCapRate: 0,
    proFormaCapRate: 0,
    cashOnCashReturn: 0,
    totalROI: 0,
    monthlyCashFlow: 0,
    monthlyCashFlowAfter: 0,
    proFormaCashFlow: 0,
    monthlyIncome: 0,
    proFormaIncome: 0,
    currentIncome: 0,
    
    // Status & Timing
    status: 'active',
    daysOnMarket: 0,
    confidence: 'medium',
    riskLevel: 'medium',
    timeframe: '',
    walkScore: 0,
    
    // Rich Features & Descriptions
    features: [], // e.g., ["Spectacular Views", "A+ Schools", "Cosmetic Only"]
    description: '',
    neighborhood: '',
    marketAnalysis: '',
    competitiveOffer: '',
    whyThisDeal: '',
    
    // Investment Analysis
    investmentStrategy: 'Buy & Hold',
    exitStrategy: '',
    holdPeriod: 0,
    flipTimeline: 0,
    appreciationRate: 5,
    rentGrowthRate: 3,
    
    // Expenses
    propertyTaxes: 0,
    insurance: 0,
    hoaFees: 0,
    utilities: 0,
    maintenance: 0,
    managementFee: 0,
    
    // Financing
    loanAmount: 0,
    interestRate: 0,
    loanTerm: 30,
    loanType: 'Conventional',
    monthlyPI: 0,
    points: 0,
    
    // Transaction Costs
    closingCosts: 0,
    rehabCosts: 0,
    holdingCosts: 0,
    sellingCosts: 0,
    cashRequired: 0,
    totalCashIn: 0,
    
    // Arrays for rich data
    pros: [],
    cons: [],
    comparables: [],
    winningOfferStrategy: [],
    
    // Professional touches
    images: ["/api/placeholder/400/300"],
    isDraft: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const textLower = text.toLowerCase();
  
  // ===== LOCATION PARSING =====
  
  // Enhanced address patterns
  const addressPatterns = [
    // Standard format: 123 Main St, City, ST 12345
    /(\d+\s+[^,\n]+),\s*([^,\n]+),\s*(\w{2})\s+(\d{5})/,
    // With labels: Address: 123 Main St, City, ST 12345
    /(?:property|address|location|📍)[:：]?\s*([^,\n]+),\s*([^,\n]+),\s*(\w{2})\s+(\d{5})/i,
    // Informal: 123 Main Street in City, ST
    /(\d+\s+[^,\n]+)\s+in\s+([^,\n]+),\s*(\w{2})/i,
    // Just address and city/state
    /^([^,\n]+),\s*([^,\n]+),\s*(\w{2})$/m,
  ];
  
  for (const pattern of addressPatterns) {
    const match = text.match(pattern);
    if (match) {
      property.address = match[1].trim();
      property.city = match[2].trim();
      property.state = match[3].trim();
      property.zipCode = match[4]?.trim() || '';
      property.title = property.address;
      break;
    }
  }

  // ===== FINANCIAL METRICS PARSING =====
  
  // Purchase Price - multiple formats
  const pricePatterns = [
    /(?:purchase\s+)?price[:：]?\s*\$?([\d,]+(?:\.\d{2})?)/i,
    /(?:asking|list|listing)\s+(?:price)?[:：]?\s*\$?([\d,]+(?:\.\d{2})?)/i,
    /\$?([\d,]+(?:\.\d{2})?)\s*(?:asking|list|purchase|listing)/i,
    /💰\s*\$?([\d,]+(?:\.\d{2})?)/,
    /for\s+\$?([\d,]+(?:\.\d{2})?)/i,
  ];
  
  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      property.price = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  // Down Payment - handle both $ and %
  const downPaymentPatterns = [
    /down\s*payment\s*(?:\([^)]+\))?[:：]?\s*\$?([\d,]+)/i,
    /(\d+)%\s*down(?:\s*payment)?/i,
    /down[:：]?\s*\$?([\d,]+)/i,
    /💵\s*down[:：]?\s*\$?([\d,]+)/,
  ];
  
  for (const pattern of downPaymentPatterns) {
    const match = text.match(pattern);
    if (match) {
      if (pattern.toString().includes('%')) {
        property.downPaymentPercent = parseFloat(match[1]);
        property.downPayment = property.price * (property.downPaymentPercent / 100);
      } else {
        property.downPayment = parseFloat(match[1].replace(/,/g, ''));
        if (property.price > 0) {
          property.downPaymentPercent = (property.downPayment / property.price) * 100;
        }
      }
      break;
    }
  }

  // Monthly Rent - enhanced patterns
  const rentPatterns = [
    /(?:monthly\s+)?rent(?:al)?(?:\s+income)?[:：]?\s*\$?([\d,]+)(?:\/mo(?:nth)?)?/i,
    /gross\s+rent[:：]?\s*\$?([\d,]+)/i,
    /\$?([\d,]+)\s*(?:\/month|per\s+month|monthly)\s*(?:rent|income)?/i,
    /rents?\s+(?:for|at)\s+\$?([\d,]+)/i,
    /rental\s+income[:：]?\s*\$?([\d,]+)/i,
  ];
  
  for (const pattern of rentPatterns) {
    const match = text.match(pattern);
    if (match) {
      property.monthlyRent = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  // Cap Rate - enhanced
  const capRatePatterns = [
    /cap\s*(?:rate)?[:：]?\s*([\d.]+)%?/i,
    /capitalization\s+rate[:：]?\s*([\d.]+)%?/i,
    /([\d.]+)%?\s*cap\s*rate/i,
    /📊\s*cap\s*rate[:：]?\s*([\d.]+)%?/i,
  ];
  
  for (const pattern of capRatePatterns) {
    const match = text.match(pattern);
    if (match) {
      property.capRate = parseFloat(match[1]);
      break;
    }
  }

  // Cash Flow - monthly and annual
  const cashFlowPatterns = [
    /(?:monthly\s+)?cash\s*flow[:：]?\s*\$?([\d,]+)(?:\/mo(?:nth)?)?/i,
    /\$?([\d,]+)\s*(?:monthly\s+)?cash\s*flow/i,
    /cash\s*flow\s*(?:per\s+month)?[:：]?\s*\$?([\d,]+)/i,
    /💰\s*cash\s*flow[:：]?\s*\$?([\d,]+)/,
  ];
  
  for (const pattern of cashFlowPatterns) {
    const match = text.match(pattern);
    if (match) {
      property.monthlyCashFlow = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  // ROI / Cash-on-Cash Return
  const roiPatterns = [
    /(?:total\s+)?roi[:：]?\s*([\d.]+)%?/i,
    /(?:cash-on-cash|coc|cash\s+on\s+cash)(?:\s+return)?[:：]?\s*([\d.]+)%?/i,
    /return\s+on\s+investment[:：]?\s*([\d.]+)%?/i,
    /([\d.]+)%?\s*(?:roi|return)/i,
    /annual(?:ized)?\s+return[:：]?\s*([\d.]+)%?/i,
  ];
  
  for (const pattern of roiPatterns) {
    const match = text.match(pattern);
    if (match) {
      property.totalROI = parseFloat(match[1]);
      break;
    }
  }

  // ===== PROPERTY DETAILS =====
  
  // Property Type - comprehensive
  const typeMapping: { [key: string]: string } = {
    'single family': 'Single Family',
    'single-family': 'Single Family',
    'sfh': 'Single Family',
    'sfr': 'Single Family',
    'house': 'Single Family',
    'duplex': 'Duplex',
    'triplex': 'Triplex',
    'fourplex': 'Fourplex',
    'quadplex': 'Fourplex',
    '4-plex': 'Fourplex',
    'multifamily': 'Multifamily',
    'multi-family': 'Multifamily',
    'apartment': 'Multifamily',
    'apartments': 'Multifamily',
    'mobile home park': 'Mobile Home Park',
    'mhp': 'Mobile Home Park',
    'commercial': 'Commercial',
    'mixed use': 'Mixed Use',
    'mixed-use': 'Mixed Use',
  };
  
  for (const [key, value] of Object.entries(typeMapping)) {
    if (textLower.includes(key)) {
      property.propertyType = value;
      break;
    }
  }

  // Beds/Baths - enhanced patterns
  const bedBathPattern = /(\d+)\s*(?:bed|bd|br)(?:room)?s?\s*(?:\/|,|and)?\s*(\d+(?:\.\d+)?)\s*(?:bath|ba)(?:room)?s?/i;
  const bedBathMatch = text.match(bedBathPattern);
  if (bedBathMatch) {
    property.bedrooms = parseInt(bedBathMatch[1]);
    property.bathrooms = parseFloat(bedBathMatch[2]);
  } else {
    // Try separate patterns
    const bedMatch = text.match(/(\d+)\s*(?:bed|bd|br|bedroom)s?/i);
    if (bedMatch) property.bedrooms = parseInt(bedMatch[1]);
    
    const bathMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:bath|ba|bathroom)s?/i);
    if (bathMatch) property.bathrooms = parseFloat(bathMatch[1]);
  }

  // Square Footage
  const sqftPatterns = [
    /(\d{1,3},?\d{3})\s*(?:sq\.?\s*ft\.?|sqft|sf|square\s+feet)/i,
    /(?:square\s+feet|sq\s*ft|size)[:：]?\s*([\d,]+)/i,
    /(\d{3,5})\s*sf/i,
    /📐\s*([\d,]+)\s*(?:sq\s*ft)?/,
  ];
  
  for (const pattern of sqftPatterns) {
    const match = text.match(pattern);
    if (match) {
      property.sqft = parseInt(match[1].replace(/,/g, ''));
      break;
    }
  }

  // Year Built
  const yearPatterns = [
    /(?:year\s+)?built[:：]?\s*(\d{4})/i,
    /(?:built|constructed)\s+(?:in\s+)?(\d{4})/i,
    /(\d{4})\s+construction/i,
    /🏗️\s*(\d{4})/,
  ];
  
  for (const pattern of yearPatterns) {
    const match = text.match(pattern);
    if (match) {
      property.yearBuilt = parseInt(match[1]);
      break;
    }
  }

  // ===== EXPENSES & FINANCING =====
  
  // Property Taxes
  const taxPatterns = [
    /(?:property\s+)?tax(?:es)?[:：]?\s*\$?([\d,]+)(?:\/yr|\/year|annually)?/i,
    /annual\s+tax(?:es)?[:：]?\s*\$?([\d,]+)/i,
    /\$?([\d,]+)\s*(?:property\s+)?tax(?:es)?/i,
  ];
  
  for (const pattern of taxPatterns) {
    const match = text.match(pattern);
    if (match) {
      property.propertyTaxes = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  // Insurance
  const insurancePatterns = [
    /insurance[:：]?\s*\$?([\d,]+)(?:\/yr|\/year|annually)?/i,
    /homeowners?\s+insurance[:：]?\s*\$?([\d,]+)/i,
    /\$?([\d,]+)\s*insurance/i,
  ];
  
  for (const pattern of insurancePatterns) {
    const match = text.match(pattern);
    if (match) {
      property.insurance = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  // HOA Fees
  const hoaPatterns = [
    /hoa(?:\s+fees?)?[:：]?\s*\$?([\d,]+)(?:\/mo(?:nth)?)?/i,
    /homeowners?\s+association[:：]?\s*\$?([\d,]+)/i,
    /\$?([\d,]+)\s*hoa/i,
  ];
  
  for (const pattern of hoaPatterns) {
    const match = text.match(pattern);
    if (match) {
      property.hoaFees = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  // Rehab/Renovation Costs
  const rehabPatterns = [
    /(?:rehab|renovation|repair)(?:\s+costs?|\s+budget)?[:：]?\s*\$?([\d,]+)/i,
    /repairs?\s+needed[:：]?\s*\$?([\d,]+)/i,
    /\$?([\d,]+)\s*(?:rehab|renovation|repairs?)/i,
    /fix\s+up\s+costs?[:：]?\s*\$?([\d,]+)/i,
  ];
  
  for (const pattern of rehabPatterns) {
    const match = text.match(pattern);
    if (match) {
      property.rehabCosts = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  // Closing Costs
  const closingMatch = text.match(/closing\s+costs?[:：]?\s*\$?([\d,]+)/i);
  if (closingMatch) {
    property.closingCosts = parseFloat(closingMatch[1].replace(/,/g, ''));
  }

  // Interest Rate
  const interestPatterns = [
    /(?:interest\s+)?rate[:：]?\s*([\d.]+)%?/i,
    /(\d+(?:\.\d+)?)%?\s*(?:interest|apr)/i,
    /loan\s+at\s*([\d.]+)%?/i,
  ];
  
  for (const pattern of interestPatterns) {
    const match = text.match(pattern);
    if (match) {
      property.interestRate = parseFloat(match[1]);
      break;
    }
  }

  // Loan Term
  const loanTermPatterns = [
    /(?:loan\s+)?term[:：]?\s*(\d+)\s*(?:years?|yr)/i,
    /(\d+)[\s-]?year\s+(?:loan|mortgage)/i,
    /financing[:：]?\s*(\d+)\s*years?/i,
  ];
  
  for (const pattern of loanTermPatterns) {
    const match = text.match(pattern);
    if (match) {
      property.loanTerm = parseInt(match[1]);
      break;
    }
  }

  // ===== INVESTMENT STRATEGY & ANALYSIS =====
  
  // Investment Strategy
  const strategies: { [key: string]: string } = {
    'fix and flip': 'Fix & Flip',
    'fix & flip': 'Fix & Flip',
    'flip': 'Fix & Flip',
    'brrrr': 'BRRRR',
    'buy and hold': 'Buy & Hold',
    'buy & hold': 'Buy & Hold',
    'rental': 'Buy & Hold',
    'long term rental': 'Buy & Hold',
    'house hack': 'House Hack',
    'house-hack': 'House Hack',
    'airbnb': 'Short-Term Rental',
    'str': 'Short-Term Rental',
    'short term rental': 'Short-Term Rental',
    'short-term rental': 'Short-Term Rental',
    'vacation rental': 'Short-Term Rental',
  };
  
  for (const [key, value] of Object.entries(strategies)) {
    if (textLower.includes(key)) {
      property.investmentStrategy = value;
      break;
    }
  }

  // Hold Period / Timeline
  const holdPeriodPatterns = [
    /hold\s+(?:period|time)[:：]?\s*(\d+)\s*(?:years?|yr)/i,
    /(\d+)[\s-]?year\s+hold/i,
    /timeline[:：]?\s*(\d+)\s*(?:years?|yr)/i,
    /exit\s+(?:in\s+)?(\d+)\s*years?/i,
  ];
  
  for (const pattern of holdPeriodPatterns) {
    const match = text.match(pattern);
    if (match) {
      property.holdPeriod = parseInt(match[1]);
      break;
    }
  }

  // Confidence Level
  if (textLower.includes('high confidence') || textLower.includes('great deal') || 
      textLower.includes('excellent opportunity') || textLower.includes('strong buy')) {
    property.confidence = 'high';
  } else if (textLower.includes('low confidence') || textLower.includes('risky') || 
             textLower.includes('significant concerns') || textLower.includes('avoid')) {
    property.confidence = 'low';
  }

  // Risk Level
  if (textLower.includes('low risk') || textLower.includes('conservative') || 
      textLower.includes('stable')) {
    property.riskLevel = 'low';
  } else if (textLower.includes('high risk') || textLower.includes('speculative') || 
             textLower.includes('aggressive')) {
    property.riskLevel = 'high';
  }

  // ===== LISTS & FEATURES =====
  
  // Extract Features (bullet points or comma-separated)
  const featuresSection = text.match(/(?:features?|amenities|highlights?)[:：]?\s*((?:[•\-*]\s*[^\n]+\n?)+|(?:[^,\n]+(?:,\s*[^,\n]+)*))/i);
  if (featuresSection) {
    if (featuresSection[1].includes('•') || featuresSection[1].includes('-') || featuresSection[1].includes('*')) {
      property.features = featuresSection[1]
        .split(/\n/)
        .map(f => f.replace(/^[•\-*]\s*/, '').trim())
        .filter(f => f && f.length < 100);
    } else {
      property.features = featuresSection[1]
        .split(/,/)
        .map(f => f.trim())
        .filter(f => f && f.length < 100);
    }
  }

  // Extract Pros
  const prosSection = text.match(/(?:pros?|advantages?|benefits?|positives?|strengths?|✅)[:：]?\s*((?:[•\-*]\s*[^\n]+\n?)+)/i);
  if (prosSection) {
    property.pros = prosSection[1]
      .split(/\n/)
      .map(p => p.replace(/^[•\-*✅]\s*/, '').trim())
      .filter(p => p && p.length > 5);
  }

  // Extract Cons
  const consSection = text.match(/(?:cons?|disadvantages?|risks?|negatives?|challenges?|concerns?|❌)[:：]?\s*((?:[•\-*]\s*[^\n]+\n?)+)/i);
  if (consSection) {
    property.cons = consSection[1]
      .split(/\n/)
      .map(c => c.replace(/^[•\-*❌]\s*/, '').trim())
      .filter(c => c && c.length > 5);
  }

  // ===== TIMELINE & SCENARIOS =====
  
  // Extract Timeline/Milestones
  const timelineSection = text.match(/(?:timeline|milestones?|schedule)[:：]?\s*((?:[•\-*]\s*[^\n]+\n?)+)/i);
  if (timelineSection) {
    const timelineItems = timelineSection[1]
      .split(/\n/)
      .map(item => {
        const cleaned = item.replace(/^[•\-*]\s*/, '').trim();
        const timeMatch = cleaned.match(/^((?:year|month|week)\s*\d+|(?:\d+[-\s]\d+|[\d.]+)\s*(?:months?|years?|weeks?))[:：]?\s*(.+)/i);
        if (timeMatch) {
          return {
            period: timeMatch[1],
            event: timeMatch[2].trim(),
            impact: ''
          };
        }
        return null;
      })
      .filter(item => item !== null);
    
    if (timelineItems.length > 0) {
      property.timeline = timelineItems;
    }
  }

  // ===== MARKET ANALYSIS =====
  
  // Days on Market
  const domPatterns = [
    /(?:days?\s+on\s+market|dom)[:：]?\s*(\d+)/i,
    /(\d+)\s*days?\s+(?:on\s+market|listed)/i,
    /listed\s+(\d+)\s+days?\s+ago/i,
  ];
  
  for (const pattern of domPatterns) {
    const match = text.match(pattern);
    if (match) {
      property.daysOnMarket = parseInt(match[1]);
      break;
    }
  }

  // ARV (After Repair Value) for flips
  const arvPatterns = [
    /(?:arv|after\s+repair\s+value)[:：]?\s*\$?([\d,]+)/i,
    /value\s+after\s+(?:repairs?|renovation)[:：]?\s*\$?([\d,]+)/i,
    /\$?([\d,]+)\s*arv/i,
  ];
  
  for (const pattern of arvPatterns) {
    const match = text.match(pattern);
    if (match) {
      property.arv = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  // ===== DESCRIPTION & SUMMARY =====
  
  // Extract description or summary
  const descPatterns = [
    /(?:summary|description|overview|about)[:：]?\s*([^\n]+(?:\n[^\n]+){0,3})/i,
    /(?:property\s+)?details?[:：]?\s*([^\n]+(?:\n[^\n]+){0,3})/i,
  ];
  
  for (const pattern of descPatterns) {
    const match = text.match(pattern);
    if (match) {
      property.description = match[1].trim().replace(/\n/g, ' ');
      break;
    }
  }

  // If no description, create one from available data
  if (!property.description && property.address) {
    const parts = [];
    if (property.bedrooms && property.bathrooms) {
      parts.push(`${property.bedrooms}bd/${property.bathrooms}ba`);
    }
    if (property.propertyType) {
      parts.push(property.propertyType.toLowerCase());
    }
    if (property.city && property.state) {
      parts.push(`in ${property.city}, ${property.state}`);
    }
    if (property.investmentStrategy) {
      parts.push(`${property.investmentStrategy} opportunity`);
    }
    if (property.capRate > 0) {
      parts.push(`${property.capRate.toFixed(1)}% cap rate`);
    }
    property.description = parts.join(' ');
  }

  // ===== ENHANCED PROFESSIONAL PARSING =====
  
  // Detect investment type and strategy
  if (textLower.includes('flip') || textLower.includes('arv') || textLower.includes('after repair value')) {
    property.strategy = 'Fix & Flip';
    property.investmentStrategy = 'Fix & Flip';
    if (textLower.includes('premium') || textLower.includes('luxury')) {
      property.type = 'Premium Flip';
    }
  } else if (textLower.includes('house hack') || textLower.includes('househack')) {
    property.strategy = 'House Hack';
    property.investmentStrategy = 'House Hack';
    property.type = 'Duplex';
  } else if (textLower.includes('value-add') || textLower.includes('value add')) {
    property.type = 'Value-Add Multifamily';
    property.strategy = 'Buy & Hold';
  }
  
  // Extract market analysis
  const marketAnalysisMatch = text.match(/market\s+(?:analysis|conditions?|insights?)[:：]?\s*([^.!?]+[.!?](?:\s*[^.!?]+[.!?]){0,3})/i);
  if (marketAnalysisMatch) {
    property.marketAnalysis = marketAnalysisMatch[1].trim();
  }
  
  // Extract competitive offer strategy
  const competitiveOfferMatch = text.match(/(?:competitive\s+)?offer\s+strategy[:：]?\s*([^.!?]+[.!?])/i);
  if (competitiveOfferMatch) {
    property.competitiveOffer = competitiveOfferMatch[1].trim();
  }
  
  // Extract key features
  const featureKeywords = [
    { pattern: /a\+?\s*schools?/i, feature: 'A+ Schools' },
    { pattern: /10[-\s]?rated\s+schools?/i, feature: 'A+ Schools' },
    { pattern: /spectacular\s+views?/i, feature: 'Spectacular Views' },
    { pattern: /ocean\s+views?/i, feature: 'Ocean Views' },
    { pattern: /mountain\s+views?/i, feature: 'Mountain Views' },
    { pattern: /cosmetic(?:\s+only)?/i, feature: 'Cosmetic Only' },
    { pattern: /turn[-\s]?key/i, feature: 'Turnkey' },
    { pattern: /fully\s+renovated/i, feature: 'Fully Renovated' },
    { pattern: /value[-\s]?add/i, feature: 'Value-Add Opportunity' },
    { pattern: /fha\s+(?:approved|eligible)/i, feature: 'FHA Eligible' },
    { pattern: /5%\s+down/i, feature: 'FHA 5% Down' },
    { pattern: /(?:100%|fully)\s+occupied/i, feature: '100% Occupied' },
    { pattern: /below\s+market/i, feature: 'Below Market' },
    { pattern: /section\s+8/i, feature: 'Section 8 Opportunity' },
  ];
  
  for (const { pattern, feature } of featureKeywords) {
    if (pattern.test(text) && !property.features.includes(feature)) {
      property.features.push(feature);
    }
  }
  
  // ARV for flips
  const arvMatch = text.match(/(?:arv|after\s+repair\s+value)[:：]?\s*\$?([\d,]+)/i);
  if (arvMatch) {
    property.arv = parseFloat(arvMatch[1].replace(/,/g, ''));
  }
  
  // Net profit
  const profitMatch = text.match(/(?:net\s+)?profit[:：]?\s*\$?([\d,]+)/i);
  if (profitMatch) {
    property.netProfit = parseFloat(profitMatch[1].replace(/,/g, ''));
  }
  
  // Recommended offer
  const recommendedMatch = text.match(/recommended\s+offer[:：]?\s*\$?([\d,]+)/i);
  if (recommendedMatch) {
    property.recommendedOffer = parseFloat(recommendedMatch[1].replace(/,/g, ''));
  }
  
  // Cash required
  const cashRequiredMatch = text.match(/(?:cash\s+required|total\s+cash)[:：]?\s*\$?([\d,]+)/i);
  if (cashRequiredMatch) {
    property.cashRequired = parseFloat(cashRequiredMatch[1].replace(/,/g, ''));
  }
  
  // Timeline/Timeframe
  const timeframeMatch = text.match(/(?:timeline|timeframe|time\s+frame)[:：]?\s*([^,\n]+)/i);
  if (timeframeMatch) {
    property.timeframe = timeframeMatch[1].trim();
  }
  
  // Risk level
  if (textLower.includes('low risk')) property.riskLevel = 'low';
  else if (textLower.includes('high risk')) property.riskLevel = 'high';
  else if (textLower.includes('medium risk') || textLower.includes('moderate risk')) property.riskLevel = 'medium';
  
  // Confidence level
  if (textLower.includes('high confidence')) property.confidence = 'high';
  else if (textLower.includes('low confidence')) property.confidence = 'low';
  
  // Walk Score
  const walkScoreMatch = text.match(/walk\s*score[:：]?\s*(\d+)/i);
  if (walkScoreMatch) {
    property.walkScore = parseInt(walkScoreMatch[1]);
  }
  
  // Units for multifamily
  const unitsMatch = text.match(/(\d+)\s*units?/i);
  if (unitsMatch) {
    property.units = parseInt(unitsMatch[1]);
  }
  
  // Enhanced description
  if (!property.description && property.address) {
    const descriptors = [];
    if (property.features.includes('Spectacular Views')) descriptors.push('with spectacular views');
    if (property.features.includes('A+ Schools')) descriptors.push('in A+ rated school district');
    if (property.strategy === 'Fix & Flip') descriptors.push('perfect for flipping');
    if (property.strategy === 'House Hack') descriptors.push('ideal house hack opportunity');
    
    property.description = `Prime investment opportunity ${descriptors.join(' and ')}. ${property.marketAnalysis || ''}`.trim();
  }
  
  // Set location string
  if (property.city && property.state && property.zipCode) {
    property.location = `${property.city}, ${property.state} ${property.zipCode}`;
  }
  
  // Calculate any missing metrics
  if (property.price > 0) {
    // Calculate loan amount if not found
    if (!property.loanAmount && property.downPayment > 0) {
      property.loanAmount = property.price - property.downPayment;
    }
    
    // Calculate cap rate if not found
    if (property.monthlyRent > 0 && property.capRate === 0) {
      const annualNOI = (property.monthlyRent * 12) - 
        (property.propertyTaxes || 0) - 
        (property.insurance || 0) - 
        ((property.hoaFees || 0) * 12);
      property.capRate = (annualNOI / property.price) * 100;
    }
    
    // Calculate GRM (Gross Rent Multiplier)
    if (property.monthlyRent > 0) {
      property.grm = property.price / (property.monthlyRent * 12);
    }
    
    // Calculate price per sqft
    if (property.sqft > 0) {
      property.pricePerSqFt = property.price / property.sqft;
    }
    
    // For flips, calculate ROI
    if (property.strategy === 'Fix & Flip' && property.netProfit > 0 && property.cashRequired > 0) {
      property.roi = (property.netProfit / property.cashRequired) * 100;
      property.totalROI = property.roi;
    }
  }
  
  // Set property title if not already set
  if (!property.title && property.address) {
    property.title = property.address;
  }

  return property;
}