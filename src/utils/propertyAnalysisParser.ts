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
    description: description
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
    if (line.includes('Cap Rate') || line.includes('cap rate')) {
      // Look for current and pro forma
      const currentMatch = line.match(/(\d+\.?\d*)%?\s*[Cc]urrent/);
      const proFormaMatch = line.match(/(\d+\.?\d*)%?\s*[Pp]ro\s*[Ff]orma/);
      
      if (currentMatch) {
        rates.current = parseFloat(currentMatch[1]);
      }
      if (proFormaMatch) {
        rates.proForma = parseFloat(proFormaMatch[1]);
      }
      
      // Alternative format
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
    if (line.includes('NOI') || line.includes('Net Operating Income')) {
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
    if (line.includes('Cash-on-Cash') || line.includes('cash on cash')) {
      const match = line.match(/(\d+\.?\d*)%/);
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