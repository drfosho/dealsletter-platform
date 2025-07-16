'use client';

import { useState } from 'react';

interface Deal {
  id: number;
  title: string;
  location: string;
  type: string;
  strategy: string;
  price: number;
  downPayment: number;
  // Add other properties as needed
  [key: string]: unknown;
}

interface DealModalProps {
  deal: Deal | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DealModal({ deal, isOpen, onClose }: DealModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !deal) return null;

  // San Diego opportunity zone details
  const sanDiegoDetails = {
    whyStrategic: {
      title: "Why This is a Strategic Investment",
      description: "This Logan Heights fourplex presents a rare triple-zone investment opportunity located within an Opportunity Zone, Transit Priority Area, and San Diego Promise Zone—providing significant tax advantages and development incentives. Just 5 minutes from Downtown San Diego, PETCO Park, and the Convention Center, this property sits in the path of San Diego's eastward gentrification wave.",
      valueAdd: "The 42% rent upside potential ($2,495 current monthly income vs. $5,905 market potential) creates immediate value-add opportunities without major capital improvements. The detached single-car garage offers ADU conversion potential for additional income streams, while the 7,325 sq ft corner lot provides expansion possibilities.",
      location: "Located near the newly redeveloped Rodriguez Elementary School and within walking distance of public transit, this property benefits from ongoing neighborhood improvements and infrastructure investments. The combination of below-market rents, strategic location, and multiple tax incentive zones makes this an ideal acquisition for investors seeking both immediate upside and long-term appreciation."
    },
    propertyMetrics: {
      units: 4,
      buildingSize: "2,328 sq ft",
      lotSize: "7,325 sq ft (0.17 acres)",
      pricePerUnit: 323750,
      pricePerSF: 556,
      yearBuilt: 1956
    },
    financing: {
      loanType: "Conventional Investment",
      downPayment: 647500,
      downPaymentPercent: 50,
      loanAmount: 647500,
      interestRate: 6.6,
      term: "30 years",
      annualDebtService: 49623
    },
    currentPerformance: {
      monthlyIncome: 5905,
      annualIncome: 70860,
      occupancy: 97,
      noi: 43836,
      currentCapRate: 3.39,
      monthlyCashFlow: -482,
      dscr: 0.88
    },
    marketRentAnalysis: [
      { unit: "2BR/1BA Detached House", current: 1700, market: 2400, upside: 700 },
      { unit: "2BR/1BA Unit", current: 1625, market: 2400, upside: 775 },
      { unit: "1BR/1BA Unit #1", current: 1295, market: 1800, upside: 505 },
      { unit: "1BR/1BA Unit #2", current: 1285, market: 1800, upside: 515 }
    ],
    proFormaPerformance: {
      marketMonthlyIncome: 8400,
      marketAnnualIncome: 100800,
      proFormaNOI: 72878,
      proFormaCapRate: 5.63,
      proFormaMonthlyCashFlow: 1938,
      proFormaCashOnCash: 3.59,
      proFormaDSCR: 1.47,
      annualCashFlowIncrease: 29040
    },
    holdingPeriodAnalysis: [
      { year: 1, grossRent: 100800, cashFlow: 22910, capRate: 5.6, cashOnCash: 3.3, equity: 742801, totalReturn: -0.5 },
      { year: 2, grossRent: 103824, cashFlow: 25218, capRate: 5.8, cashOnCash: 3.7, equity: 805713, totalReturn: 11.8 },
      { year: 3, grossRent: 106939, cashFlow: 27597, capRate: 6.0, cashOnCash: 4.0, equity: 871354, totalReturn: 24.9 },
      { year: 5, grossRent: 113451, cashFlow: 32578, capRate: 6.3, cashOnCash: 4.7, equity: 1011324, totalReturn: 53.4 },
      { year: 10, grossRent: 131521, cashFlow: 46458, capRate: 7.4, cashOnCash: 6.8, equity: 1418430, totalReturn: 139.3 },
      { year: 20, grossRent: 176753, cashFlow: 81463, capRate: 10.1, cashOnCash: 11.9, equity: 2551630, totalReturn: 390.6 },
      { year: 30, grossRent: 237542, cashFlow: 128942, capRate: 13.8, cashOnCash: 18.8, equity: 4313719, totalReturn: 790.1 }
    ]
  };

  // Tampa multifamily details
  const tampaDetails = {
    whyGreatInvestment: {
      title: "Why This is a Great Investment",
      description: "This fully renovated 16-unit multifamily property combines 1920s architectural charm with modern upgrades in one of South Tampa's most desirable neighborhoods. Recent capital improvements include new roof (2024), all-new mini split AC systems, granite countertops, stainless steel appliances, and remodeled bathrooms. Each unit features in-unit washer/dryer connections with machines included—a premium amenity that commands higher rents and attracts quality tenants.",
      location: "Located in the heart of South Tampa, residents enjoy walkable access to trendy SoHo district and Hyde Park Village's upscale dining and shopping. The property benefits from top-ranked schools, luxury residential surroundings, and excellent connectivity to Downtown Tampa, Westshore Business District, and Tampa International Airport via nearby I-275 and Bayshore Boulevard."
    },
    financing: {
      loanType: "30-year, Amortizing",
      interestRate: 7.5,
      loanToCost: 75,
      ltv: 75,
      loanAmount: 2512500
    },
    investmentMetrics: {
      purchasePrice: 3350000,
      downPayment: 837500,
      purchaseCosts: 100500,
      totalCashNeeded: 938000
    },
    monthlyIncomeExpenses: {
      rental1BR: { units: 8, rent: 1600, total: 12800 },
      rental2BR: { units: 8, rent: 2100, total: 16800 },
      totalMonthlyIncome: 29600,
      operatingExpenses: 8750,
      operatingExpensePercent: 35,
      noi: 19240,
      monthlyMortgage: 17532,
      cashFlowAfterMortgage: 1708
    },
    keyReturns: {
      annualNOI: 230880,
      capRate: 6.9,
      cashOnCash: 2.2,
      annualCashFlow: 20496,
      breakEvenOccupancy: 88
    },
    valueAddOpportunities: [
      "Current rents appear below market for renovated units in Hyde Park",
      "Premium location supports $1,800-2,000 for 1BR and $2,400-2,600 for 2BR", 
      "In-unit W/D and recent renovations justify premium pricing",
      "Strong rental demand from young professionals and downsizing residents"
    ],
    holdingPeriodAnalysis: [
      { year: 1, grossRent: 355200, cashFlow: 21622, capRate: 6.9, cashOnCash: 2.3, equity: 994661, totalReturn: -13.9, irr: -13.9 },
      { year: 2, grossRent: 365856, cashFlow: 29289, capRate: 7.2, cashOnCash: 3.1, equity: 1158980, totalReturn: 5.8, irr: 2.9 },
      { year: 3, grossRent: 376832, cashFlow: 37201, capRate: 7.4, cashOnCash: 4.0, equity: 1330811, totalReturn: 27.2, irr: 8.5 },
      { year: 5, grossRent: 399781, cashFlow: 53788, capRate: 7.9, cashOnCash: 5.7, equity: 1698524, totalReturn: 75.0, irr: 12.4 },
      { year: 10, grossRent: 463455, cashFlow: 100082, capRate: 9.3, cashOnCash: 10.7, equity: 2778094, totalReturn: 227.6, irr: 13.9 },
      { year: 20, grossRent: 622845, cashFlow: 217380, capRate: 12.8, cashOnCash: 23.2, equity: 5860271, totalReturn: 713.2, irr: 13.4 },
      { year: 30, grossRent: 837052, cashFlow: 377285, capRate: 17.6, cashOnCash: 40.2, equity: 10865382, totalReturn: 1545.4, irr: 12.8 }
    ]
  };

  // Oakland flip deal details
  const oaklandDetails = {
    whyFlipOnly: {
      title: "Why This is a Flip-Only Investment",
      description: "This 1920s Oakland house offers a solid flip opportunity with significant profit potential, but the numbers don't support a BRRRR strategy due to Oakland's high operating costs and debt service requirements. Based on the listing photos, the property needs comprehensive updating but has attractive bones including original hardwood floors and a brick fireplace.",
      photoAnalysis: "The dated peach tile bathrooms, dark wood kitchen cabinets, burgundy carpeting, and bright blue paint throughout indicate a property that's been lived in but not updated for decades. The exterior shows good structural condition with recent mechanical updates (water heater, piping, drains in 2022).",
      whyBRRRFails: "With estimated rent of $3,350/month and Oakland's high property taxes (1.1% of value) plus insurance and maintenance costs, the property would generate negative cash flow of $1,373/month and a DSCR of only 0.55—far below lending requirements."
    },
    financing: {
      loanType: "Hard Money, Interest-Only",
      interestRate: "10.45%",
      loanToCost: "90%",
      downPayment: "10%",
      loanAmount: 369000,
      term: "12 months"
    },
    investment: {
      purchasePrice: 410000,
      downPayment: 41000,
      rehabBudget: 79000,
      holdingCosts: 12854,
      totalCashInvestment: 132854
    },
    rehabBudget: {
      kitchen: {
        total: 33300,
        items: [
          { item: "Replace dark wood cabinets", cost: 15000 },
          { item: "Quartz countertops", cost: 4000 },
          { item: "Stainless appliance package", cost: 6000 },
          { item: "New sink/faucet", cost: 800 },
          { item: "Tile backsplash", cost: 2000 },
          { item: "Electrical updates", cost: 1500 },
          { item: "Installation labor", cost: 4000 }
        ]
      },
      bathrooms: {
        total: 18200,
        items: [
          { item: "Full bath: Remove peach tile, new vanity, fixtures", cost: 12600 },
          { item: "Half bath: Complete renovation", cost: 5600 }
        ]
      },
      interior: {
        total: 27500,
        items: [
          { item: "Paint entire house", cost: 8000 },
          { item: "Replace burgundy carpet with LVP", cost: 6000 },
          { item: "Refinish hardwood floors", cost: 4000 },
          { item: "Basic landscaping", cost: 3000 },
          { item: "Electrical updates", cost: 2000 },
          { item: "Miscellaneous repairs", cost: 3000 },
          { item: "Permits", cost: 1500 }
        ]
      }
    },
    exitStrategy: {
      conservativeARV: 615000,
      realtorCommission: 30750,
      closingCosts: 9225,
      stagingCosts: 8000,
      totalSellingCosts: 47975,
      netSaleProceeds: 567025,
      hardMoneyPayoff: 369000,
      cashToSeller: 198025
    },
    profitAnalysis: {
      totalProfit: 65172,
      profitMargin: 10.6,
      roi: 49.06,
      annualizedROI: 147.17,
      breakEvenSalePrice: 918829
    },
    holdingPeriodAnalysis: [
      { months: 1, holdingCosts: 3740, totalProfit: 100785, roi: 176.7, annualizedROI: 2100 },
      { months: 1.5, holdingCosts: 5610, totalProfit: 98915, roi: 167.9, annualizedROI: 1300 },
      { months: 2, holdingCosts: 7480, totalProfit: 97045, roi: 159.7, annualizedROI: 958.2 },
      { months: 2.5, holdingCosts: 9351, totalProfit: 95174, roi: 151.9, annualizedROI: 729.1 },
      { months: 3, holdingCosts: 11221, totalProfit: 93304, roi: 144.6, annualizedROI: 578.4 },
      { months: 4, holdingCosts: 14961, totalProfit: 89564, roi: 131.2, annualizedROI: 393.6 },
      { months: 6, holdingCosts: 22441, totalProfit: 82084, roi: 108.4, annualizedROI: 216.8 }
    ]
  };

  const renderSanDiegoDetails = () => (
    <>
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">{sanDiegoDetails.whyStrategic.title}</h3>
            <p className="text-muted mb-4">{sanDiegoDetails.whyStrategic.description}</p>
            
            <div className="bg-accent/10 rounded-lg p-4 mb-4 border border-accent/20">
              <h4 className="font-semibold text-accent mb-2">💰 Value-Add Opportunity</h4>
              <p className="text-sm text-muted">{sanDiegoDetails.whyStrategic.valueAdd}</p>
            </div>
            
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
              <h4 className="font-semibold text-green-600 mb-2">📍 Strategic Location</h4>
              <p className="text-sm text-muted">{sanDiegoDetails.whyStrategic.location}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20 text-center">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-semibold text-accent mb-1">Opportunity Zone</h4>
              <p className="text-xs text-muted">Capital gains tax benefits</p>
            </div>
            
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 text-center">
              <div className="text-2xl mb-2">🚌</div>
              <h4 className="font-semibold text-blue-600 mb-1">Transit Priority Area</h4>
              <p className="text-xs text-muted">Development incentives</p>
            </div>
            
            <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20 text-center">
              <div className="text-2xl mb-2">🏛️</div>
              <h4 className="font-semibold text-purple-600 mb-1">Promise Zone</h4>
              <p className="text-xs text-muted">Federal tax credits</p>
            </div>
          </div>

          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
            <h4 className="font-semibold text-green-600 mb-3">📈 42% Rent Upside Potential</h4>
            <div className="space-y-2">
              {sanDiegoDetails.marketRentAnalysis.map((unit, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-muted">{unit.unit}</span>
                  <span className="text-primary">${unit.current} → ${unit.market} <span className="text-green-600 font-semibold">(+${unit.upside})</span></span>
                </div>
              ))}
              <div className="pt-2 border-t border-green-500/20">
                <div className="flex justify-between items-center font-semibold">
                  <span className="text-primary">Total Monthly Upside:</span>
                  <span className="text-green-600">+$2,495 (+42.3%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financing' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">Property Metrics</h3>
            <div className="bg-card rounded-lg p-6 border border-border/60">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-muted">Units</span>
                  <p className="font-semibold text-primary">{sanDiegoDetails.propertyMetrics.units}</p>
                </div>
                <div>
                  <span className="text-sm text-muted">Building Size</span>
                  <p className="font-semibold text-primary">{sanDiegoDetails.propertyMetrics.buildingSize}</p>
                </div>
                <div>
                  <span className="text-sm text-muted">Lot Size</span>
                  <p className="font-semibold text-primary">{sanDiegoDetails.propertyMetrics.lotSize}</p>
                </div>
                <div>
                  <span className="text-sm text-muted">Price/Unit</span>
                  <p className="font-semibold text-primary">${sanDiegoDetails.propertyMetrics.pricePerUnit.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-muted">Price/SF</span>
                  <p className="font-semibold text-primary">${sanDiegoDetails.propertyMetrics.pricePerSF}</p>
                </div>
                <div>
                  <span className="text-sm text-muted">Year Built</span>
                  <p className="font-semibold text-primary">{sanDiegoDetails.propertyMetrics.yearBuilt}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">Financing Terms</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                <span className="text-muted">Loan Type</span>
                <span className="font-semibold text-primary">{sanDiegoDetails.financing.loanType}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                <span className="text-muted">Down Payment</span>
                <span className="font-semibold text-primary">${sanDiegoDetails.financing.downPayment.toLocaleString()} ({sanDiegoDetails.financing.downPaymentPercent}%)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                <span className="text-muted">Loan Amount</span>
                <span className="font-semibold text-primary">${sanDiegoDetails.financing.loanAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                <span className="text-muted">Interest Rate</span>
                <span className="font-semibold text-primary">{sanDiegoDetails.financing.interestRate}%</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-accent/10 rounded-lg border border-accent/20">
                <span className="font-semibold text-primary">Annual Debt Service</span>
                <span className="font-bold text-accent text-lg">${sanDiegoDetails.financing.annualDebtService.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Current vs. Pro Forma Performance</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg p-6 border border-border/60">
              <h4 className="font-semibold text-primary mb-3">Current Performance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Monthly Income</span>
                  <span className="font-medium text-primary">${sanDiegoDetails.currentPerformance.monthlyIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Occupancy</span>
                  <span className="font-medium text-primary">{sanDiegoDetails.currentPerformance.occupancy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">NOI</span>
                  <span className="font-medium text-primary">${sanDiegoDetails.currentPerformance.noi.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Cap Rate</span>
                  <span className="font-medium text-yellow-600">{sanDiegoDetails.currentPerformance.currentCapRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Cash Flow</span>
                  <span className="font-medium text-red-600">-${Math.abs(sanDiegoDetails.currentPerformance.monthlyCashFlow)}/mo</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border/60">
              <h4 className="font-semibold text-primary mb-3">Pro Forma (Market Rents)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Monthly Income</span>
                  <span className="font-medium text-green-600">${sanDiegoDetails.proFormaPerformance.marketMonthlyIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Annual Increase</span>
                  <span className="font-medium text-green-600">+${sanDiegoDetails.proFormaPerformance.annualCashFlowIncrease.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Pro Forma NOI</span>
                  <span className="font-medium text-primary">${sanDiegoDetails.proFormaPerformance.proFormaNOI.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Pro Forma Cap Rate</span>
                  <span className="font-medium text-accent">{sanDiegoDetails.proFormaPerformance.proFormaCapRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Pro Forma Cash Flow</span>
                  <span className="font-medium text-green-600">${sanDiegoDetails.proFormaPerformance.proFormaMonthlyCashFlow}/mo</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-primary mb-3">Long-Term Holding Analysis</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left py-2 text-muted">Year</th>
                    <th className="text-right py-2 text-muted">Gross Rent</th>
                    <th className="text-right py-2 text-muted">Cash Flow</th>
                    <th className="text-right py-2 text-muted">Cap Rate</th>
                    <th className="text-right py-2 text-muted">Cash-on-Cash</th>
                    <th className="text-right py-2 text-muted">Total Equity</th>
                    <th className="text-right py-2 text-muted">Total Return</th>
                  </tr>
                </thead>
                <tbody>
                  {sanDiegoDetails.holdingPeriodAnalysis.map((period, idx) => (
                    <tr key={idx} className="border-b border-border/20">
                      <td className="py-2 text-primary">{period.year}</td>
                      <td className="text-right text-muted">${period.grossRent.toLocaleString()}</td>
                      <td className="text-right font-medium text-green-600">${period.cashFlow.toLocaleString()}</td>
                      <td className="text-right text-primary">{period.capRate}%</td>
                      <td className="text-right text-accent">{period.cashOnCash}%</td>
                      <td className="text-right text-primary">${(period.equity / 1000).toFixed(0)}K</td>
                      <td className="text-right text-green-600">{period.totalReturn}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderTampaDetails = () => (
    <>
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">{tampaDetails.whyGreatInvestment.title}</h3>
            <p className="text-muted mb-4">{tampaDetails.whyGreatInvestment.description}</p>
            
            <div className="bg-green-500/10 rounded-lg p-4 mb-4 border border-green-500/20">
              <h4 className="font-semibold text-green-600 mb-2">🏛️ Recent Capital Improvements</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-muted">New roof (2024)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-muted">All-new mini split AC systems</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-muted">Granite countertops</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-muted">Stainless steel appliances</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-muted">Remodeled bathrooms</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-muted">In-unit W/D connections</span>
                </div>
              </div>
            </div>
            
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
              <h4 className="font-semibold text-accent mb-2">📍 Premier South Tampa Location</h4>
              <p className="text-sm text-muted">{tampaDetails.whyGreatInvestment.location}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card rounded-lg p-6 border border-border/60">
              <h4 className="font-semibold text-primary mb-3">Current Rental Structure</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted">{tampaDetails.monthlyIncomeExpenses.rental1BR.units}x 1BR units</span>
                  <span className="font-semibold text-primary">${tampaDetails.monthlyIncomeExpenses.rental1BR.rent}/mo each</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">{tampaDetails.monthlyIncomeExpenses.rental2BR.units}x 2BR units</span>
                  <span className="font-semibold text-primary">${tampaDetails.monthlyIncomeExpenses.rental2BR.rent}/mo each</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border/40">
                  <span className="font-semibold text-primary">Total Monthly Income</span>
                  <span className="font-bold text-accent text-lg">${tampaDetails.monthlyIncomeExpenses.totalMonthlyIncome.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border/60">
              <h4 className="font-semibold text-primary mb-3">Value-Add Opportunities</h4>
              <div className="space-y-2">
                {tampaDetails.valueAddOpportunities.map((opportunity, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-sm text-muted">{opportunity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financing' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">Conventional Multifamily Financing</h3>
            <div className="bg-card rounded-lg p-6 border border-border/60">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted">Loan Type</span>
                  <p className="font-semibold text-primary">{tampaDetails.financing.loanType}</p>
                </div>
                <div>
                  <span className="text-sm text-muted">Interest Rate</span>
                  <p className="font-semibold text-primary">{tampaDetails.financing.interestRate}%</p>
                </div>
                <div>
                  <span className="text-sm text-muted">Loan to Cost</span>
                  <p className="font-semibold text-primary">{tampaDetails.financing.loanToCost}%</p>
                </div>
                <div>
                  <span className="text-sm text-muted">Loan Amount</span>
                  <p className="font-semibold text-primary">${tampaDetails.financing.loanAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">Investment Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                <span className="text-muted">Purchase Price</span>
                <span className="font-semibold text-primary">${tampaDetails.investmentMetrics.purchasePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                <span className="text-muted">Down Payment (25%)</span>
                <span className="font-semibold text-primary">${tampaDetails.investmentMetrics.downPayment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                <span className="text-muted">Purchase Costs</span>
                <span className="font-semibold text-primary">${tampaDetails.investmentMetrics.purchaseCosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-accent/10 rounded-lg border border-accent/20">
                <span className="font-semibold text-primary">Total Cash Needed</span>
                <span className="font-bold text-accent text-lg">${tampaDetails.investmentMetrics.totalCashNeeded.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">Monthly Income & Expenses</h3>
            <div className="bg-card rounded-lg p-6 border border-border/60">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Total Monthly Income</span>
                  <span className="font-semibold text-green-600">${tampaDetails.monthlyIncomeExpenses.totalMonthlyIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Operating Expenses (35%)</span>
                  <span className="font-semibold text-red-600">-${tampaDetails.monthlyIncomeExpenses.operatingExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Net Operating Income</span>
                  <span className="font-semibold text-primary">${tampaDetails.monthlyIncomeExpenses.noi.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Monthly Mortgage</span>
                  <span className="font-semibold text-red-600">-${tampaDetails.monthlyIncomeExpenses.monthlyMortgage.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border/40">
                  <span className="font-semibold text-primary">Cash Flow After Mortgage</span>
                  <span className="font-bold text-green-600 text-lg">${tampaDetails.monthlyIncomeExpenses.cashFlowAfterMortgage.toLocaleString()}/mo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Key Investment Returns</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-card rounded-lg p-4 border border-border/60 text-center">
              <div className="text-2xl font-bold text-accent">{tampaDetails.keyReturns.capRate}%</div>
              <div className="text-sm text-muted">Cap Rate</div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border/60 text-center">
              <div className="text-2xl font-bold text-green-600">{tampaDetails.keyReturns.cashOnCash}%</div>
              <div className="text-sm text-muted">Cash-on-Cash</div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border/60 text-center">
              <div className="text-2xl font-bold text-primary">${(tampaDetails.keyReturns.annualNOI / 1000).toFixed(0)}K</div>
              <div className="text-sm text-muted">Annual NOI</div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border/60 text-center">
              <div className="text-2xl font-bold text-green-600">${(tampaDetails.keyReturns.annualCashFlow / 1000).toFixed(0)}K</div>
              <div className="text-sm text-muted">Annual Cash Flow</div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border/60 text-center">
              <div className="text-2xl font-bold text-yellow-600">{tampaDetails.keyReturns.breakEvenOccupancy}%</div>
              <div className="text-sm text-muted">Break-even Occupancy</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-primary mb-3">Long-Term Holding Analysis</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left py-2 text-muted">Year</th>
                    <th className="text-right py-2 text-muted">Gross Rent</th>
                    <th className="text-right py-2 text-muted">Cash Flow</th>
                    <th className="text-right py-2 text-muted">Cap Rate</th>
                    <th className="text-right py-2 text-muted">Cash-on-Cash</th>
                    <th className="text-right py-2 text-muted">Total Equity</th>
                    <th className="text-right py-2 text-muted">Total Return</th>
                    <th className="text-right py-2 text-muted">IRR</th>
                  </tr>
                </thead>
                <tbody>
                  {tampaDetails.holdingPeriodAnalysis.map((period, idx) => (
                    <tr key={idx} className="border-b border-border/20">
                      <td className="py-2 text-primary">{period.year}</td>
                      <td className="text-right text-muted">${(period.grossRent / 1000).toFixed(0)}K</td>
                      <td className="text-right font-medium text-green-600">${period.cashFlow.toLocaleString()}</td>
                      <td className="text-right text-primary">{period.capRate}%</td>
                      <td className="text-right text-accent">{period.cashOnCash}%</td>
                      <td className="text-right text-primary">${(period.equity / 1000000).toFixed(1)}M</td>
                      <td className="text-right text-green-600">{period.totalReturn}%</td>
                      <td className="text-right text-accent">{period.irr}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
            <h4 className="font-semibold text-green-600 mb-2">💰 Investment Highlights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted">• Fully renovated with premium finishes</p>
                <p className="text-muted">• In-unit W/D - premium amenity</p>
                <p className="text-muted">• 1920s charm with modern upgrades</p>
              </div>
              <div>
                <p className="text-muted">• South Tampa prime location</p>
                <p className="text-muted">• Strong rental demand demographics</p>
                <p className="text-muted">• Rent growth potential to market rates</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderOaklandFlipDetails = () => (
    <>
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">{oaklandDetails.whyFlipOnly.title}</h3>
            <p className="text-muted mb-4">{oaklandDetails.whyFlipOnly.description}</p>
            
            <div className="bg-muted/10 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-primary mb-2">📸 Key Photo Analysis</h4>
              <p className="text-sm text-muted">{oaklandDetails.whyFlipOnly.photoAnalysis}</p>
            </div>
            
            <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
              <h4 className="font-semibold text-red-600 mb-2">❌ Why BRRRR Fails</h4>
              <p className="text-sm text-muted">{oaklandDetails.whyFlipOnly.whyBRRRFails}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
              <h4 className="font-semibold text-green-600 mb-2">✅ Flip Advantages</h4>
              <ul className="text-sm text-muted space-y-1">
                <li>• Solid ARV Potential - $615K</li>
                <li>• Good Bones - Original hardwood, brick fireplace</li>
                <li>• Bay Area Market - Strong buyer demand</li>
                <li>• Recent Updates - Mechanicals done in 2022</li>
              </ul>
            </div>
            
            <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
              <h4 className="font-semibold text-yellow-600 mb-2">⚠️ Risk Factors</h4>
              <ul className="text-sm text-muted space-y-1">
                <li>• Negative Safety Margin</li>
                <li>• Comprehensive Rehab Needed</li>
                <li>• 1922 Construction - Hidden issues</li>
                <li>• High Bay Area Costs</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financing' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">Hard Money Financing Terms</h3>
            <div className="bg-card rounded-lg p-6 border border-border/60">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted">Loan Type</span>
                  <p className="font-semibold text-primary">{oaklandDetails.financing.loanType}</p>
                </div>
                <div>
                  <span className="text-sm text-muted">Interest Rate</span>
                  <p className="font-semibold text-primary">{oaklandDetails.financing.interestRate}</p>
                </div>
                <div>
                  <span className="text-sm text-muted">Loan to Cost</span>
                  <p className="font-semibold text-primary">{oaklandDetails.financing.loanToCost}</p>
                </div>
                <div>
                  <span className="text-sm text-muted">Loan Amount</span>
                  <p className="font-semibold text-primary">${oaklandDetails.financing.loanAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">Investment Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                <span className="text-muted">Purchase Price</span>
                <span className="font-semibold text-primary">${oaklandDetails.investment.purchasePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                <span className="text-muted">Down Payment (10%)</span>
                <span className="font-semibold text-primary">${oaklandDetails.investment.downPayment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                <span className="text-muted">Rehab Budget</span>
                <span className="font-semibold text-primary">${oaklandDetails.investment.rehabBudget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                <span className="text-muted">Holding Costs (4 months)</span>
                <span className="font-semibold text-primary">${oaklandDetails.investment.holdingCosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-accent/10 rounded-lg border border-accent/20">
                <span className="font-semibold text-primary">Total Cash Investment</span>
                <span className="font-bold text-accent text-lg">${oaklandDetails.investment.totalCashInvestment.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rehab' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Detailed Rehab Budget - $79,000</h3>
          
          <div className="space-y-4">
            <div className="bg-card rounded-lg p-6 border border-border/60">
              <h4 className="font-semibold text-primary mb-3">Kitchen Renovation - ${oaklandDetails.rehabBudget.kitchen.total.toLocaleString()}</h4>
              <div className="space-y-2">
                {oaklandDetails.rehabBudget.kitchen.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-muted">{item.item}</span>
                    <span className="font-medium text-primary">${item.cost.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border/60">
              <h4 className="font-semibold text-primary mb-3">Bathroom Renovations - ${oaklandDetails.rehabBudget.bathrooms.total.toLocaleString()}</h4>
              <div className="space-y-2">
                {oaklandDetails.rehabBudget.bathrooms.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-muted">{item.item}</span>
                    <span className="font-medium text-primary">${item.cost.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border/60">
              <h4 className="font-semibold text-primary mb-3">Interior Updates - ${oaklandDetails.rehabBudget.interior.total.toLocaleString()}</h4>
              <div className="space-y-2">
                {oaklandDetails.rehabBudget.interior.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-muted">{item.item}</span>
                    <span className="font-medium text-primary">${item.cost.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Profit Analysis & Returns</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-card rounded-lg p-6 border border-border/60">
              <h4 className="font-semibold text-primary mb-3">Exit Strategy</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Conservative ARV</span>
                  <span className="font-medium text-primary">${oaklandDetails.exitStrategy.conservativeARV.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Realtor Commission</span>
                  <span className="font-medium text-primary">-${oaklandDetails.exitStrategy.realtorCommission.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Closing Costs</span>
                  <span className="font-medium text-primary">-${oaklandDetails.exitStrategy.closingCosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Staging Costs</span>
                  <span className="font-medium text-primary">-${oaklandDetails.exitStrategy.stagingCosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border/40">
                  <span className="font-semibold text-primary">Net Proceeds</span>
                  <span className="font-semibold text-green-600">${oaklandDetails.exitStrategy.netSaleProceeds.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border/60">
              <h4 className="font-semibold text-primary mb-3">Profit Metrics</h4>
              <div className="space-y-3">
                <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="text-2xl font-bold text-green-600">${oaklandDetails.profitAnalysis.totalProfit.toLocaleString()}</div>
                  <div className="text-sm text-muted">Total Profit</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-2 bg-muted/10 rounded">
                    <div className="font-bold text-primary">{oaklandDetails.profitAnalysis.roi}%</div>
                    <div className="text-xs text-muted">ROI</div>
                  </div>
                  <div className="text-center p-2 bg-muted/10 rounded">
                    <div className="font-bold text-primary">{oaklandDetails.profitAnalysis.annualizedROI}%</div>
                    <div className="text-xs text-muted">Annualized</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-primary mb-3">Holding Period Analysis</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left py-2 text-muted">Months</th>
                    <th className="text-right py-2 text-muted">Holding Costs</th>
                    <th className="text-right py-2 text-muted">Total Profit</th>
                    <th className="text-right py-2 text-muted">ROI %</th>
                    <th className="text-right py-2 text-muted">Annualized %</th>
                  </tr>
                </thead>
                <tbody>
                  {oaklandDetails.holdingPeriodAnalysis.map((period, idx) => (
                    <tr key={idx} className="border-b border-border/20">
                      <td className="py-2 text-primary">{period.months}</td>
                      <td className="text-right text-muted">${period.holdingCosts.toLocaleString()}</td>
                      <td className="text-right font-medium text-green-600">${period.totalProfit.toLocaleString()}</td>
                      <td className="text-right text-primary">{period.roi}%</td>
                      <td className="text-right text-accent">{period.annualizedROI}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-0 md:p-4">
      <div className="bg-background w-full max-w-full md:max-w-5xl h-full md:max-h-[90vh] md:rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border/20">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-primary">{deal.title}</h2>
              <p className="text-muted">{deal.location}</p>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-muted/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 md:gap-2 mt-6 overflow-x-auto">
            {['overview', 'financing', 'rehab', 'returns'].map((tab) => (
              <button
                key={tab}
                className={`px-4 md:px-6 py-3 rounded-lg font-medium text-sm transition-colors min-h-[44px] flex items-center justify-center whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted hover:text-primary hover:bg-muted/10'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {deal.id === 1 && renderSanDiegoDetails()}
          {deal.id === 2 && renderOaklandFlipDetails()}
          {deal.id === 3 && renderTampaDetails()}
          
          {/* Placeholder for other properties */}
          {deal.id !== 1 && deal.id !== 2 && deal.id !== 3 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-xl font-semibold text-primary mb-2">Detailed Analysis Coming Soon</h3>
              <p className="text-muted">Full analysis for this property is being prepared</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border/20">
          <div className="flex items-center justify-between">
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20 flex-1 mr-4">
              {deal.id === 1 && (
                <>
                  <p className="text-sm font-medium text-accent">🎯 Strategic Investment</p>
                  <p className="text-xs text-muted mt-1">
                    Triple-zone benefits with 42% rent upside potential. Ideal for value-add investors seeking tax advantages.
                  </p>
                </>
              )}
              {deal.id === 2 && (
                <>
                  <p className="text-sm font-medium text-yellow-600">⚠️ Investment Warning</p>
                  <p className="text-xs text-muted mt-1">
                    This deal requires perfect execution and strong market conditions. Not recommended for novice investors.
                  </p>
                </>
              )}
              {deal.id === 3 && (
                <>
                  <p className="text-sm font-medium text-green-600">🏢 Multifamily Excellence</p>
                  <p className="text-xs text-muted mt-1">
                    Fully renovated property in premier South Tampa location with strong cash flow and value-add potential.
                  </p>
                </>
              )}
              {deal.id !== 1 && deal.id !== 2 && deal.id !== 3 && (
                <>
                  <p className="text-sm font-medium text-primary">📊 Professional Analysis</p>
                  <p className="text-xs text-muted mt-1">
                    Complete financial analysis and risk assessment available.
                  </p>
                </>
              )}
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 border border-border text-primary rounded-lg hover:bg-muted/5 transition-colors font-medium min-h-[44px] flex items-center justify-center">
                Download Analysis
              </button>
              <button className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium min-h-[44px] flex items-center justify-center">
                Contact Agent
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}