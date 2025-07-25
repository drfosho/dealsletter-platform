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
      description: "This Logan Heights fourplex presents a rare triple-zone investment opportunity located within an Opportunity Zone, Transit Priority Area, and San Diego Promise Zone—providing significant tax advantages and development incentives. Just 5 minutes from Downtown San Diego, PETCO Park, and the Convention Center, this property sits in the path of San Diego&apos;s eastward gentrification wave.",
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
      description: "This fully renovated 16-unit multifamily property combines 1920s architectural charm with modern upgrades in one of South Tampa&apos;s most desirable neighborhoods. Recent capital improvements include new roof (2024), all-new mini split AC systems, granite countertops, stainless steel appliances, and remodeled bathrooms. Each unit features in-unit washer/dryer connections with machines included—a premium amenity that commands higher rents and attracts quality tenants.",
      location: "Located in the heart of South Tampa, residents enjoy walkable access to trendy SoHo district and Hyde Park Village&apos;s upscale dining and shopping. The property benefits from top-ranked schools, luxury residential surroundings, and excellent connectivity to Downtown Tampa, Westshore Business District, and Tampa International Airport via nearby I-275 and Bayshore Boulevard."
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
      description: "This 1920s Oakland house offers a solid flip opportunity with significant profit potential, but the numbers don&apos;t support a BRRRR strategy due to Oakland&apos;s high operating costs and debt service requirements. Based on the listing photos, the property needs comprehensive updating but has attractive bones including original hardwood floors and a brick fireplace.",
      photoAnalysis: "The dated peach tile bathrooms, dark wood kitchen cabinets, burgundy carpeting, and bright blue paint throughout indicate a property that&apos;s been lived in but not updated for decades. The exterior shows good structural condition with recent mechanical updates (water heater, piping, drains in 2022).",
      whyBRRRFails: "With estimated rent of $3,350/month and Oakland&apos;s high property taxes (1.1% of value) plus insurance and maintenance costs, the property would generate negative cash flow of $1,373/month and a DSCR of only 0.55—far below lending requirements."
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

  // Lafayette Hills Premium Flip details
  const lafayetteDetails = {
    whyPremiumFlip: {
      title: "Why This is a Premium Flip Opportunity",
      description: "Located in highly coveted Lafayette Hills with spectacular views, this property sits in the Acalanes School District (all 10-rated schools). The seller has explicitly priced it &apos;well below market for quick sale&apos; - expect heavy competition. Features radiant floor heating, dual-pane windows, Anderson doors, and a private court location. Currently configured as 3BR but easily converts back to 4BR.",
      marketAnalysis: "Lafayette Hills Recent Sales: Homes with views command 15-20% premium, Acalanes schools add 10-15% premium. &apos;Below market&apos; listings typically sell 10-15% over ask with average DOM of 7-14 days. Court locations are highly desirable.",
      competitiveOffer: "Listed at $999,900 (clearly underpriced). Seller states &apos;priced well below market&apos;. Expect 5-10 offers minimum. Similar view homes selling $1.5M+ as-is. $1,150,000 = 15% over ask (realistic win)."
    },
    financing: {
      loanType: "12-month Interest-Only",
      interestRate: 10.45,
      purchaseLTV: 80,
      rehabFunding: 100,
      downPaymentPercent: 20,
      points: 2
    },
    acquisitionCosts: {
      purchasePrice: 1150000,
      downPayment: 230000,
      loanPoints: 18400,
      closingCosts: 12000,
      totalCashToClose: 260400
    },
    renovationBudget: {
      total: 165000,
      kitchen: 45000,
      bathrooms: 25000,
      interiorPaint: 12000,
      flooring: 20000,
      convert4BR: 8000,
      lighting: 15000,
      landscaping: 20000,
      windowTreatments: 8000,
      staging: 12000
    },
    holdingCosts: {
      timeline: "3 months renovation + 1 month to sell",
      hardMoneyInterest: 32223,
      propertyTaxes: 5750,
      insurance: 2400,
      utilities: 1600,
      total: 41973
    },
    exitStrategy: {
      arv: 1700000,
      sellingCosts: 85000,
      loanPayoff: 1085000,
      netProceeds: 530000
    },
    profitAnalysis: {
      cashToClose: 260400,
      holdingCosts: 41973,
      totalCashIn: 302373,
      netProceeds: 530000,
      preTaxProfit: 227627,
      cashOnCashReturn: 75.3,
      annualizedReturn: 225.9
    },
    profitSensitivity: [
      { price: 1100000, profit: 277627, return: 91 },
      { price: 1150000, profit: 227627, return: 75 },
      { price: 1200000, profit: 177627, return: 59 }
    ],
    winningOfferStrategy: [
      "Offer $1,150,000 (strong but justified)",
      "21-day close (sellers want quick)",
      "$100k earnest money (shows strength)",
      "Waive all contingencies except basic inspection",
      "Pre-approval letter from hard money lender",
      "Personal letter emphasizing maintenance of home&apos;s character"
    ]
  };

  // San Diego Duplex House Hack details
  const sandiegoDuplexDetails = {
    whyHouseHack: {
      title: "Perfect House Hack or Investment",
      description: "This turnkey 2-unit duplex offers an incredible opportunity to live affordably in expensive San Diego while building serious wealth. With FHA financing at just 5% down, you can live in one unit while your tenant pays 40% of your mortgage!",
      walkScore: "Walk Score: 86 - highly walkable location",
      location: "Near USD = consistent rental demand. Both units upgraded = command top rent. Delivered vacant = choose your tenant."
    },
    houseHackScenario: {
      downPayment: 44750,
      downPaymentPercent: 5,
      loanAmount: 850250,
      interestRate: 6.4,
      monthlyPI: 5323,
      fhaMIP: 602,
      propertyTax: 895,
      insurance: 150,
      totalMonthlyPayment: 6970,
      rentalIncome: 2850,
      operatingExpenses: 356,
      netRentalIncome: 2494,
      effectiveMortgage: 4476,
      annualPrincipalPaydown: 7956,
      trueMonthlyCost: 3813
    },
    investmentScenario: {
      downPayment: 223750,
      downPaymentPercent: 25,
      loanAmount: 671250,
      interestRate: 6.8,
      monthlyPI: 4388,
      propertyTax: 895,
      insurance: 180,
      totalMonthlyPayment: 5463,
      grossRentalIncome: 5700,
      operatingExpenses: 1710,
      noi: 3990,
      monthlyCashFlow: -1473,
      capRate: 5.35,
      cashOnCashReturn: -6.6
    },
    marketAdvantages: [
      "Near USD = consistent rental demand",
      "86 Walk Score = highly desirable",
      "Delivered vacant = choose your tenant",
      "Turnkey condition = no rehab needed",
      "Both units upgraded = command top rent",
      "Limited supply drives appreciation",
      "Strong job market",
      "Year-round rental demand",
      "Rent growth averaging 4-6% annually"
    ],
    exitStrategies: {
      year2Options: [
        "Move out & rent both units for $5,700/month",
        "Refinance to lower rate if rates drop",
        "Sell after 2 years with tax-free gains up to $250k"
      ],
      appreciation: "At 5% appreciation: Value = $987,000 in 2 years"
    }
  };

  // Oakland 25-Unit Value-Add details
  const oakland25UnitDetails = {
    whyGreatInvestment: {
      title: "Oakland 25-Unit Value-Add - Massive Upside Potential",
      description: "This is the ultimate value-add opportunity - a 25-unit building priced at just $74,000/unit with current rents averaging only $984/month, while market rents are $1,530+! With 100% occupancy and stable income, you can methodically increase rents through natural turnover and Section 8 conversion.",
      section8Opportunity: "The City of Oakland&apos;s Section 8 program pays ABOVE market rates ($1,600-1,800 for 1BR), creating a unique opportunity to maximize income while providing quality housing. At just $119/sq ft, this is priced well below replacement cost in a rapidly gentrifying area.",
      currentBelowMarket: "Current rents are $546/unit/month below market!"
    },
    financing: {
      purchasePrice: 1850000,
      downPayment: 462500,
      downPaymentPercent: 25,
      loanAmount: 1387500,
      interestRate: 7.25,
      monthlyPI: 9467
    },
    incomeAnalysis: {
      current: {
        monthlyGross: 24591,
        annualGross: 295092,
        noi: 177949,
        capRate: 9.62
      },
      marketRate: {
        monthlyGross: 38250,
        annualGross: 459000,
        increaseAnnual: 163908,
        increasePercent: 55.5
      },
      section8: {
        monthlyGross: 42500,
        annualGross: 510000,
        increaseAnnual: 214908,
        increasePercent: 72.8
      }
    },
    cashFlowAnalysis: {
      current: {
        annualNOI: 177949,
        annualDebtService: 113604,
        annualCashFlow: 64345,
        monthlyCashFlow: 5362,
        cashOnCashReturn: 13.29
      },
      marketRate: {
        annualNOI: 329955,
        annualCashFlow: 216351,
        monthlyCashFlow: 18029,
        cashOnCashReturn: 44.68
      },
      section8: {
        annualNOI: 380955,
        annualCashFlow: 267351,
        monthlyCashFlow: 22279,
        cashOnCashReturn: 55.22
      }
    },
    valueAddStrategy: {
      year1: {
        units: "5-7 units",
        strategy: "Natural turnover capture",
        investment: "$3-5k per unit basic updates",
        addedIncome: 32760
      },
      year2: {
        units: "8-10 units",
        strategy: "Continue turnover, first Section 8 tenants",
        totalAtMarket: "15-17 units",
        addedIncome: 98280
      },
      year3: {
        strategy: "Complete market rent conversions, 50%+ Section 8",
        fullStabilization: true,
        addedIncome: 214908
      }
    },
    capexBudget: {
      unitRenovations: 125000,
      exteriorCommon: 50000,
      mechanicalSafety: 40000,
      contingency: 35000,
      total: 250000
    },
    stabilizedMetrics: {
      capRate: 20.59,
      monthyCashFlow: 22279,
      cashOnCashReturn: 55.22,
      propertyValue: 5442214,
      equityCreated: 3592214
    },
    refinanceOpportunity: {
      newValue: 5400000,
      cashOutRefi75: 4050000,
      payOffOriginal: 1387500,
      taxFreeCashOut: 2662500,
      continueCollecting: 267000
    }
  };

  // San Leandro 6-Unit details
  const sanLeandro6UnitDetails = {
    whyGreatInvestment: {
      title: "San Leandro 6-Unit - Premium Multifamily Investment",
      description: "This unique 6-unit property offers an exceptional combination of privacy, modern amenities, and low operating expenses that&apos;s rare in today&apos;s market. Each unit is separated by its own garage (no shared walls!), features in-unit laundry, and tenants pay ALL utilities including water and garbage - dramatically reducing your operating expenses.",
      location: "Located just 0.6 miles from BART with easy access to I-580/880, this property attracts quality tenants who value the single-family home feel with apartment convenience. With 3 recently remodeled units and immediate pro-forma upside, this turnkey asset delivers strong day-one cash flow with built-in value-add potential.",
      competitiveAdvantages: "No shared walls = fewer tenant conflicts. Direct garage access = premium tenant appeal. 35.5% OpEx ratio vs 45-50% typical."
    },
    financing: {
      purchasePrice: 1625000,
      downPayment: 406250,
      downPaymentPercent: 25,
      loanAmount: 1218750,
      interestRate: 7.25,
      monthlyPI: 8316
    },
    currentIncome: {
      oneBedroomUnits: 4,
      oneBedroomRent: 1925,
      twoBedroomUnits: 2,
      twoBedroomRent: 2036,
      totalMonthlyIncome: 11772,
      annualGrossIncome: 141264
    },
    proFormaIncome: {
      oneBedroomRent: 1930,
      twoBedroomRent: 2500,
      totalMonthlyIncome: 12720,
      annualGrossIncome: 152640,
      immediateIncrease: 11136
    },
    operatingExpenses: {
      propertyTax: 19500,
      insurance: 4800,
      management: 12211,
      maintenanceReserve: 7632,
      vacancy: 7632,
      other: 2400,
      total: 54175,
      opexRatio: 35.5
    },
    cashFlowAnalysis: {
      current: {
        annualNOI: 87089,
        annualDebtService: 99792,
        annualCashFlow: -12703,
        monthlyCashFlow: -1059,
        capRate: 5.36
      },
      proForma: {
        annualNOI: 98465,
        annualDebtService: 99792,
        annualCashFlow: -1327,
        monthlyCashFlow: -111,
        capRate: 6.06
      }
    },
    uniqueFeatures: [
      "Tenant pays ALL utilities (including water/garbage!)",
      "No shared walls = fewer tenant conflicts",
      "Private garages for each unit",
      "In-unit W/D in ALL units",
      "3 recently remodeled units",
      "Vinyl windows throughout",
      "0.6 miles to BART - walk to transit",
      "I-580/880 access - entire Bay Area commute",
      "Bayfair Center - major shopping nearby",
      "75 Walk Score - very walkable"
    ],
    fiveYearProjection: {
      year5MonthlyRent: 14321,
      year5NOI: 110738,
      year5Value: 1845633,
      equityGain: 220633,
      totalReturn: 51.2
    },
    investmentStrategy: [
      "Year 1: Raise 2BR units to market ($464/mo each)",
      "Year 1: Professional property management",
      "Years 2-3: Gradual rent increases (3% annually)",
      "Consider storage rental for extra income",
      "Hold for cash flow - Positive by Year 2",
      "Refinance when rates drop to 6%",
      "Sell at premium to owner-user (rare layout)"
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

  const renderLafayetteDetails = () => (
    <>
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">{lafayetteDetails.whyPremiumFlip.title}</h3>
            <p className="text-muted mb-4">{lafayetteDetails.whyPremiumFlip.description}</p>
            
            <div className="bg-accent/10 rounded-lg p-4 mb-4 border border-accent/20">
              <h4 className="font-semibold text-accent mb-2">📊 Market Analysis</h4>
              <p className="text-sm text-muted">{lafayetteDetails.whyPremiumFlip.marketAnalysis}</p>
            </div>
            
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
              <h4 className="font-semibold text-green-600 mb-2">🎯 Competitive Offer Strategy</h4>
              <p className="text-sm text-muted">{lafayetteDetails.whyPremiumFlip.competitiveOffer}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card rounded-lg p-4 border border-border/60 text-center">
              <div className="text-2xl mb-2">🏫</div>
              <h4 className="font-semibold text-primary mb-1">A+ Schools</h4>
              <p className="text-xs text-muted">All 10-rated Acalanes District</p>
            </div>
            
            <div className="bg-card rounded-lg p-4 border border-border/60 text-center">
              <div className="text-2xl mb-2">🏔️</div>
              <h4 className="font-semibold text-primary mb-1">Spectacular Views</h4>
              <p className="text-xs text-muted">15-20% value premium</p>
            </div>
            
            <div className="bg-card rounded-lg p-4 border border-border/60 text-center">
              <div className="text-2xl mb-2">🎨</div>
              <h4 className="font-semibold text-primary mb-1">Cosmetic Only</h4>
              <p className="text-xs text-muted">Quick 4-month timeline</p>
            </div>
          </div>

          <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
            <h4 className="font-semibold text-yellow-600 mb-3">⚡ Winning Offer Strategy</h4>
            <ul className="space-y-2">
              {lafayetteDetails.winningOfferStrategy.map((strategy, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-sm">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-1 flex-shrink-0"></span>
                  <span className="text-muted">{strategy}</span>
                </li>
              ))}
            </ul>
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
                  <p className="font-semibold text-primary">{lafayetteDetails.financing.loanType}</p>
                </div>
                <div>
                  <span className="text-sm text-muted">Interest Rate</span>
                  <p className="font-semibold text-primary">{lafayetteDetails.financing.interestRate}%</p>
                </div>
                <div>
                  <span className="text-sm text-muted">Purchase LTV</span>
                  <p className="font-semibold text-primary">{lafayetteDetails.financing.purchaseLTV}%</p>
                </div>
                <div>
                  <span className="text-sm text-muted">Rehab Funding</span>
                  <p className="font-semibold text-primary">{lafayetteDetails.financing.rehabFunding}%</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">Acquisition Costs</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                <span className="text-muted">Purchase Price</span>
                <span className="font-semibold text-primary">${lafayetteDetails.acquisitionCosts.purchasePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                <span className="text-muted">Down Payment (20%)</span>
                <span className="font-semibold text-primary">${lafayetteDetails.acquisitionCosts.downPayment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                <span className="text-muted">Loan Points (2%)</span>
                <span className="font-semibold text-primary">${lafayetteDetails.acquisitionCosts.loanPoints.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                <span className="text-muted">Closing Costs</span>
                <span className="font-semibold text-primary">${lafayetteDetails.acquisitionCosts.closingCosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-accent/10 rounded-lg border border-accent/20">
                <span className="font-semibold text-primary">Total Cash to Close</span>
                <span className="font-bold text-accent text-lg">${lafayetteDetails.acquisitionCosts.totalCashToClose.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rehab' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Renovation Budget - $165,000</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card rounded-lg p-6 border border-border/60">
              <h4 className="font-semibold text-primary mb-3">Major Updates</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Kitchen renovation (high-end)</span>
                  <span className="font-medium text-primary">${lafayetteDetails.renovationBudget.kitchen.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Bathroom updates (2)</span>
                  <span className="font-medium text-primary">${lafayetteDetails.renovationBudget.bathrooms.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Flooring refresh/refinish</span>
                  <span className="font-medium text-primary">${lafayetteDetails.renovationBudget.flooring.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Landscaping/curb appeal</span>
                  <span className="font-medium text-primary">${lafayetteDetails.renovationBudget.landscaping.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border/60">
              <h4 className="font-semibold text-primary mb-3">Cosmetic Updates</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Interior paint throughout</span>
                  <span className="font-medium text-primary">${lafayetteDetails.renovationBudget.interiorPaint.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Lighting/fixtures upgrade</span>
                  <span className="font-medium text-primary">${lafayetteDetails.renovationBudget.lighting.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Window treatments</span>
                  <span className="font-medium text-primary">${lafayetteDetails.renovationBudget.windowTreatments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Convert back to 4BR</span>
                  <span className="font-medium text-primary">${lafayetteDetails.renovationBudget.convert4BR.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Staging for sale</span>
                  <span className="font-medium text-primary">${lafayetteDetails.renovationBudget.staging.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
            <h4 className="font-semibold text-green-600 mb-2">✅ Why Only Cosmetic</h4>
            <ul className="space-y-1 text-sm text-muted">
              <li>• Radiant floors already installed ($$ feature)</li>
              <li>• Dual-pane windows (no replacement needed)</li>
              <li>• Anderson doors (premium quality)</li>
              <li>• No known structural issues</li>
              <li>• Quick flip = less holding costs</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Profit Analysis & Returns</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-lg p-4 border border-border/60 text-center">
              <div className="text-2xl font-bold text-green-600">${(lafayetteDetails.profitAnalysis.preTaxProfit / 1000).toFixed(0)}K</div>
              <div className="text-sm text-muted">Pre-Tax Profit</div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border/60 text-center">
              <div className="text-2xl font-bold text-accent">{lafayetteDetails.profitAnalysis.cashOnCashReturn}%</div>
              <div className="text-sm text-muted">Cash-on-Cash</div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border/60 text-center">
              <div className="text-2xl font-bold text-primary">{lafayetteDetails.profitAnalysis.annualizedReturn}%</div>
              <div className="text-sm text-muted">Annualized</div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border/60 text-center">
              <div className="text-2xl font-bold text-yellow-600">4 mo</div>
              <div className="text-sm text-muted">Timeline</div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border/60">
            <h4 className="font-semibold text-primary mb-3">Exit Strategy</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">After Repair Value (ARV)</span>
                <span className="font-medium text-primary">${lafayetteDetails.exitStrategy.arv.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Less Selling Costs (5%)</span>
                <span className="font-medium text-red-600">-${lafayetteDetails.exitStrategy.sellingCosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Less Loan Payoff</span>
                <span className="font-medium text-red-600">-${lafayetteDetails.exitStrategy.loanPayoff.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border/40">
                <span className="font-semibold text-primary">Net Proceeds</span>
                <span className="font-bold text-green-600">${lafayetteDetails.exitStrategy.netProceeds.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-primary mb-3">Profit Sensitivity Analysis</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left py-2 text-muted">Purchase Price</th>
                    <th className="text-right py-2 text-muted">Profit</th>
                    <th className="text-right py-2 text-muted">Return %</th>
                  </tr>
                </thead>
                <tbody>
                  {lafayetteDetails.profitSensitivity.map((scenario, idx) => (
                    <tr key={idx} className="border-b border-border/20">
                      <td className="py-2 text-primary">${scenario.price.toLocaleString()}</td>
                      <td className="text-right font-medium text-green-600">${scenario.profit.toLocaleString()}</td>
                      <td className="text-right text-accent">{scenario.return}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted mt-2">Break-even: $1,282,000 (still 28% over list!)</p>
          </div>
        </div>
      )}
    </>
  );

  const renderSanDiegoDuplexDetails = () => (
    <>
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">{sandiegoDuplexDetails.whyHouseHack.title}</h3>
            <p className="text-muted mb-4">{sandiegoDuplexDetails.whyHouseHack.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                <h4 className="font-semibold text-green-600 mb-2">🏠 House Hack Benefits</h4>
                <ul className="space-y-1 text-sm text-muted">
                  <li>• Live for $4,476/mo in $895k property</li>
                  <li>• Only need $54,750 to get started</li>
                  <li>• Building massive equity with minimal down</li>
                  <li>• San Diego appreciation 5-7% annually</li>
                  <li>• After 2 years, rent both for $5,700/mo</li>
                </ul>
              </div>
              
              <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                <h4 className="font-semibold text-accent mb-2">📍 Location Benefits</h4>
                <ul className="space-y-1 text-sm text-muted">
                  <li>• {sandiegoDuplexDetails.whyHouseHack.walkScore}</li>
                  <li>• Near USD campus</li>
                  <li>• Turnkey condition</li>
                  <li>• Delivered vacant</li>
                  <li>• Both units upgraded</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
              <h4 className="font-semibold text-yellow-600 mb-2">💡 Why House Hack Wins</h4>
              <p className="text-sm text-muted">{sandiegoDuplexDetails.whyHouseHack.location}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-lg p-4 border border-border/60 text-center">
              <div className="text-2xl font-bold text-accent">5%</div>
              <div className="text-sm text-muted">FHA Down</div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border/60 text-center">
              <div className="text-2xl font-bold text-green-600">$2,494</div>
              <div className="text-sm text-muted">Tenant Pays</div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border/60 text-center">
              <div className="text-2xl font-bold text-primary">$4,476</div>
              <div className="text-sm text-muted">Your Cost</div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border/60 text-center">
              <div className="text-2xl font-bold text-yellow-600">86</div>
              <div className="text-sm text-muted">Walk Score</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financing' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">FHA House Hack vs Investment Comparison</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg p-6 border border-border/60">
              <h4 className="font-semibold text-primary mb-3">🏠 FHA House Hack (5% Down)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Down Payment</span>
                  <span className="font-medium text-green-600">${sandiegoDuplexDetails.houseHackScenario.downPayment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Monthly P&I</span>
                  <span className="font-medium text-primary">${sandiegoDuplexDetails.houseHackScenario.monthlyPI.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">FHA MIP</span>
                  <span className="font-medium text-primary">${sandiegoDuplexDetails.houseHackScenario.fhaMIP}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Total Payment</span>
                  <span className="font-medium text-primary">${sandiegoDuplexDetails.houseHackScenario.totalMonthlyPayment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Rental Income</span>
                  <span className="font-medium text-green-600">+${sandiegoDuplexDetails.houseHackScenario.rentalIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border/40">
                  <span className="font-semibold text-primary">Effective Cost</span>
                  <span className="font-bold text-accent text-lg">${sandiegoDuplexDetails.houseHackScenario.effectiveMortgage.toLocaleString()}/mo</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border/60">
              <h4 className="font-semibold text-primary mb-3">💰 Investment Property (25% Down)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Down Payment</span>
                  <span className="font-medium text-red-600">${sandiegoDuplexDetails.investmentScenario.downPayment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Monthly P&I</span>
                  <span className="font-medium text-primary">${sandiegoDuplexDetails.investmentScenario.monthlyPI.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Total Payment</span>
                  <span className="font-medium text-primary">${sandiegoDuplexDetails.investmentScenario.totalMonthlyPayment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Gross Income</span>
                  <span className="font-medium text-green-600">+${sandiegoDuplexDetails.investmentScenario.grossRentalIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Operating Exp</span>
                  <span className="font-medium text-red-600">-${sandiegoDuplexDetails.investmentScenario.operatingExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border/40">
                  <span className="font-semibold text-primary">Cash Flow</span>
                  <span className="font-bold text-red-600 text-lg">-${Math.abs(sandiegoDuplexDetails.investmentScenario.monthlyCashFlow).toLocaleString()}/mo</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
            <h4 className="font-semibold text-green-600 mb-2">🏆 Winner: HOUSE HACK STRATEGY!</h4>
            <p className="text-sm text-muted">As a house hack, this duplex offers an incredible opportunity to live affordably in expensive San Diego while building serious wealth. Your tenant essentially subsidizes your housing by $2,494/month!</p>
          </div>
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Market Advantages & Exit Strategies</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {sandiegoDuplexDetails.marketAdvantages.map((advantage, idx) => (
              <div key={idx} className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-sm text-muted">{advantage}</span>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-lg p-6 border border-border/60">
            <h4 className="font-semibold text-primary mb-3">📈 Year 2+ Exit Strategies</h4>
            <div className="space-y-3">
              {sandiegoDuplexDetails.exitStrategies.year2Options.map((option, idx) => (
                <div key={idx} className="p-3 bg-muted/10 rounded-lg">
                  <p className="text-sm text-primary">{option}</p>
                </div>
              ))}
              <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-sm font-semibold text-accent">{sandiegoDuplexDetails.exitStrategies.appreciation}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
            <h4 className="font-semibold text-green-600 mb-2">📋 Recommendation</h4>
            <p className="text-sm text-muted mb-2"><strong>For First-Time Buyers/House Hackers:</strong> This is a NO-BRAINER. You get to:</p>
            <ul className="space-y-1 text-sm text-muted">
              <li>• Live in premium San Diego location</li>
              <li>• Pay less than renting a house</li>
              <li>• Build equity in $895k asset</li>
              <li>• Have tenant pay 40% of your mortgage</li>
              <li>• Position for future wealth building</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'rehab' && (
        <div className="space-y-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-primary mb-2">No Rehab Needed</h3>
            <p className="text-muted">This property is move-in ready and requires no immediate renovations</p>
          </div>
        </div>
      )}
    </>
  );

  const renderOakland25UnitDetails = () => (
    <>
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">{oakland25UnitDetails.whyGreatInvestment.title}</h3>
            <p className="text-muted mb-4">{oakland25UnitDetails.whyGreatInvestment.description}</p>
            
            <div className="bg-green-500/10 rounded-lg p-4 mb-4 border border-green-500/20">
              <h4 className="font-semibold text-green-600 mb-2">💰 Section 8 Opportunity</h4>
              <p className="text-sm text-muted">{oakland25UnitDetails.whyGreatInvestment.section8Opportunity}</p>
            </div>
            
            <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
              <h4 className="font-semibold text-red-600 mb-2">🚨 Current Below Market</h4>
              <p className="text-lg font-bold text-red-600">{oakland25UnitDetails.whyGreatInvestment.currentBelowMarket}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-lg p-4 border border-border/60 text-center">
              <div className="text-2xl font-bold text-accent">$74K</div>
              <div className="text-sm text-muted">Per Unit</div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border/60 text-center">
              <div className="text-2xl font-bold text-green-600">100%</div>
              <div className="text-sm text-muted">Occupied</div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border/60 text-center">
              <div className="text-2xl font-bold text-primary">72.8%</div>
              <div className="text-sm text-muted">Income Increase</div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border/60 text-center">
              <div className="text-2xl font-bold text-yellow-600">$546</div>
              <div className="text-sm text-muted">Below Market</div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border/60">
            <h4 className="font-semibold text-primary mb-3">Income Analysis Comparison</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted">Current Income</span>
                <span className="font-semibold text-primary">${oakland25UnitDetails.incomeAnalysis.current.monthlyGross.toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Market Rate Income</span>
                <span className="font-semibold text-green-600">${oakland25UnitDetails.incomeAnalysis.marketRate.monthlyGross.toLocaleString()}/mo (+{oakland25UnitDetails.incomeAnalysis.marketRate.increasePercent}%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Section 8 Income</span>
                <span className="font-semibold text-accent">${oakland25UnitDetails.incomeAnalysis.section8.monthlyGross.toLocaleString()}/mo (+{oakland25UnitDetails.incomeAnalysis.section8.increasePercent}%)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financing' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Investment Returns Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card rounded-lg p-6 border border-border/60">
              <h4 className="font-semibold text-primary mb-3">Day 1 Purchase</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Cap Rate</span>
                  <span className="font-bold text-accent">{oakland25UnitDetails.incomeAnalysis.current.capRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Cash Flow</span>
                  <span className="font-bold text-green-600">${oakland25UnitDetails.cashFlowAnalysis.current.monthlyCashFlow.toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Cash-on-Cash</span>
                  <span className="font-bold text-primary">{oakland25UnitDetails.cashFlowAnalysis.current.cashOnCashReturn}%</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border/60">
              <h4 className="font-semibold text-primary mb-3">Market Rate</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Cap Rate</span>
                  <span className="font-bold text-accent">~15%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Cash Flow</span>
                  <span className="font-bold text-green-600">${oakland25UnitDetails.cashFlowAnalysis.marketRate.monthlyCashFlow.toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Cash-on-Cash</span>
                  <span className="font-bold text-primary">{oakland25UnitDetails.cashFlowAnalysis.marketRate.cashOnCashReturn}%</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border/60">
              <h4 className="font-semibold text-primary mb-3">Year 3 Stabilized</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Cap Rate</span>
                  <span className="font-bold text-accent">{oakland25UnitDetails.stabilizedMetrics.capRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Cash Flow</span>
                  <span className="font-bold text-green-600">${oakland25UnitDetails.cashFlowAnalysis.section8.monthlyCashFlow.toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Cash-on-Cash</span>
                  <span className="font-bold text-primary">{oakland25UnitDetails.cashFlowAnalysis.section8.cashOnCashReturn}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border/60">
            <h4 className="font-semibold text-primary mb-3">3-Year Value-Add Strategy</h4>
            <div className="space-y-4">
              <div className="p-3 bg-muted/10 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-primary">Year 1: Foundation</span>
                  <span className="text-sm text-green-600">+${oakland25UnitDetails.valueAddStrategy.year1.addedIncome.toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted">{oakland25UnitDetails.valueAddStrategy.year1.units} - {oakland25UnitDetails.valueAddStrategy.year1.strategy}</p>
              </div>
              
              <div className="p-3 bg-muted/10 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-primary">Year 2: Acceleration</span>
                  <span className="text-sm text-green-600">+${oakland25UnitDetails.valueAddStrategy.year2.addedIncome.toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted">{oakland25UnitDetails.valueAddStrategy.year2.units} - {oakland25UnitDetails.valueAddStrategy.year2.strategy}</p>
              </div>
              
              <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-accent">Year 3: Optimization</span>
                  <span className="text-sm text-green-600">+${oakland25UnitDetails.valueAddStrategy.year3.addedIncome.toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted">{oakland25UnitDetails.valueAddStrategy.year3.strategy}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Financial Engineering & Exit Strategies</h3>
          
          <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/20 mb-6">
            <h4 className="font-semibold text-green-600 mb-3">💡 Refinance Opportunity (Year 3)</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted">New Value (conservative)</p>
                <p className="font-bold text-primary text-lg">${(oakland25UnitDetails.refinanceOpportunity.newValue / 1000000).toFixed(1)}M</p>
              </div>
              <div>
                <p className="text-muted">Tax-Free Cash Out</p>
                <p className="font-bold text-green-600 text-lg">${(oakland25UnitDetails.refinanceOpportunity.taxFreeCashOut / 1000000).toFixed(1)}M</p>
              </div>
            </div>
            <p className="text-sm text-muted mt-3">Keep property & continue collecting ${(oakland25UnitDetails.refinanceOpportunity.continueCollecting / 1000).toFixed(0)}k/year!</p>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border/60">
            <h4 className="font-semibold text-primary mb-3">CapEx Budget (Over 3 Years)</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Unit Renovations ($5k x 25)</span>
                <span className="font-medium text-primary">${oakland25UnitDetails.capexBudget.unitRenovations.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Exterior/Common Areas</span>
                <span className="font-medium text-primary">${oakland25UnitDetails.capexBudget.exteriorCommon.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Mechanical/Safety</span>
                <span className="font-medium text-primary">${oakland25UnitDetails.capexBudget.mechanicalSafety.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Contingency</span>
                <span className="font-medium text-primary">${oakland25UnitDetails.capexBudget.contingency.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border/40">
                <span className="font-semibold text-primary">Total CapEx</span>
                <span className="font-bold text-accent">${oakland25UnitDetails.capexBudget.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
            <h4 className="font-semibold text-accent mb-2">🎯 The Bottom Line</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted">Purchase Price</p>
                <p className="font-bold text-primary">${(oakland25UnitDetails.financing.purchasePrice / 1000000).toFixed(2)}M ($74k/unit)</p>
              </div>
              <div>
                <p className="text-muted">Current Income</p>
                <p className="font-bold text-primary">${(oakland25UnitDetails.incomeAnalysis.current.annualGross / 1000).toFixed(0)}k (profitable)</p>
              </div>
              <div>
                <p className="text-muted">Potential Income</p>
                <p className="font-bold text-green-600">${(oakland25UnitDetails.incomeAnalysis.section8.annualGross / 1000).toFixed(0)}k (+72.8%)</p>
              </div>
              <div>
                <p className="text-muted">Equity Creation</p>
                <p className="font-bold text-accent">${(oakland25UnitDetails.stabilizedMetrics.equityCreated / 1000000).toFixed(1)}M in 3 years</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rehab' && (
        <div className="space-y-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-primary mb-2">No Rehab Needed</h3>
            <p className="text-muted">This property is currently generating income and requires no immediate renovations</p>
          </div>
        </div>
      )}
    </>
  );

  const renderSanLeandroDetails = () => (
    <>
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">{sanLeandro6UnitDetails.whyGreatInvestment.title}</h3>
            <p className="text-muted mb-4">{sanLeandro6UnitDetails.whyGreatInvestment.description}</p>
            
            <div className="bg-accent/10 rounded-lg p-4 mb-4 border border-accent/20">
              <h4 className="font-semibold text-accent mb-2">📍 Prime Transit Location</h4>
              <p className="text-sm text-muted">{sanLeandro6UnitDetails.whyGreatInvestment.location}</p>
            </div>
            
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
              <h4 className="font-semibold text-green-600 mb-2">🏆 Competitive Advantages</h4>
              <p className="text-sm text-muted">{sanLeandro6UnitDetails.whyGreatInvestment.competitiveAdvantages}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {sanLeandro6UnitDetails.uniqueFeatures.slice(0, 5).map((feature, idx) => (
              <div key={idx} className="bg-card rounded-lg p-3 border border-border/60 text-center">
                <p className="text-xs font-medium text-primary">{feature.split('=')[0].trim()}</p>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-lg p-6 border border-border/60">
            <h4 className="font-semibold text-primary mb-3">📊 Operating Efficiency</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted mb-2">Ultra-Low OpEx Breakdown:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Property Tax</span>
                    <span className="font-medium">${sanLeandro6UnitDetails.operatingExpenses.propertyTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Insurance</span>
                    <span className="font-medium">${sanLeandro6UnitDetails.operatingExpenses.insurance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Management</span>
                    <span className="font-medium">${sanLeandro6UnitDetails.operatingExpenses.management.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                <div className="text-3xl font-bold text-accent mb-1">{sanLeandro6UnitDetails.operatingExpenses.opexRatio}%</div>
                <p className="text-xs text-muted">OpEx Ratio vs 45-50% typical</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financing' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Income & Cash Flow Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg p-6 border border-border/60">
              <h4 className="font-semibold text-primary mb-3">Current Income</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">{sanLeandro6UnitDetails.currentIncome.oneBedroomUnits}x 1BR @ ${sanLeandro6UnitDetails.currentIncome.oneBedroomRent}</span>
                  <span className="font-medium text-primary">${(sanLeandro6UnitDetails.currentIncome.oneBedroomUnits * sanLeandro6UnitDetails.currentIncome.oneBedroomRent).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">{sanLeandro6UnitDetails.currentIncome.twoBedroomUnits}x 2BR @ ${sanLeandro6UnitDetails.currentIncome.twoBedroomRent}</span>
                  <span className="font-medium text-primary">${(sanLeandro6UnitDetails.currentIncome.twoBedroomUnits * sanLeandro6UnitDetails.currentIncome.twoBedroomRent).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border/40">
                  <span className="font-semibold text-primary">Total Monthly</span>
                  <span className="font-bold text-accent">${sanLeandro6UnitDetails.currentIncome.totalMonthlyIncome.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border/60">
              <h4 className="font-semibold text-primary mb-3">Pro Forma Income</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">4x 1BR @ ${sanLeandro6UnitDetails.proFormaIncome.oneBedroomRent}</span>
                  <span className="font-medium text-green-600">${(4 * sanLeandro6UnitDetails.proFormaIncome.oneBedroomRent).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">2x 2BR @ ${sanLeandro6UnitDetails.proFormaIncome.twoBedroomRent}</span>
                  <span className="font-medium text-green-600">${(2 * sanLeandro6UnitDetails.proFormaIncome.twoBedroomRent).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border/40">
                  <span className="font-semibold text-primary">Total Monthly</span>
                  <span className="font-bold text-green-600">${sanLeandro6UnitDetails.proFormaIncome.totalMonthlyIncome.toLocaleString()}</span>
                </div>
                <div className="text-center mt-2 p-2 bg-green-500/10 rounded">
                  <p className="text-xs text-green-600 font-semibold">+${sanLeandro6UnitDetails.proFormaIncome.immediateIncrease.toLocaleString()}/year immediate upside</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
            <h4 className="font-semibold text-yellow-600 mb-2">⚠️ Cash Flow Consideration</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted">Current Cash Flow</p>
                <p className="font-bold text-red-600">-${Math.abs(sanLeandro6UnitDetails.cashFlowAnalysis.current.monthlyCashFlow).toLocaleString()}/mo</p>
              </div>
              <div>
                <p className="text-muted">Pro Forma Cash Flow</p>
                <p className="font-bold text-yellow-600">-${Math.abs(sanLeandro6UnitDetails.cashFlowAnalysis.proForma.monthlyCashFlow).toLocaleString()}/mo</p>
              </div>
            </div>
            <p className="text-xs text-muted mt-2">Easily offset by tax benefits. Turns positive with rent increases.</p>
          </div>
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Investment Strategy & Projections</h3>
          
          <div className="bg-card rounded-lg p-6 border border-border/60 mb-6">
            <h4 className="font-semibold text-primary mb-3">📈 5-Year Projection</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted">Year 5 Monthly Rent Roll</p>
                <p className="font-bold text-green-600 text-lg">${sanLeandro6UnitDetails.fiveYearProjection.year5MonthlyRent.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Year 5 NOI</p>
                <p className="font-bold text-primary text-lg">${sanLeandro6UnitDetails.fiveYearProjection.year5NOI.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Property Value @ 6% Cap</p>
                <p className="font-bold text-accent text-lg">${(sanLeandro6UnitDetails.fiveYearProjection.year5Value / 1000000).toFixed(2)}M</p>
              </div>
              <div>
                <p className="text-sm text-muted">Total 5-Year Return</p>
                <p className="font-bold text-green-600 text-lg">{sanLeandro6UnitDetails.fiveYearProjection.totalReturn}%</p>
              </div>
            </div>
          </div>

          <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
            <h4 className="font-semibold text-accent mb-3">🎯 Investment Strategy Timeline</h4>
            <div className="space-y-2">
              {sanLeandro6UnitDetails.investmentStrategy.map((strategy, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-sm text-muted">{strategy}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
            <h4 className="font-semibold text-green-600 mb-2">💡 The Bottom Line</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted">Purchase Price</p>
                <p className="font-bold text-primary">${(sanLeandro6UnitDetails.financing.purchasePrice / 1000000).toFixed(2)}M</p>
              </div>
              <div>
                <p className="text-muted">True Value</p>
                <p className="font-bold text-green-600">$1.7M+ based on market rents</p>
              </div>
              <div>
                <p className="text-muted">Unique Features</p>
                <p className="font-bold text-accent">No shared walls + garages</p>
              </div>
              <div>
                <p className="text-muted">Operating Efficiency</p>
                <p className="font-bold text-primary">{sanLeandro6UnitDetails.operatingExpenses.opexRatio}% OpEx ratio</p>
              </div>
            </div>
            <p className="text-xs text-muted mt-3">Perfect for investors who understand that great real estate isn&apos;t just about today&apos;s cash flow - it&apos;s about tomorrow&apos;s wealth.</p>
          </div>
        </div>
      )}

      {activeTab === 'rehab' && (
        <div className="space-y-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-primary mb-2">No Rehab Needed</h3>
            <p className="text-muted">This property is well-maintained and requires no immediate renovations</p>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-0 md:p-4 overflow-hidden">
      <div className="bg-background w-full max-w-full md:max-w-5xl h-full md:max-h-[90vh] md:rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-border/20 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h2 className="text-xl md:text-2xl font-bold text-primary leading-tight">{deal.title}</h2>
              <p className="text-muted text-sm md:text-base">{deal.location}</p>
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
          <div className="flex gap-1 md:gap-2 mt-4 md:mt-6 overflow-x-auto">
            {['overview', 'financing', 'rehab', 'returns'].map((tab) => (
              <button
                key={tab}
                className={`px-3 md:px-6 py-2 md:py-3 rounded-lg font-medium text-xs md:text-sm transition-colors min-h-[40px] md:min-h-[44px] flex items-center justify-center whitespace-nowrap ${
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
        <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
          {deal.id === 1 && renderSanDiegoDetails()}
          {deal.id === 2 && renderOaklandFlipDetails()}
          {deal.id === 3 && renderTampaDetails()}
          {deal.id === 4 && renderLafayetteDetails()}
          {deal.id === 5 && renderSanDiegoDuplexDetails()}
          {deal.id === 6 && renderOakland25UnitDetails()}
          {deal.id === 7 && renderSanLeandroDetails()}
          
          {/* Placeholder for other properties */}
          {deal.id !== 1 && deal.id !== 2 && deal.id !== 3 && deal.id !== 4 && deal.id !== 5 && deal.id !== 6 && deal.id !== 7 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-xl font-semibold text-primary mb-2">Detailed Analysis Coming Soon</h3>
              <p className="text-muted">Full analysis for this property is being prepared</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-border/20 flex-shrink-0 bg-background shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="bg-accent/10 rounded-lg p-2 sm:p-3 md:p-4 border border-accent/20 flex-1 sm:mr-2 md:mr-4">
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
              {deal.id === 4 && (
                <>
                  <p className="text-sm font-medium text-accent">🏔️ Premium Flip Opportunity</p>
                  <p className="text-xs text-muted mt-1">
                    Lafayette Hills with spectacular views and A+ schools. Cosmetic flip with 75% returns in 4 months.
                  </p>
                </>
              )}
              {deal.id === 5 && (
                <>
                  <p className="text-sm font-medium text-green-600">🏠 Perfect House Hack</p>
                  <p className="text-xs text-muted mt-1">
                    Live in San Diego for $4,476/mo while building equity. Only 5% down FHA financing available.
                  </p>
                </>
              )}
              {deal.id === 6 && (
                <>
                  <p className="text-sm font-medium text-accent">💰 Massive Value-Add</p>
                  <p className="text-xs text-muted mt-1">
                    25 units at $74k/unit with 72.8% income upside. Section 8 opportunity creates generational wealth.
                  </p>
                </>
              )}
              {deal.id === 7 && (
                <>
                  <p className="text-sm font-medium text-primary">🏢 Premium Multifamily</p>
                  <p className="text-xs text-muted mt-1">
                    Unique no-shared-walls design with 35.5% OpEx ratio. Tomorrow&apos;s wealth, not just today&apos;s cash flow.
                  </p>
                </>
              )}
              {deal.id !== 1 && deal.id !== 2 && deal.id !== 3 && deal.id !== 4 && deal.id !== 5 && deal.id !== 6 && deal.id !== 7 && (
                <>
                  <p className="text-sm font-medium text-primary">📊 Professional Analysis</p>
                  <p className="text-xs text-muted mt-1">
                    Complete financial analysis and risk assessment available.
                  </p>
                </>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button className="px-4 md:px-6 py-3 border border-border text-primary rounded-lg hover:bg-muted/5 transition-colors font-medium min-h-[44px] flex items-center justify-center text-sm md:text-base">
                Download Analysis
              </button>
              <button className="px-4 md:px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium min-h-[44px] flex items-center justify-center text-sm md:text-base">
                Contact Agent
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}