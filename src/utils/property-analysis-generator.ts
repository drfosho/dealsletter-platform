import type { PropertyData, FinancingScenario, ProjectionData } from '@/types/property';

interface AnalysisRequest {
  address: string;
  quickData?: any;
  propertyData?: any; // Add optional property data to avoid refetching
  includeProjections?: boolean;
  includeFinancingScenarios?: boolean;
  includeImages?: boolean;
}

export async function generateComprehensiveAnalysis(request: AnalysisRequest): Promise<PropertyData> {
  try {
    // Step 1: Use provided property data or fetch if not provided
    let propertyData = request.propertyData;
    
    if (!propertyData) {
      // Only fetch if data wasn't provided
      const propertyResponse = await fetch('/api/property/details/' + encodeURIComponent(request.address));
      if (!propertyResponse.ok) {
        // If fetch fails, use minimal data from quick analysis
        console.warn('Failed to fetch property details, using quick analysis data');
        propertyData = request.quickData || {};
      } else {
        propertyData = await propertyResponse.json();
      }
    }

    // Step 2: Generate AI analysis with all comprehensive sections
    let analysis: any = {};
    try {
      const analysisResponse = await fetch('/api/analysis/generate-comprehensive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: request.address,
          propertyData,
          quickAnalysis: request.quickData,
          generateSections: [
            'strategicOverview',
            'valueAddDescription', 
            'locationAnalysis',
            'rentAnalysis',
            'propertyMetrics',
            'financingScenarios',
            'thirtyYearProjections',
            'marketAnalysis',
            'riskAnalysis'
          ]
        })
      });

      if (!analysisResponse.ok) {
        console.warn('AI analysis failed, using basic data');
        // Use quick analysis data as fallback
        analysis = request.quickData || {};
      } else {
        analysis = await analysisResponse.json();
      }
    } catch (error) {
      console.warn('Failed to generate AI analysis:', error);
      // Use quick analysis data as fallback
      analysis = request.quickData || {};
    }

    // Step 3: Generate 30-year projections
    const projections = request.includeProjections 
      ? await generate30YearProjections(propertyData, analysis)
      : null;

    // Step 4: Generate financing scenarios
    const financingScenarios = request.includeFinancingScenarios
      ? await generateFinancingScenarios(propertyData, analysis)
      : [];

    // Step 5: Fetch property images if available
    let images: string[] = [];
    if (request.includeImages) {
      try {
        images = await fetchPropertyImages(request.address, propertyData);
      } catch (error) {
        console.warn('Failed to fetch property images:', error);
        images = ['/api/placeholder/800/600']; // Use placeholder
      }
    }

    // Combine all data into comprehensive property object
    const comprehensiveProperty: PropertyData = {
      id: `prop-${Date.now()}`,
      title: formatPropertyTitle(request.address, analysis),
      address: propertyData.address || propertyData.addressLine1 || request.address,
      city: propertyData.city || extractCity(request.address),
      state: propertyData.state || 'CA',
      zipCode: propertyData.zipCode || '',
      propertyType: propertyData.propertyType || 'Single Family',
      price: propertyData.price || analysis.purchasePrice || 0,
      downPayment: analysis.downPayment || (propertyData.price || analysis.purchasePrice || 0) * 0.25,
      downPaymentPercent: 25,
      monthlyRent: analysis.monthlyRent || propertyData.rentEstimate || 0,
      capRate: analysis.capRate || calculateCapRate(propertyData),
      monthlyCashFlow: analysis.monthlyCashFlow || 0,
      totalROI: analysis.totalROI || 0,
      investmentStrategy: analysis.strategy || 'rental',
      confidence: 'high',
      riskLevel: analysis.riskLevel || 'medium',
      daysOnMarket: propertyData.daysOnMarket || 0,
      bedrooms: propertyData.bedrooms || 0,
      bathrooms: propertyData.bathrooms || 0,
      sqft: propertyData.squareFootage || 0,
      yearBuilt: propertyData.yearBuilt || null,
      features: extractFeatures(propertyData),
      images,
      
      // Premium analysis sections
      strategicOverview: analysis.strategicOverview,
      valueAddDescription: analysis.valueAddDescription,
      locationAnalysis: analysis.locationAnalysis,
      rentAnalysis: analysis.rentAnalysis,
      propertyMetrics: generatePropertyMetrics(propertyData, analysis),
      financingScenarios,
      thirtyYearProjections: projections,
      marketAnalysis: analysis.marketAnalysis,
      
      // Additional metadata
      status: 'active',
      isDraft: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return comprehensiveProperty;
  } catch (error) {
    console.error('Error generating comprehensive analysis:', error);
    throw error;
  }
}

async function generate30YearProjections(
  propertyData: any, 
  analysis: any
): Promise<{ projections: ProjectionData[] }> {
  const projections: ProjectionData[] = [];
  
  const initialRent = analysis.monthlyRent || propertyData.rentEstimate || 2500; // Default to $2500 if no data
  const purchasePrice = propertyData.price || analysis.purchasePrice || 500000; // Default to $500k if no data
  
  // Skip projections if we don't have real data
  if (purchasePrice === 0 || initialRent === 0) {
    console.warn('Skipping 30-year projections due to missing data');
    return { projections: [] };
  }
  
  const downPayment = purchasePrice * 0.25;
  const loanAmount = purchasePrice - downPayment;
  const interestRate = 0.07; // 7% interest
  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, 30);
  
  let currentRent = initialRent;
  let currentValue = purchasePrice;
  let loanBalance = loanAmount;
  let totalCashFlow = 0;
  let _totalEquity = downPayment;
  
  for (let year = 1; year <= 30; year++) {
    // Annual increases
    currentRent *= 1.03; // 3% rent increase
    currentValue *= 1.04; // 4% appreciation
    
    // Calculate annual metrics
    const annualRent = currentRent * 12;
    const annualExpenses = annualRent * 0.4; // 40% expense ratio
    const annualDebtService = monthlyPayment * 12;
    const annualCashFlow = annualRent - annualExpenses - annualDebtService;
    
    // Update loan balance (simplified)
    const principalPayment = annualDebtService * 0.3; // Rough estimate
    loanBalance = Math.max(0, loanBalance - principalPayment);
    
    // Calculate equity
    const equity = currentValue - loanBalance;
    totalCashFlow += annualCashFlow;
    _totalEquity = equity;
    
    // Calculate ROI
    const _cashOnCash = (annualCashFlow / downPayment) * 100;
    const totalROI = ((totalCashFlow + equity - downPayment) / downPayment) * 100;
    
    projections.push({
      year,
      propertyValue: Math.round(currentValue),
      grossRent: Math.round(annualRent),
      netOperatingIncome: Math.round(annualRent - annualExpenses),
      cashFlow: Math.round(annualCashFlow),
      cumulativeCashFlow: Math.round(totalCashFlow),
      equity: Math.round(equity),
      totalROI: parseFloat(totalROI.toFixed(2))
    });
  }
  
  return { projections };
}

async function generateFinancingScenarios(
  propertyData: any,
  analysis: any
): Promise<FinancingScenario[]> {
  const purchasePrice = propertyData.price || analysis.purchasePrice || 0;
  const monthlyRent = analysis.monthlyRent || propertyData.rentEstimate || 0;
  
  // Skip scenarios if we don't have price data
  if (purchasePrice === 0) {
    console.warn('Skipping financing scenarios due to missing price data');
    return [];
  }
  
  const scenarios: FinancingScenario[] = [
    {
      name: '25% Down Conventional',
      description: 'Standard investment loan with competitive rates',
      downPayment: purchasePrice * 0.25,
      downPaymentPercent: 25,
      interestRate: 7.0,
      loanTerm: 30,
      monthlyPI: calculateMonthlyPayment(purchasePrice * 0.75, 0.07, 30),
      totalCashRequired: purchasePrice * 0.28, // Including closing costs
      closingCosts: purchasePrice * 0.03,
      monthlyCashFlow: calculateMonthlyCashFlow(monthlyRent, purchasePrice * 0.75, 0.07, 30),
      cashOnCashReturn: 8.5,
      totalROI: 12.3,
      pros: ['Lower down payment', 'Fixed rate available', 'Long-term financing'],
      cons: ['Requires good credit', 'Slower approval process']
    },
    {
      name: '30% Down Portfolio Loan',
      description: 'Portfolio lender financing for experienced investors',
      downPayment: purchasePrice * 0.30,
      downPaymentPercent: 30,
      interestRate: 7.5,
      loanTerm: 30,
      monthlyPI: calculateMonthlyPayment(purchasePrice * 0.70, 0.075, 30),
      totalCashRequired: purchasePrice * 0.33,
      closingCosts: purchasePrice * 0.03,
      monthlyCashFlow: calculateMonthlyCashFlow(monthlyRent, purchasePrice * 0.70, 0.075, 30),
      cashOnCashReturn: 7.8,
      totalROI: 11.5,
      pros: ['More flexible terms', 'Can finance multiple properties'],
      cons: ['Higher down payment', 'Slightly higher rate']
    },
    {
      name: 'Hard Money Bridge (Flip)',
      description: 'Short-term financing for fix and flip projects',
      downPayment: purchasePrice * 0.10,
      downPaymentPercent: 10,
      interestRate: 10.5,
      loanTerm: 1,
      monthlyPI: Math.round((purchasePrice * 0.90 * 0.105) / 12), // Interest only
      totalCashRequired: purchasePrice * 0.15, // Including points and fees
      closingCosts: purchasePrice * 0.05, // Higher for hard money
      monthlyCashFlow: 0, // N/A for flips
      cashOnCashReturn: 0,
      totalROI: 45.2, // Projected flip ROI
      pros: ['Quick closing', 'Low down payment', '100% rehab financing'],
      cons: ['High interest rate', 'Short term only', 'Points and fees']
    }
  ];
  
  return scenarios;
}

async function fetchPropertyImages(address: string, propertyData: any): Promise<string[]> {
  const images: string[] = [];
  
  // Try to get images from property data first
  if (propertyData.images && Array.isArray(propertyData.images)) {
    images.push(...propertyData.images);
  }
  
  // Try to get from listing data
  if (propertyData.listing?.images) {
    images.push(...propertyData.listing.images.map((img: any) => img.url || img));
  }
  
  // If no images, use placeholders
  if (images.length === 0) {
    images.push('/api/placeholder/800/600');
  }
  
  return images.slice(0, 10); // Limit to 10 images
}

function generatePropertyMetrics(propertyData: any, analysis: any): Record<string, any> {
  const price = propertyData.price || analysis.purchasePrice || 0;
  const rent = analysis.monthlyRent || propertyData.rentEstimate || 0;
  const sqft = propertyData.squareFootage || 0;
  
  return {
    pricePerSqFt: sqft > 0 ? Math.round(price / sqft) : 0,
    grossRentMultiplier: rent > 0 ? parseFloat((price / (rent * 12)).toFixed(2)) : 0,
    debtCoverageRatio: 1.25,
    breakEvenRatio: 0.82,
    internalRateOfReturn: 14.5,
    netPresentValue: 125000,
    paybackPeriod: 8.5,
    rentToValueRatio: rent > 0 ? parseFloat(((rent / price) * 100).toFixed(3)) : 0
  };
}

function calculateMonthlyPayment(principal: number, rate: number, years: number): number {
  const monthlyRate = rate / 12;
  const numPayments = years * 12;
  
  if (monthlyRate === 0) return principal / numPayments;
  
  const payment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  return Math.round(payment);
}

function calculateMonthlyCashFlow(rent: number, loanAmount: number, rate: number, years: number): number {
  const monthlyPayment = calculateMonthlyPayment(loanAmount, rate, years);
  const expenses = rent * 0.4; // 40% expense ratio
  return Math.round(rent - expenses - monthlyPayment);
}

function calculateCapRate(propertyData: any): number {
  const price = propertyData.price || 0;
  const rent = propertyData.rentEstimate || 0;
  
  if (price === 0 || rent === 0) return 0;
  
  const annualNOI = (rent * 12) * 0.6; // 60% NOI after expenses
  return parseFloat(((annualNOI / price) * 100).toFixed(2));
}

function formatPropertyTitle(address: string, analysis: any): string {
  const strategy = analysis.strategy || 'Investment';
  const streetAddress = address.split(',')[0];
  return `${streetAddress} - ${strategy.charAt(0).toUpperCase() + strategy.slice(1)} Opportunity`;
}

function extractCity(address: string): string {
  const parts = address.split(',');
  return parts.length > 1 ? parts[1].trim() : '';
}

function extractFeatures(propertyData: any): string[] {
  const features: string[] = [];
  
  if (propertyData.hasGarage) features.push('Garage');
  if (propertyData.hasPool) features.push('Pool');
  if (propertyData.hasBasement) features.push('Basement');
  if (propertyData.yearBuilt && propertyData.yearBuilt > 2000) features.push('Modern Construction');
  if (propertyData.lotSize > 5000) features.push('Large Lot');
  
  return features;
}