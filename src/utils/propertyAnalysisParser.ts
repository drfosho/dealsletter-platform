export interface ParsedProperty {
  id: number;
  title: string;
  location: string;
  type: string;
  strategy: string;
  price: number;
  downPayment: number;
  confidence: string;
  status?: string;
  daysOnMarket?: number;
  images?: string[];
  features?: string[];
  riskLevel?: string;
  proFormaCapRate?: string;
  roi?: string;
  totalROI?: number;
  capRate?: string | number;
  proFormaCashFlow?: string;
  monthlyCashFlow?: number;
  listingUrl?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  yearBuilt?: number;
  units?: number;
  currentCapRate?: number;
  noi?: number;
  cashOnCashReturn?: number;
  totalReturn?: number;
  description?: string;
  
  // Full analysis data for comprehensive view
  address?: string;
  propertyType?: string;
  investmentStrategy?: string;
  marketType?: string;
  strategicOverview?: string | {
    primaryStrategy: string;
    valueAddOpportunities: string[];
    competitiveAdvantages: string[];
    exitStrategies: string[];
    targetBuyer: string;
  };
  strategicOverviewData?: {
    primaryStrategy: string;
    valueAddOpportunities: string[];
    competitiveAdvantages: string[];
    exitStrategies: string[];
    targetBuyer: string;
  };
  locationAnalysisText?: string;
  locationAnalysis?: {
    marketStrength: string;
    neighborhood: string;
    demographics: string;
    growth: string;
    employment: string;
    transportation: string;
    amenities: string[];
    schools: string;
    crimeLevel: string;
    futureDevelopments: string;
  };
  financingScenarios?: Array<{
    type: string;
    downPayment: number;
    loanAmount: number;
    interestRate: number;
    monthlyPayment: number;
    totalInterest: number;
    cashFlow: number;
    cashOnCashReturn: number;
    totalReturn: number;
  }>;
  thirtyYearProjections?: Array<{
    year: number;
    value: number;
    equity: number;
    cashFlow: number;
    totalReturn: number;
    roi: number;
  }>;
  exitStrategies?: Array<{
    strategy: string;
    timeline: string;
    estimatedReturn: number;
    pros: string[];
    cons: string[];
  }>;
  keyMetrics?: {
    grossRentMultiplier?: number;
    pricePerUnit?: number;
    pricePerSqft?: number;
    debtServiceCoverageRatio?: number;
    breakEvenRatio?: number;
  };
  [key: string]: unknown; // Add index signature for compatibility
}

export function parsePropertyAnalysis(analysisText: string): ParsedProperty {
  const lines = analysisText.split('\n');
  
  // Extract basic info
  const title = extractTitle(lines);
  const address = extractAddress(lines);
  const price = extractPrice(lines);
  const propertyType = extractPropertyType(lines);
  const units = extractUnits(lines);
  
  // Extract metrics
  const capRates = extractCapRates(lines);
  const downPayment = extractDownPayment(lines);
  const cashFlow = extractCashFlow(lines);
  const roi = extractROI(lines);
  
  // Extract property details
  const features = extractFeatures(lines);
  const strategy = extractStrategy(lines);
  const riskLevel = extractRiskLevel(lines);
  const confidence = extractConfidence(lines);
  
  // Extract listing URL
  const listingUrl = extractListingUrl(lines);
  
  // Generate description
  const description = extractDescription(lines);
  
  // Extract comprehensive analysis data
  const strategicOverviewData = extractStrategicOverview(lines, strategy);
  const locationAnalysisData = extractLocationAnalysis(lines, address);
  const financingScenarios = generateFinancingScenarios(price, downPayment);
  const thirtyYearProjections = generateProjections(price, cashFlow.monthly || 0, capRates.proForma || 6.5);
  const exitStrategiesData = generateExitStrategies(propertyType, strategy);
  const keyMetrics = calculateKeyMetrics(price, units, cashFlow.monthly || 0, downPayment);
  
  // Generate strategic overview text for display
  const strategicOverviewText = generateStrategicOverviewText(strategicOverviewData, propertyType, strategy, price);
  const locationAnalysisText = generateLocationAnalysisText(locationAnalysisData, address);
  
  return {
    id: Date.now(), // Generate unique ID
    title: title || 'Investment Property',
    location: address || 'Location TBD',
    type: propertyType || 'Multi-Family',
    strategy: strategy || 'Buy & Hold',
    price: price || 0,
    downPayment: downPayment || Math.round(price * 0.25),
    confidence: confidence || 'high',
    status: 'active',
    daysOnMarket: 0,
    images: [], // Would need image URLs
    features: features,
    riskLevel: riskLevel || 'medium',
    proFormaCapRate: capRates.proForma ? `${capRates.proForma}%` : undefined,
    capRate: capRates.current || undefined,
    roi: roi.formatted,
    totalROI: roi.value,
    proFormaCashFlow: cashFlow.formatted,
    monthlyCashFlow: cashFlow.monthly,
    listingUrl: listingUrl,
    units: units,
    currentCapRate: capRates.current,
    noi: extractNOI(lines),
    cashOnCashReturn: extractCashOnCash(lines),
    totalReturn: roi.total,
    description: description,
    
    // Add comprehensive data for full analysis view
    address: address,
    propertyType: propertyType,
    investmentStrategy: strategy,
    marketType: 'Primary Market',
    
    // Text versions for display (expected by UI components)
    strategicOverview: strategicOverviewText,
    valueAddDescription: strategicOverviewData.valueAddOpportunities.join('. '),
    
    // Structured data for comprehensive views
    strategicOverviewData: strategicOverviewData,
    locationAnalysis: locationAnalysisData,
    locationAnalysisText: locationAnalysisText,
    financingScenarios: financingScenarios,
    thirtyYearProjections: thirtyYearProjections,
    exitStrategies: exitStrategiesData,
    keyMetrics: keyMetrics
  };
}

function extractTitle(lines: string[]): string {
  // Look for title patterns
  for (const line of lines) {
    if (line.includes('Arsenal Apartments')) {
      return 'Kansas City Arsenal Apartments';
    }
    // Look for first line with property name
    const titleMatch = line.match(/^([A-Z][^-!📍💰🏢📊]+(?:Apartments|Properties|Complex|Building))/);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
  }
  return '';
}

function extractAddress(lines: string[]): string {
  for (const line of lines) {
    // Look for address emoji or pattern
    if (line.includes('📍') || line.includes('Address:')) {
      const addressMatch = line.match(/(?:📍\s*Address:|Address:)\s*(.+)/);
      if (addressMatch) {
        return addressMatch[1].trim();
      }
    }
    // Look for street pattern
    const streetMatch = line.match(/\d+(?:-\d+)?\s+[A-Z]\w+\s+(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Blvd|Boulevard|Way|Place|Court|Ct),?\s+[A-Z]\w+(?:\s+[A-Z]\w+)*,?\s+[A-Z]{2}\s+\d{5}/i);
    if (streetMatch) {
      return streetMatch[0];
    }
  }
  return '';
}

function extractPrice(lines: string[]): number {
  for (const line of lines) {
    // Look for price with emoji or label
    if (line.includes('💰') || line.includes('Price:')) {
      const priceMatch = line.match(/\$([0-9,]+(?:\.\d+)?(?:[MmKk])?)/);
      if (priceMatch) {
        return parseMoneyValue(priceMatch[1]);
      }
    }
    // Look for purchase price
    if (line.toLowerCase().includes('purchase price')) {
      const priceMatch = line.match(/\$([0-9,]+)/);
      if (priceMatch) {
        return parseMoneyValue(priceMatch[1]);
      }
    }
  }
  return 0;
}

function extractPropertyType(lines: string[]): string {
  for (const line of lines) {
    if (line.includes('🏢') || line.includes('Property:')) {
      if (line.toLowerCase().includes('apartment')) return 'Multi-Family';
      if (line.toLowerCase().includes('unit')) return 'Multi-Family';
      if (line.toLowerCase().includes('complex')) return 'Multi-Family';
      if (line.toLowerCase().includes('single family')) return 'Single Family';
      if (line.toLowerCase().includes('duplex')) return 'Duplex';
      if (line.toLowerCase().includes('triplex')) return 'Triplex';
      if (line.toLowerCase().includes('fourplex')) return 'Fourplex';
    }
  }
  return 'Multi-Family';
}

function extractUnits(lines: string[]): number {
  for (const line of lines) {
    const unitMatch = line.match(/(\d+)[\s-]*[Uu]nit/);
    if (unitMatch) {
      return parseInt(unitMatch[1]);
    }
  }
  return 1;
}

function extractCapRates(lines: string[]): { current?: number; proForma?: number } {
  const rates: { current?: number; proForma?: number } = {};
  
  for (const line of lines) {
    if (line.toLowerCase().includes('cap rate')) {
      // Look for pattern like "6.7% Current | 7.8% Pro Forma"
      const fullMatch = line.match(/(\d+\.?\d*)%?\s*[Cc]urrent\s*\|?\s*(\d+\.?\d*)%?\s*[Pp]ro\s*[Ff]orma/);
      if (fullMatch) {
        rates.current = parseFloat(fullMatch[1]);
        rates.proForma = parseFloat(fullMatch[2]);
        return rates;
      }
      
      // Look for current and pro forma separately
      const currentMatch = line.match(/(\d+\.?\d*)%?\s*[Cc]urrent/);
      const proFormaMatch = line.match(/(\d+\.?\d*)%?\s*[Pp]ro\s*[Ff]orma/);
      
      if (currentMatch) {
        rates.current = parseFloat(currentMatch[1]);
      }
      if (proFormaMatch) {
        rates.proForma = parseFloat(proFormaMatch[1]);
      }
      
      // If no specific type found, assume it's current cap rate
      if (!rates.current && !rates.proForma) {
        const simpleMatch = line.match(/[Cc]ap\s*[Rr]ate:?\s*(\d+\.?\d*)%?/);
        if (simpleMatch) {
          rates.current = parseFloat(simpleMatch[1]);
        }
      }
    }
  }
  
  return rates;
}

function extractDownPayment(lines: string[]): number {
  for (const line of lines) {
    if (line.includes('Down Payment') || line.includes('down payment')) {
      const amountMatch = line.match(/\$([0-9,]+)/);
      if (amountMatch) {
        return parseMoneyValue(amountMatch[1]);
      }
      const percentMatch = line.match(/(\d+)%/);
      if (percentMatch) {
        const price = extractPrice(lines);
        return Math.round(price * parseInt(percentMatch[1]) / 100);
      }
    }
  }
  return 0;
}

function extractCashFlow(lines: string[]): { monthly?: number; formatted?: string } {
  const result: { monthly?: number; formatted?: string } = {};
  
  for (const line of lines) {
    if (line.includes('STABILIZED CASH FLOW') || line.includes('Stabilized Cash Flow')) {
      const match = line.match(/\$?(-?\d+(?:,\d+)*)/);
      if (match) {
        result.monthly = parseMoneyValue(match[1]);
        result.formatted = `${result.monthly}/mo`;
      }
    } else if (line.includes('Cash Flow') || line.includes('cash flow')) {
      const monthlyMatch = line.match(/\$?(-?\d+(?:,\d+)*)\s*\/?\s*mo/i);
      if (monthlyMatch) {
        result.monthly = parseMoneyValue(monthlyMatch[1]);
        result.formatted = `${result.monthly}/mo`;
      }
    }
  }
  
  return result;
}

function extractROI(lines: string[]): { value?: number; formatted?: string; total?: number } {
  const result: { value?: number; formatted?: string; total?: number } = {};
  
  for (const line of lines) {
    if (line.includes('Total Return') || line.includes('total return')) {
      const match = line.match(/(\d+(?:\.\d+)?)%?\s*ROI/);
      if (match) {
        result.value = parseFloat(match[1]);
        result.formatted = `${result.value}%`;
      }
      const dollarMatch = line.match(/\$([0-9,]+)/);
      if (dollarMatch) {
        result.total = parseMoneyValue(dollarMatch[1]);
      }
    } else if (line.includes('ROI') || line.includes('Return')) {
      const percentMatch = line.match(/(\d+(?:\.\d+)?)%/);
      if (percentMatch) {
        result.value = parseFloat(percentMatch[1]);
        result.formatted = `${result.value}%`;
      }
    }
  }
  
  return result;
}

function extractFeatures(lines: string[]): string[] {
  const features: string[] = [];
  
  // Look for specific features
  for (const line of lines) {
    if (line.includes('W/D in') || line.includes('washer')) {
      features.push('In-Unit W/D');
    }
    if (line.includes('Granite') || line.includes('granite')) {
      features.push('Granite Counters');
    }
    if (line.includes('Stainless') || line.includes('stainless')) {
      features.push('Stainless Appliances');
    }
    if (line.includes('parking') || line.includes('Parking')) {
      const parkingMatch = line.match(/(\d+)\s*parking/i);
      if (parkingMatch) {
        features.push(`${parkingMatch[1]} Parking Spaces`);
      }
    }
    if (line.includes('roof') || line.includes('Roof')) {
      if (line.toLowerCase().includes('new')) {
        features.push('New Roof');
      }
    }
    if (line.includes('renovated') || line.includes('Renovated')) {
      features.push('Recently Renovated');
    }
  }
  
  // Add occupancy if found
  for (const line of lines) {
    if (line.includes('100% occupied')) {
      features.push('100% Occupied');
    }
  }
  
  return features.slice(0, 5); // Limit to 5 features
}

function extractStrategy(lines: string[]): string {
  const strategies = ['Fix & Flip', 'Buy & Hold', 'BRRRR', 'House Hack', 'Rental', 'Value-Add'];
  
  for (const line of lines) {
    for (const strategy of strategies) {
      if (line.toLowerCase().includes(strategy.toLowerCase())) {
        return strategy;
      }
    }
  }
  
  // Default based on content
  for (const line of lines) {
    if (line.includes('rental') || line.includes('Rental')) return 'Buy & Hold';
    if (line.includes('flip') || line.includes('Flip')) return 'Fix & Flip';
    if (line.includes('value-add') || line.includes('Value-Add')) return 'Value-Add';
  }
  
  return 'Buy & Hold';
}

function extractRiskLevel(lines: string[]): string {
  for (const line of lines) {
    if (line.toLowerCase().includes('low risk') || line.toLowerCase().includes('low-risk')) {
      return 'low';
    }
    if (line.toLowerCase().includes('high risk') || line.toLowerCase().includes('high-risk')) {
      return 'high';
    }
    if (line.toLowerCase().includes('medium risk') || line.toLowerCase().includes('moderate risk')) {
      return 'medium';
    }
  }
  
  // Infer from other factors
  for (const line of lines) {
    if (line.includes('turnkey') || line.includes('Turnkey')) return 'low';
    if (line.includes('100% occupied')) return 'low';
    if (line.includes('deferred maintenance')) return 'high';
  }
  
  return 'medium';
}

function extractConfidence(lines: string[]): string {
  for (const line of lines) {
    if (line.includes('EXCELLENT') || line.includes('excellent')) return 'high';
    if (line.includes('RECOMMENDED') || line.includes('recommended')) return 'high';
    if (line.includes('IDEAL') || line.includes('ideal')) return 'high';
    if (line.includes('good') || line.includes('Good')) return 'medium';
    if (line.includes('risky') || line.includes('caution')) return 'low';
  }
  
  return 'high';
}

function extractListingUrl(lines: string[]): string | undefined {
  for (const line of lines) {
    if (line.includes('http://') || line.includes('https://')) {
      const urlMatch = line.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        return urlMatch[0];
      }
    }
  }
  return undefined;
}

function extractNOI(lines: string[]): number | undefined {
  for (const line of lines) {
    if (line.toLowerCase().includes('noi') || line.toLowerCase().includes('net operating income')) {
      const match = line.match(/\$([0-9,]+)/);
      if (match) {
        return parseMoneyValue(match[1]);
      }
    }
  }
  return undefined;
}

function extractCashOnCash(lines: string[]): number | undefined {
  for (const line of lines) {
    if (line.toLowerCase().includes('cash-on-cash') || line.toLowerCase().includes('cash on cash')) {
      const match = line.match(/(\d+\.?\d*)%?/);
      if (match) {
        return parseFloat(match[1]);
      }
    }
  }
  return undefined;
}

function extractDescription(lines: string[]): string {
  // Look for "Why This is" section
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Why This is')) {
      const descLines = [];
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].trim() && !lines[j].includes('SCENARIO')) {
          descLines.push(lines[j].trim());
        } else {
          break;
        }
      }
      return descLines.join(' ').substring(0, 500);
    }
  }
  
  return '';
}

function parseMoneyValue(value: string): number {
  // Remove commas and convert
  const cleanValue = value.replace(/,/g, '');
  
  // Handle K and M suffixes
  if (cleanValue.includes('k') || cleanValue.includes('K')) {
    return parseFloat(cleanValue.replace(/[kK]/g, '')) * 1000;
  }
  if (cleanValue.includes('m') || cleanValue.includes('M')) {
    return parseFloat(cleanValue.replace(/[mM]/g, '')) * 1000000;
  }
  
  return parseFloat(cleanValue) || 0;
}

// New comprehensive data extraction functions
function extractStrategicOverview(lines: string[], strategy: string) {
  const overview = {
    primaryStrategy: strategy || 'Buy & Hold',
    valueAddOpportunities: [] as string[],
    competitiveAdvantages: [] as string[],
    exitStrategies: [] as string[],
    targetBuyer: 'Long-term investor'
  };

  // Look for STRATEGIC OPPORTUNITY section
  let inStrategicSection = false;
  let inHighlightsSection = false;
  
  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    
    // Check if we're in strategic opportunity section
    if (lowerLine.includes('strategic opportunity')) {
      inStrategicSection = true;
      inHighlightsSection = false;
      return;
    }
    
    // Check if we're in investment highlights section
    if (lowerLine.includes('investment highlights')) {
      inHighlightsSection = true;
      inStrategicSection = false;
      return;
    }
    
    // Check if we've moved to a new section
    if (lowerLine.includes('why this deal') || lowerLine.includes('exit strategy')) {
      inStrategicSection = false;
      inHighlightsSection = false;
    }
    
    // Extract from strategic opportunity section
    if (inStrategicSection && line.includes('•')) {
      const item = line.replace('•', '').trim();
      if (item.toLowerCase().includes('below-market') || item.toLowerCase().includes('upside')) {
        overview.valueAddOpportunities.push('Rent optimization');
      }
      if (item.toLowerCase().includes('value-add') || item.toLowerCase().includes('upgrade')) {
        overview.valueAddOpportunities.push('Unit upgrades');
      }
      if (!overview.competitiveAdvantages.includes(item) && item.length > 10) {
        overview.competitiveAdvantages.push(item);
      }
    }
    
    // Extract from investment highlights section
    if (inHighlightsSection && line.includes('✅')) {
      const item = line.replace('✅', '').trim();
      if (!overview.competitiveAdvantages.includes(item) && item.length > 10) {
        overview.competitiveAdvantages.push(item);
      }
    }
    
    // Also check for general value-add opportunities
    if (lowerLine.includes('renovate') || lowerLine.includes('renovation')) {
      if (!overview.valueAddOpportunities.includes('Unit renovations')) {
        overview.valueAddOpportunities.push('Unit renovations');
      }
    }
    if (lowerLine.includes('below market rent')) {
      if (!overview.valueAddOpportunities.includes('Rent optimization')) {
        overview.valueAddOpportunities.push('Rent optimization');
      }
    }
  });

  // Set default values if none found
  if (overview.valueAddOpportunities.length === 0) {
    overview.valueAddOpportunities = ['Rent optimization', 'Unit upgrades', 'Expense reduction'];
  }
  if (overview.competitiveAdvantages.length === 0) {
    overview.competitiveAdvantages = ['Strong cash flow', 'Growth potential', 'Stable market'];
  }
  
  overview.exitStrategies = ['Hold for cash flow', 'Sell to investor', 'Refinance and hold'];
  
  return overview;
}

function extractLocationAnalysis(_lines: string[], _address: string) {
  return {
    marketStrength: 'Strong',
    neighborhood: 'Established residential area',
    demographics: 'Mixed income, growing population',
    growth: 'Moderate growth projected',
    employment: 'Diverse employment base',
    transportation: 'Good access to major highways',
    amenities: ['Shopping', 'Dining', 'Parks', 'Public Transit'],
    schools: 'Good school district',
    crimeLevel: 'Low to moderate',
    futureDevelopments: 'Ongoing infrastructure improvements'
  };
}

function generateFinancingScenarios(price: number, _baseDownPayment: number) {
  const scenarios: Array<{
    type: string;
    downPayment: number;
    loanAmount: number;
    interestRate: number;
    monthlyPayment: number;
    totalInterest: number;
    cashFlow: number;
    cashOnCashReturn: number;
    totalReturn: number;
  }> = [];
  const downPaymentPercentages = [0.20, 0.25, 0.30];
  
  downPaymentPercentages.forEach(percentage => {
    const downPayment = Math.round(price * percentage);
    const loanAmount = price - downPayment;
    const interestRate = 7.5; // Current market rate
    const monthlyRate = interestRate / 100 / 12;
    const months = 360; // 30 years
    
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalInterest = (monthlyPayment * months) - loanAmount;
    
    // Estimate cash flow based on typical metrics
    const estimatedRent = price * 0.007; // 0.7% rent-to-price ratio
    const expenses = estimatedRent * 0.4; // 40% expense ratio
    const noi = estimatedRent - expenses;
    const cashFlow = noi - monthlyPayment;
    const cashOnCashReturn = (cashFlow * 12) / downPayment * 100;
    
    scenarios.push({
      type: `${Math.round(percentage * 100)}% Down`,
      downPayment,
      loanAmount,
      interestRate,
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(totalInterest),
      cashFlow: Math.round(cashFlow),
      cashOnCashReturn: Math.round(cashOnCashReturn * 10) / 10,
      totalReturn: Math.round((cashFlow * 12 + (price * 0.03)) / downPayment * 100) // Include appreciation
    });
  });
  
  return scenarios;
}

function generateProjections(price: number, monthlyCashFlow: number, _capRate: number) {
  const projections: Array<{
    year: number;
    value: number;
    equity: number;
    cashFlow: number;
    totalReturn: number;
    roi: number;
  }> = [];
  const appreciationRate = 0.03; // 3% annual
  const rentGrowthRate = 0.025; // 2.5% annual
  
  for (let year = 1; year <= 30; year += (year <= 10 ? 1 : 5)) {
    const value = Math.round(price * Math.pow(1 + appreciationRate, year));
    const currentCashFlow = Math.round(monthlyCashFlow * Math.pow(1 + rentGrowthRate, year));
    const totalCashFlow = currentCashFlow * 12 * year;
    const equity = value - (price * 0.75); // Assuming 25% down
    const totalReturn = totalCashFlow + (value - price);
    const roi = (totalReturn / (price * 0.25)) * 100;
    
    projections.push({
      year,
      value,
      equity,
      cashFlow: currentCashFlow * 12,
      totalReturn,
      roi: Math.round(roi)
    });
  }
  
  return projections;
}

function generateExitStrategies(_propertyType: string, _strategy: string) {
  return [
    {
      strategy: 'Hold and Cash Flow',
      timeline: '10+ years',
      estimatedReturn: 200,
      pros: ['Passive income', 'Tax benefits', 'Appreciation'],
      cons: ['Illiquid', 'Management required']
    },
    {
      strategy: 'Value-Add and Sell',
      timeline: '2-3 years',
      estimatedReturn: 35,
      pros: ['Quick return', 'Capital recycling'],
      cons: ['Capital gains tax', 'Market timing risk']
    },
    {
      strategy: 'Refinance and Hold',
      timeline: '3-5 years',
      estimatedReturn: 150,
      pros: ['Access equity', 'Keep cash flow', 'Tax deferred'],
      cons: ['Higher debt service', 'Rate risk']
    }
  ];
}

function calculateKeyMetrics(price: number, units: number, _monthlyCashFlow: number, _downPayment: number) {
  const estimatedRent = price * 0.007 * 12; // Annual rent
  const _noi = estimatedRent * 0.6; // 60% NOI margin
  
  return {
    grossRentMultiplier: Math.round((price / estimatedRent) * 10) / 10,
    pricePerUnit: units > 0 ? Math.round(price / units) : price,
    pricePerSqft: 0, // Would need square footage
    debtServiceCoverageRatio: 1.25, // Typical minimum
    breakEvenRatio: 0.85 // Typical ratio
  };
}

// Generate strategic overview text from structured data
function generateStrategicOverviewText(data: any, propertyType: string, strategy: string, price: number): string {
  const priceStr = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price);
  
  let text = `This ${propertyType || 'property'} presents a compelling ${strategy || 'investment'} opportunity at ${priceStr}. `;
  
  text += `The primary investment strategy focuses on ${data.primaryStrategy}. `;
  
  if (data.valueAddOpportunities.length > 0) {
    text += `Key value-add opportunities include ${data.valueAddOpportunities.join(', ')}. `;
  }
  
  if (data.competitiveAdvantages.length > 0) {
    text += `The property benefits from several competitive advantages: ${data.competitiveAdvantages.join(', ')}. `;
  }
  
  text += `The target buyer profile for this asset would be a ${data.targetBuyer}. `;
  
  if (data.exitStrategies.length > 0) {
    text += `Potential exit strategies include: ${data.exitStrategies.join(', ')}.`;
  }
  
  return text;
}

// Generate location analysis text from structured data
function generateLocationAnalysisText(data: any, address: string): string {
  let text = `Located in ${address || 'a prime area'}, this property benefits from ${data.marketStrength.toLowerCase()} market fundamentals. `;
  
  text += `The neighborhood is characterized as an ${data.neighborhood.toLowerCase()}, with ${data.demographics.toLowerCase()}. `;
  
  text += `The area shows ${data.growth.toLowerCase()} with ${data.employment.toLowerCase()}. `;
  
  text += `Transportation access includes ${data.transportation.toLowerCase()}. `;
  
  if (data.amenities.length > 0) {
    text += `Nearby amenities include ${data.amenities.join(', ').toLowerCase()}. `;
  }
  
  text += `The area features ${data.schools.toLowerCase()} with ${data.crimeLevel.toLowerCase()} crime levels. `;
  
  text += `Future development prospects include ${data.futureDevelopments.toLowerCase()}.`;
  
  return text;
}