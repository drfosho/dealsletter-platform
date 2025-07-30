'use client';

import { useState, useEffect } from 'react';

interface Deal {
  id: number;
  title: string;
  location: string;
  type: string;
  strategy: string;
  price: number;
  downPayment: number;
  downPaymentPercent?: number;
  // Optional properties from the codebase
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  yearBuilt?: number | null;
  propertyType?: string;
  investmentStrategy?: string;
  confidence?: string;
  riskLevel?: string;
  holdPeriod?: number;
  description?: string;
  interestRate?: number;
  loanTerm?: number;
  monthlyPI?: number;
  closingCosts?: number;
  rehabCosts?: number;
  rehabTimeline?: string;
  rehabDetails?: Record<string, number>;
  propertyTax?: number;
  insurance?: number;
  hoa?: number;
  propertyManagement?: number;
  maintenance?: number;
  monthlyRent?: number;
  capRate?: number | null;
  totalROI?: number | null;
  timeline?: Array<{ period: string; action?: string; event?: string; impact?: string }>;
  pros?: string[];
  cons?: string[];
  features?: string[];
  neighborhood?: string;
  images?: string[];
  // Allow other properties but with proper types
  [key: string]: unknown;
}

interface DealModalProps {
  deal: Deal | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DealModal({ deal, isOpen, onClose }: DealModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Store original body styles
      const originalStyle = window.getComputedStyle(document.body).overflow;
      const originalPosition = window.getComputedStyle(document.body).position;
      const originalTop = window.getComputedStyle(document.body).top;
      const scrollY = window.scrollY;
      
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // Restore body scroll
        document.body.style.overflow = originalStyle;
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

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

  // Render functions for new properties (IDs 8-12)
  const renderSanDiegoDuplexHouseHack = () => (
    <>
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">Ultimate San Diego House Hack Opportunity</h3>
            <p className="text-muted mb-4">
              This Linda Vista duplex offers the ultimate San Diego house hack - live in one unit while the other pays majority of your mortgage! 
              With each unit capable of renting for $2,295/month and only needing 3.5% down with FHA, this property lets you control 
              a $1M asset for just $50K while building massive equity in America&apos;s Finest City.
            </p>
            
            <div className="bg-accent/10 rounded-lg p-4 mb-4 border border-accent/20">
              <h4 className="font-semibold text-accent mb-2">🏠 House Hack Economics</h4>
              <p className="text-sm text-muted">
                Live for effectively $6,109/month in San Diego while building equity. Your tenant pays $2,180/month (after vacancy) 
                toward your $8,289 monthly payment. Over 5 years: $85K principal paydown + $220K appreciation + $138K rent savings = $443K wealth created!
              </p>
            </div>
            
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <h4 className="font-semibold text-blue-600 mb-2">📍 Prime Location Benefits</h4>
              <p className="text-sm text-muted">
                Central San Diego location near USD & Mesa College with quick access to I-8 & I-5, just 15 minutes to beaches 
                and 10 minutes to downtown. Strong rental demand from university students, young professionals, military personnel, 
                and healthcare workers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20 text-center">
              <div className="text-2xl mb-2">💰</div>
              <h4 className="font-semibold text-green-600 mb-1">3.5% Down FHA</h4>
              <p className="text-xs text-muted">Only $34,965 down payment</p>
            </div>
            
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20 text-center">
              <div className="text-2xl mb-2">🏖️</div>
              <h4 className="font-semibold text-accent mb-1">15 Min to Beaches</h4>
              <p className="text-xs text-muted">Perfect San Diego lifestyle</p>
            </div>
            
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 text-center">
              <div className="text-2xl mb-2">🎓</div>
              <h4 className="font-semibold text-blue-600 mb-1">Near USD & Mesa</h4>
              <p className="text-xs text-muted">Strong student rental demand</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financing' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">FHA House Hack Financing</h3>
          
          <div className="bg-card rounded-lg p-6 border border-border/60">
            <h4 className="font-semibold text-primary mb-4">3.5% Down FHA Terms</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted">Purchase Price</span>
                <p className="font-semibold text-primary">$999,000</p>
              </div>
              <div>
                <span className="text-sm text-muted">Down Payment</span>
                <p className="font-semibold text-primary">$34,965 (3.5%)</p>
              </div>
              <div>
                <span className="text-sm text-muted">Loan Amount</span>
                <p className="font-semibold text-primary">$964,035</p>
              </div>
              <div>
                <span className="text-sm text-muted">Interest Rate</span>
                <p className="font-semibold text-primary">6.75% FHA</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-primary">Monthly Breakdown</h4>
            <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
              <span className="text-muted">Principal & Interest + MIP</span>
              <span className="font-semibold">$6,940</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
              <span className="text-muted">Property Tax</span>
              <span className="font-semibold">$999</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
              <span className="text-muted">Insurance & Utilities</span>
              <span className="font-semibold">$350</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg">
              <span className="text-muted">Total Monthly Payment</span>
              <span className="font-semibold text-red-600">$8,289</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
              <span className="text-muted">Rental Income (1 unit)</span>
              <span className="font-semibold text-green-600">-$2,180</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-accent/10 rounded-lg border border-accent/20">
              <span className="font-semibold text-primary">Your Effective Cost</span>
              <span className="font-bold text-accent text-lg">$6,109/month</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rehab' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Creative House Hack Strategies</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <h4 className="font-semibold text-blue-600 mb-3">🛋️ Room Rental Strategy</h4>
              <p className="text-sm text-muted mb-2">
                Rent your living room for $800/month to further reduce costs
              </p>
              <p className="font-semibold text-primary">New effective cost: $5,349/month</p>
            </div>
            
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
              <h4 className="font-semibold text-accent mb-3">🏖️ Airbnb Hybrid</h4>
              <p className="text-sm text-muted mb-2">
                Airbnb the other unit for $3,500+/month (peak season)
              </p>
              <p className="font-semibold text-primary">Potential: Live for FREE</p>
            </div>
            
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
              <h4 className="font-semibold text-green-600 mb-3">💼 Corporate Rental</h4>
              <p className="text-sm text-muted mb-2">
                Furnish one unit for traveling professionals
              </p>
              <p className="font-semibold text-primary">Premium rent: $3,000+/month</p>
            </div>
            
            <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
              <h4 className="font-semibold text-purple-600 mb-3">🏗️ Future ADU</h4>
              <p className="text-sm text-muted mb-2">
                Convert garage or add unit in backyard
              </p>
              <p className="font-semibold text-primary">Additional income: $1,800+/month</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">5-Year Wealth Building Analysis</h3>
          
          <div className="bg-gradient-to-r from-green-500/10 to-accent/10 rounded-lg p-6 border border-accent/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted mb-1">Principal Paydown</p>
                <p className="text-2xl font-bold text-primary">$85K</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted mb-1">Appreciation (4%)</p>
                <p className="text-2xl font-bold text-accent">$220K</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted mb-1">Rent Savings</p>
                <p className="text-2xl font-bold text-green-600">$138K</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted mb-1">Total Wealth</p>
                <p className="text-2xl font-bold text-primary">$443K</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-primary">Investment Comparison</h4>
            
            <div className="bg-muted/10 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted">Renting Similar 1BR</span>
                <span className="font-semibold">$2,200/month</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted">Your House Hack Cost</span>
                <span className="font-semibold">$6,109/month</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Extra Monthly Cost</span>
                <span className="font-semibold text-red-600">$3,909/month</span>
              </div>
            </div>
            
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
              <p className="text-sm font-semibold text-accent mb-2">BUT... You&apos;re Buying a $1M Asset!</p>
              <p className="text-xs text-muted">
                That extra $3,909/month is building equity, providing tax benefits, and giving you control 
                over your housing. Plus, you can increase rents, add ADUs, or refinance when rates drop.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderKansasCityApartments = () => (
    <>
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">Institutional-Quality 121-Unit Complex</h3>
            <p className="text-muted mb-4">
              This institutional-quality asset offers the holy grail of apartment investing - a 6.95% cap rate WITH an 
              assumable 3.1% loan through 2032! With 121 units on 8.8 acres, strong in-place cash flow, and significant 
              upside through organic rent growth and remaining unit renovations, this property delivers immediate returns 
              with massive value-add potential.
            </p>
            
            <div className="bg-yellow-500/10 rounded-lg p-4 mb-4 border border-yellow-500/20">
              <h4 className="font-semibold text-yellow-600 mb-2">🏆 The 3.1% Assumable Loan Advantage</h4>
              <p className="text-sm text-muted">
                Current market rates: 7.0-7.5%. Your rate: 3.1%. Monthly savings: $31,000+. Annual savings: $372,000. 
                This loan creates $3M+ in immediate value through interest rate arbitrage. The assumable loan is worth 
                more than most investors&apos; entire real estate portfolios!
              </p>
            </div>
            
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
              <h4 className="font-semibold text-accent mb-2">📈 Value-Add Business Plan</h4>
              <p className="text-sm text-muted">
                Current average rent: $924/unit. Market rent potential: $1,099/unit (+$175). 23 units need renovation 
                at $8-10K each for 18-30% ROI. Excess land allows development of 20-30 additional units. 
                Stabilized value: $15.2M (creating $5.6M in equity).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20 text-center">
              <div className="text-2xl mb-2">💰</div>
              <h4 className="font-semibold text-green-600 mb-1">12.5% Cash-on-Cash</h4>
              <p className="text-xs text-muted">$39,171/month cash flow</p>
            </div>
            
            <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20 text-center">
              <div className="text-2xl mb-2">🏦</div>
              <h4 className="font-semibold text-yellow-600 mb-1">3.1% Loan Rate</h4>
              <p className="text-xs text-muted">Through Nov 2032</p>
            </div>
            
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20 text-center">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-semibold text-accent mb-1">6.95% Cap Rate</h4>
              <p className="text-xs text-muted">Strong in-place returns</p>
            </div>
            
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 text-center">
              <div className="text-2xl mb-2">🏗️</div>
              <h4 className="font-semibold text-blue-600 mb-1">20-30 Unit Potential</h4>
              <p className="text-xs text-muted">Development opportunity</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financing' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Assumable Loan Details</h3>
          
          <div className="bg-yellow-500/10 rounded-lg p-6 border border-yellow-500/20">
            <h4 className="font-semibold text-yellow-600 mb-4">🏆 3.1% Fixed Rate Loan</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted">Purchase Price</span>
                <p className="font-semibold text-primary">$9,600,000</p>
              </div>
              <div>
                <span className="text-sm text-muted">Existing Loan Balance</span>
                <p className="font-semibold text-primary">$5,839,643</p>
              </div>
              <div>
                <span className="text-sm text-muted">Down Payment Required</span>
                <p className="font-semibold text-primary">$3,760,357 (39%)</p>
              </div>
              <div>
                <span className="text-sm text-muted">Interest Rate</span>
                <p className="font-semibold text-yellow-600">3.1% Fixed!</p>
              </div>
              <div>
                <span className="text-sm text-muted">Loan Maturity</span>
                <p className="font-semibold text-primary">November 2032</p>
              </div>
              <div>
                <span className="text-sm text-muted">Monthly P&I</span>
                <p className="font-semibold text-primary">$24,890</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-primary">Monthly Cash Flow Analysis</h4>
            <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
              <span className="text-muted">Gross Rental Income</span>
              <span className="font-semibold">$111,805</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
              <span className="text-muted">Vacancy (7%)</span>
              <span className="font-semibold">-$8,036</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
              <span className="text-muted">Operating Expenses (40%)</span>
              <span className="font-semibold">-$42,708</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
              <span className="text-muted">Net Operating Income</span>
              <span className="font-semibold text-green-600">$64,061</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
              <span className="text-muted">Debt Service</span>
              <span className="font-semibold">-$24,890</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-accent/10 rounded-lg border border-accent/20">
              <span className="font-semibold text-primary">Monthly Cash Flow</span>
              <span className="font-bold text-accent text-lg">$39,171</span>
            </div>
          </div>

          <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
            <h4 className="font-semibold text-blue-600 mb-2">💡 Loan Value Analysis</h4>
            <p className="text-sm text-muted">
              Market rate debt service would be ~$55,890/month. Your 3.1% rate saves $31,000/month. 
              That&apos;s $372,000 in annual savings, creating over $3M in loan value premium!
            </p>
          </div>
        </div>
      )}

      {activeTab === 'rehab' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Value-Add Execution Plan</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
              <h4 className="font-semibold text-accent mb-3">🔧 Unit Renovation Program</h4>
              <p className="text-sm text-muted mb-2">23 classic units remaining</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Cost per unit:</span>
                  <span className="font-semibold">$8,000-$10,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Rent increase:</span>
                  <span className="font-semibold text-green-600">+$175/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">ROI per unit:</span>
                  <span className="font-semibold text-accent">18-30%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <h4 className="font-semibold text-blue-600 mb-3">🏗️ Development Phase</h4>
              <p className="text-sm text-muted mb-2">20-30 new units on excess land</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Development cost:</span>
                  <span className="font-semibold">$3.6M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">New NOI:</span>
                  <span className="font-semibold text-green-600">+$275K/year</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Value created:</span>
                  <span className="font-semibold text-accent">+$4.2M</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/20">
            <h4 className="font-semibold text-green-600 mb-3">📊 Stabilized Pro Forma (Year 3)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted">New Monthly Gross</p>
                <p className="font-semibold text-primary">$132,979</p>
              </div>
              <div>
                <p className="text-sm text-muted">New Annual NOI</p>
                <p className="font-semibold text-primary">$989,364</p>
              </div>
              <div>
                <p className="text-sm text-muted">New Valuation (6.5% cap)</p>
                <p className="font-semibold text-accent">$15,220,985</p>
              </div>
              <div>
                <p className="text-sm text-muted">Total Value Created</p>
                <p className="font-semibold text-green-600">$5,620,985</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Investment Returns Analysis</h3>
          
          <div className="bg-gradient-to-r from-yellow-500/10 to-accent/10 rounded-lg p-6 border border-accent/20">
            <h4 className="font-semibold text-primary mb-4">Current Performance</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted mb-1">Cap Rate</p>
                <p className="text-2xl font-bold text-primary">6.95%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted mb-1">Cash-on-Cash</p>
                <p className="text-2xl font-bold text-accent">12.5%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted mb-1">Monthly Cash Flow</p>
                <p className="text-2xl font-bold text-green-600">$39K</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted mb-1">Loan Savings/Mo</p>
                <p className="text-2xl font-bold text-yellow-600">$31K</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-primary">Advanced Exit Strategies</h4>
            
            <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
              <h4 className="font-semibold text-purple-600 mb-2">🏢 Condo Conversion Play</h4>
              <p className="text-sm text-muted">
                Convert 47 townhome-style units to condos. Sell for $100K+ each = $5M+ in sales proceeds. 
                Keep 74 apartments for cash flow.
              </p>
            </div>
            
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <h4 className="font-semibold text-blue-600 mb-2">💼 Syndication Opportunity</h4>
              <p className="text-sm text-muted">
                Raise $2.5M from investors at 8% preferred return. Keep $1.26M for yourself. 
                70/30 split above 8% pref. Control $9.6M asset with other people&apos;s money.
              </p>
            </div>
            
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
              <h4 className="font-semibold text-accent mb-2">📈 Hold & Refinance</h4>
              <p className="text-sm text-muted">
                Execute value-add plan to $15.2M value. Refinance at 75% LTV = $11.4M loan. 
                Pull out $5.6M tax-free while keeping the property!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderTampaMobileHomePark = () => (
    <>
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">30-Unit Mobile Home Cash Flow Machine</h3>
            <p className="text-muted mb-4">
              This isn&apos;t your typical mobile home park - it&apos;s 30 INDIVIDUAL mobile homes on single-family lots with 
              SELLER FINANCING at incredible terms! With current rents $200-250 BELOW market and 75% on month-to-month 
              leases, you can increase income IMMEDIATELY. The 14% cash-on-cash return grows to 17% by year 3!
            </p>
            
            <div className="bg-green-500/10 rounded-lg p-4 mb-4 border border-green-500/20">
              <h4 className="font-semibold text-green-600 mb-2">💰 Seller Financing Terms</h4>
              <p className="text-sm text-muted">
                $1M seller financing at just 5% interest-only for years 1-2, then 5.5% for years 3-4, with balloon in year 5. 
                This incredible financing allows you to capture massive cash flow from day one while using the property&apos;s 
                income to pay down or refinance the loan.
              </p>
            </div>
            
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
              <h4 className="font-semibold text-accent mb-2">🚀 Immediate Income Upside</h4>
              <p className="text-sm text-muted">
                Current average rent: $1,215/unit. Market average: $1,465/unit. With 75% of tenants on month-to-month, 
                you can raise 23 units by $200 immediately for +$4,600/month. Full stabilization adds $7,500/month!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20 text-center">
              <div className="text-2xl mb-2">💵</div>
              <h4 className="font-semibold text-green-600 mb-1">11% Cap Rate</h4>
              <p className="text-xs text-muted">Current performance</p>
            </div>
            
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20 text-center">
              <div className="text-2xl mb-2">📈</div>
              <h4 className="font-semibold text-accent mb-1">17.6% Year 3</h4>
              <p className="text-xs text-muted">Stabilized returns</p>
            </div>
            
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 text-center">
              <div className="text-2xl mb-2">🏠</div>
              <h4 className="font-semibold text-blue-600 mb-1">100% Occupied</h4>
              <p className="text-xs text-muted">All renovated 2020-2025</p>
            </div>
            
            <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20 text-center">
              <div className="text-2xl mb-2">🏦</div>
              <h4 className="font-semibold text-yellow-600 mb-1">5% Financing</h4>
              <p className="text-xs text-muted">Seller financed</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financing' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Incredible Seller Financing Deal</h3>
          
          <div className="bg-yellow-500/10 rounded-lg p-6 border border-yellow-500/20">
            <h4 className="font-semibold text-yellow-600 mb-4">🏦 Seller Financing Structure</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted">Purchase Price</span>
                <p className="font-semibold text-primary">$3,200,000</p>
              </div>
              <div>
                <span className="text-sm text-muted">Down Payment</span>
                <p className="font-semibold text-primary">$2,300,000 (72%)</p>
              </div>
              <div>
                <span className="text-sm text-muted">Seller Financing</span>
                <p className="font-semibold text-primary">$1,000,000</p>
              </div>
              <div>
                <span className="text-sm text-muted">Years 1-2 Rate</span>
                <p className="font-semibold text-yellow-600">5.0% (Interest-Only)</p>
              </div>
              <div>
                <span className="text-sm text-muted">Years 3-4 Rate</span>
                <p className="font-semibold text-primary">5.5% (Interest-Only)</p>
              </div>
              <div>
                <span className="text-sm text-muted">Monthly Payment (Yr 1-2)</span>
                <p className="font-semibold text-green-600">$4,166</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-primary">Current Cash Flow Analysis</h4>
            <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
              <span className="text-muted">Gross Rent (30 units)</span>
              <span className="font-semibold">$36,442</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
              <span className="text-muted">Operating Expenses</span>
              <span className="font-semibold">-$10,793</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
              <span className="text-muted">Net Operating Income</span>
              <span className="font-semibold text-green-600">$26,211</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
              <span className="text-muted">Debt Service</span>
              <span className="font-semibold">-$4,166</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-accent/10 rounded-lg border border-accent/20">
              <span className="font-semibold text-primary">Monthly Cash Flow</span>
              <span className="font-bold text-accent text-lg">$22,045</span>
            </div>
          </div>

          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
            <h4 className="font-semibold text-green-600 mb-2">📊 5-Year Total Returns</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted">Cash Flow Collected</p>
                <p className="font-semibold">$1,900,000+</p>
              </div>
              <div>
                <p className="text-muted">Appreciation (3%/yr)</p>
                <p className="font-semibold">$500,000</p>
              </div>
              <div>
                <p className="text-muted">Total Profit</p>
                <p className="font-semibold text-green-600">$2,400,000+</p>
              </div>
            </div>
            <p className="text-xs text-muted mt-2">104% ROI on down payment!</p>
          </div>
        </div>
      )}

      {activeTab === 'rehab' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Income Optimization Strategy</h3>
          
          <div className="bg-accent/10 rounded-lg p-6 border border-accent/20">
            <h4 className="font-semibold text-accent mb-4">📈 Month 1 Action Plan</h4>
            <p className="text-sm text-muted mb-4">
              With 75% of tenants on month-to-month leases, you can implement immediate rent increases:
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-muted/10 rounded">
                <span className="text-sm text-muted">Units to raise immediately</span>
                <span className="font-semibold">23 units</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/10 rounded">
                <span className="text-sm text-muted">Increase per unit</span>
                <span className="font-semibold">$200/month</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-500/10 rounded">
                <span className="text-sm text-muted">Additional monthly income</span>
                <span className="font-semibold text-green-600">$4,600</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-accent/10 rounded">
                <span className="text-sm text-muted">New Cash-on-Cash Return</span>
                <span className="font-semibold text-accent">13.9%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <h4 className="font-semibold text-blue-600 mb-3">Year 2 Full Stabilization</h4>
              <div className="space-y-2 text-sm">
                <p className="text-muted">All units at market: +$250/unit</p>
                <p className="text-muted">Additional income: $7,500/month</p>
                <p className="font-semibold">Annual cash flow: $404,532</p>
                <p className="font-semibold text-blue-600">Cash-on-Cash: 17.6%!</p>
              </div>
            </div>
            
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
              <h4 className="font-semibold text-green-600 mb-3">Why This Model Works</h4>
              <ul className="space-y-1 text-sm text-muted">
                <li>• Single-family style lots (privacy)</li>
                <li>• Own the homes AND land</li>
                <li>• Recent renovations justify rates</li>
                <li>• Low turnover with happy tenants</li>
                <li>• No pad rent collection issues</li>
              </ul>
            </div>
          </div>

          <div className="bg-muted/10 rounded-lg p-4">
            <h4 className="font-semibold text-primary mb-2">🏠 Unit Features (Renovated 2020-2025)</h4>
            <p className="text-sm text-muted">
              All 30 units have been renovated with modern amenities, eliminating major CapEx needs while 
              providing a premium rental experience that feels like renting individual houses rather than 
              traditional mobile home park living.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Exceptional Returns Timeline</h3>
          
          <div className="bg-gradient-to-r from-green-500/10 to-accent/10 rounded-lg p-6 border border-accent/20">
            <h4 className="font-semibold text-primary mb-4">Cash-on-Cash Return Progression</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted mb-1">Current</p>
                <p className="text-3xl font-bold text-primary">11.5%</p>
                <p className="text-xs text-muted">$264K annually</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted mb-1">Year 1</p>
                <p className="text-3xl font-bold text-accent">13.9%</p>
                <p className="text-xs text-muted">$320K annually</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted mb-1">Year 3</p>
                <p className="text-3xl font-bold text-green-600">17.6%</p>
                <p className="text-xs text-muted">$405K annually</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <h4 className="font-semibold text-blue-600 mb-2">🎯 Investment Highlights</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>$250/unit below market = immediate $90K annual income increase potential</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>75% month-to-month leases = implement increases immediately</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>All units renovated = no major CapEx for years</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Individual lots = premium rental experience</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
              <h4 className="font-semibold text-accent mb-2">💰 5-Year Wealth Building</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Total cash flow collected</span>
                  <span className="font-semibold">$1,900,000+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Property appreciation</span>
                  <span className="font-semibold">$500,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Down payment</span>
                  <span className="font-semibold">-$2,300,000</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Net profit</span>
                  <span className="font-semibold text-accent">$2,400,000+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderLosGatosFlip = () => (
    <>
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">Los Gatos Mountain Estate - 2.2 Acres</h3>
            <p className="text-muted mb-4">
              This Los Gatos mountain property on 2.2 ACRES needs cosmetic updating but sits in one of Silicon Valley&apos;s 
              most desirable areas. With award-winning Los Gatos schools and massive lot premium, this property can 
              command $1,000+/sq ft when updated to luxury standards targeting tech executives seeking privacy.
            </p>
            
            <div className="bg-accent/10 rounded-lg p-4 mb-4 border border-accent/20">
              <h4 className="font-semibold text-accent mb-2">🏔️ The 2.2 Acre Advantage</h4>
              <p className="text-sm text-muted">
                Recent comps show $974-$1,510/sq ft with most under 0.5 acres. This property&apos;s 2.2 acres provides 
                exceptional privacy value for executives working from home. Conservative ARV at $1,064/sq ft = $2.1M, 
                but premium acreage could push value to $2.5M+.
              </p>
            </div>
            
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
              <h4 className="font-semibold text-green-600 mb-2">💰 710% ROI Potential</h4>
              <p className="text-sm text-muted">
                Offer $950K (competitive over-asking), invest $275K in luxury rehab, sell for $2.1M. 
                Net profit: $674,895 on $95K down payment. Complete in 9 months for 947% annualized returns!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20 text-center">
              <div className="text-2xl mb-2">🌲</div>
              <h4 className="font-semibold text-accent mb-1">2.2 Acres</h4>
              <p className="text-xs text-muted">Rare in Los Gatos</p>
            </div>
            
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 text-center">
              <div className="text-2xl mb-2">🎓</div>
              <h4 className="font-semibold text-blue-600 mb-1">10-Rated Schools</h4>
              <p className="text-xs text-muted">Los Gatos excellence</p>
            </div>
            
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20 text-center">
              <div className="text-2xl mb-2">💵</div>
              <h4 className="font-semibold text-green-600 mb-1">$675K Profit</h4>
              <p className="text-xs text-muted">710% ROI</p>
            </div>
            
            <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20 text-center">
              <div className="text-2xl mb-2">⏱️</div>
              <h4 className="font-semibold text-yellow-600 mb-1">9 Months</h4>
              <p className="text-xs text-muted">Quick luxury flip</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financing' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Hard Money Flip Financing</h3>
          
          <div className="bg-card rounded-lg p-6 border border-border/60">
            <h4 className="font-semibold text-primary mb-4">Financing Structure</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted">Offer Price</span>
                <p className="font-semibold text-primary">$950,000</p>
              </div>
              <div>
                <span className="text-sm text-muted">Down Payment (10%)</span>
                <p className="font-semibold text-primary">$95,000</p>
              </div>
              <div>
                <span className="text-sm text-muted">Purchase Loan</span>
                <p className="font-semibold text-primary">$855,000</p>
              </div>
              <div>
                <span className="text-sm text-muted">Rehab Budget</span>
                <p className="font-semibold text-primary">$275,000</p>
              </div>
              <div>
                <span className="text-sm text-muted">Total Loan Amount</span>
                <p className="font-semibold text-primary">$1,130,000</p>
              </div>
              <div>
                <span className="text-sm text-muted">Interest Rate</span>
                <p className="font-semibold text-primary">10.45%</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-primary">Investment Breakdown</h4>
            <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
              <span className="text-muted">Down Payment</span>
              <span className="font-semibold">$95,000</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
              <span className="text-muted">Interest Payments (9 mo)</span>
              <span className="font-semibold">$67,005</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
              <span className="text-muted">Insurance/Utilities/Taxes</span>
              <span className="font-semibold">$28,100</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg">
              <span className="text-muted">Total Holding Costs</span>
              <span className="font-semibold text-red-600">$95,105</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <span className="font-semibold text-primary">Total Cash Required</span>
              <span className="font-bold text-green-600 text-lg">$95,000</span>
            </div>
          </div>

          <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
            <h4 className="font-semibold text-accent mb-2">💡 Profit Analysis</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted">Sale Price (ARV)</p>
                <p className="font-semibold">$2,100,000</p>
              </div>
              <div>
                <p className="text-muted">Total Costs</p>
                <p className="font-semibold">-$1,330,105</p>
              </div>
              <div>
                <p className="text-muted">Net Profit</p>
                <p className="font-semibold text-accent">$674,895</p>
              </div>
              <div>
                <p className="text-muted">ROI</p>
                <p className="font-semibold text-green-600">710%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rehab' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Luxury Rehab Scope - $275,000</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
              <h4 className="font-semibold text-accent mb-3">🍳 Kitchen - High-End Remodel</h4>
              <p className="text-2xl font-bold text-primary mb-2">$65,000</p>
              <ul className="space-y-1 text-sm text-muted">
                <li>• Custom cabinets to ceiling</li>
                <li>• Waterfall quartz island</li>
                <li>• Sub-Zero/Wolf appliances</li>
                <li>• Designer backsplash</li>
                <li>• Smart home integration</li>
              </ul>
            </div>
            
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <h4 className="font-semibold text-blue-600 mb-3">🛁 Bathrooms - Spa Quality</h4>
              <p className="text-2xl font-bold text-primary mb-2">$45,000</p>
              <ul className="space-y-1 text-sm text-muted">
                <li>• Master bath gut remodel</li>
                <li>• Freestanding tub</li>
                <li>• Frameless glass shower</li>
                <li>• Heated floors</li>
                <li>• Designer fixtures</li>
              </ul>
            </div>
            
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
              <h4 className="font-semibold text-green-600 mb-3">🏠 Interior - Luxury Finishes</h4>
              <p className="text-2xl font-bold text-primary mb-2">$85,000</p>
              <ul className="space-y-1 text-sm text-muted">
                <li>• Engineered hardwood throughout</li>
                <li>• Designer paint & millwork</li>
                <li>• High-end lighting fixtures</li>
                <li>• Smart home system</li>
                <li>• Custom closet systems</li>
              </ul>
            </div>
            
            <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
              <h4 className="font-semibold text-yellow-600 mb-3">🌳 Exterior & Curb Appeal</h4>
              <p className="text-2xl font-bold text-primary mb-2">$50,000</p>
              <ul className="space-y-1 text-sm text-muted">
                <li>• Premium exterior paint</li>
                <li>• Professional landscaping</li>
                <li>• Deck refinishing</li>
                <li>• Driveway repair</li>
                <li>• Outdoor lighting</li>
              </ul>
            </div>
          </div>

          <div className="bg-muted/10 rounded-lg p-4">
            <h4 className="font-semibold text-primary mb-2">🔧 Systems & Permits - $30,000</h4>
            <p className="text-sm text-muted">
              HVAC updates, electrical panel upgrade, plumbing fixtures, permits, and contingency. 
              Focus on cosmetic improvements while ensuring all systems meet luxury home standards.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Premium Flip Returns Analysis</h3>
          
          <div className="bg-gradient-to-r from-accent/10 to-green-500/10 rounded-lg p-6 border border-accent/20">
            <h4 className="font-semibold text-primary mb-4">Why $2.1M ARV is Conservative</h4>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted mb-2">Recent Comparable Sales</p>
                <ul className="space-y-1 text-sm">
                  <li>• Comps range: $974-$1,510/sq ft</li>
                  <li>• Most comps under 0.5 acres</li>
                  <li>• This property: 2.2 ACRES</li>
                  <li>• Target: $1,064/sq ft (conservative)</li>
                </ul>
              </div>
              <div>
                <p className="text-sm text-muted mb-2">Target Buyer Profile</p>
                <ul className="space-y-1 text-sm">
                  <li>• Tech executives (remote work)</li>
                  <li>• Privacy seekers</li>
                  <li>• Los Gatos schools priority</li>
                  <li>• $2M+ budget buyers</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <h4 className="font-semibold text-blue-600 mb-3">📊 Investment Timeline (9 Months)</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted">Months 1-2</p>
                  <p className="font-semibold">Permits & Planning</p>
                </div>
                <div>
                  <p className="text-muted">Months 3-7</p>
                  <p className="font-semibold">Full Renovation</p>
                </div>
                <div>
                  <p className="text-muted">Months 8-9</p>
                  <p className="font-semibold">Marketing & Sale</p>
                </div>
              </div>
            </div>
            
            <div className="bg-accent/10 rounded-lg p-6 border border-accent/20">
              <h4 className="font-semibold text-accent mb-3">💰 Final Numbers</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted">Total Investment</span>
                  <span className="font-semibold">$1,330,105</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Sale Price</span>
                  <span className="font-semibold">$2,100,000</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-primary">Net Profit</span>
                  <span className="text-green-600">$674,895</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-primary">ROI on Cash</span>
                  <span className="text-accent">710%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderOaklandHUDFlip = () => (
    <>
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">East Oakland HUD Home Value Play</h3>
            <p className="text-muted mb-4">
              This HUD home in East Oakland offers solid flip potential with cosmetic renovation needs. Based on photos, 
              property appears structurally sound but needs updating. With FHA 203k eligibility and strong comps, this 
              represents manageable value-add opportunity with excellent returns. Large 5,000 sq ft lot provides future 
              ADU potential.
            </p>
            
            <div className="bg-green-500/10 rounded-lg p-4 mb-4 border border-green-500/20">
              <h4 className="font-semibold text-green-600 mb-2">💰 280% ROI in 6 Months</h4>
              <p className="text-sm text-muted">
                Purchase at $281K, invest $65K in cosmetic rehab, sell for $475K. Net profit of $78,794 on just 
                $28,100 down payment. Quick 6-month flip with 560% annualized returns focusing on cosmetic improvements.
              </p>
            </div>
            
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <h4 className="font-semibold text-blue-600 mb-2">🏗️ Large Lot ADU Opportunity</h4>
              <p className="text-sm text-muted">
                5,000 sq ft lot provides ample space for future ADU development. Oakland&apos;s ADU-friendly policies make 
                this an excellent long-term hold option. Add an ADU for $150K and rent for $1,800+/month.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20 text-center">
              <div className="text-2xl mb-2">🏚️</div>
              <h4 className="font-semibold text-accent mb-1">HUD Home</h4>
              <p className="text-xs text-muted">Government owned</p>
            </div>
            
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20 text-center">
              <div className="text-2xl mb-2">💵</div>
              <h4 className="font-semibold text-green-600 mb-1">$79K Profit</h4>
              <p className="text-xs text-muted">280% ROI</p>
            </div>
            
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 text-center">
              <div className="text-2xl mb-2">📐</div>
              <h4 className="font-semibold text-blue-600 mb-1">5,000 sq ft</h4>
              <p className="text-xs text-muted">Large lot</p>
            </div>
            
            <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20 text-center">
              <div className="text-2xl mb-2">⏱️</div>
              <h4 className="font-semibold text-yellow-600 mb-1">6 Months</h4>
              <p className="text-xs text-muted">Quick flip</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financing' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Hard Money Flip Financing</h3>
          
          <div className="bg-card rounded-lg p-6 border border-border/60">
            <h4 className="font-semibold text-primary mb-4">Financing Terms</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted">Purchase Price</span>
                <p className="font-semibold text-primary">$281,000</p>
              </div>
              <div>
                <span className="text-sm text-muted">Down Payment (10%)</span>
                <p className="font-semibold text-primary">$28,100</p>
              </div>
              <div>
                <span className="text-sm text-muted">Purchase Loan</span>
                <p className="font-semibold text-primary">$252,900</p>
              </div>
              <div>
                <span className="text-sm text-muted">Rehab Budget</span>
                <p className="font-semibold text-primary">$65,000</p>
              </div>
              <div>
                <span className="text-sm text-muted">Total Loan</span>
                <p className="font-semibold text-primary">$317,900</p>
              </div>
              <div>
                <span className="text-sm text-muted">Interest Rate</span>
                <p className="font-semibold text-primary">10.45%</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-primary">Investment Analysis</h4>
            <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
              <span className="text-muted">Down Payment</span>
              <span className="font-semibold">$28,100</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
              <span className="text-muted">Interest (6 months)</span>
              <span className="font-semibold">$13,206</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
              <span className="text-muted">Insurance/Utilities/Staging</span>
              <span className="font-semibold">$8,500</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg">
              <span className="text-muted">Total Costs</span>
              <span className="font-semibold text-red-600">$368,106</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
              <span className="text-muted">Sale Price (ARV)</span>
              <span className="font-semibold text-green-600">$475,000</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-accent/10 rounded-lg border border-accent/20">
              <span className="font-semibold text-primary">Net Profit</span>
              <span className="font-bold text-accent text-lg">$78,794</span>
            </div>
          </div>

          <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
            <h4 className="font-semibold text-blue-600 mb-2">🏦 Alternative: FHA 203k</h4>
            <p className="text-sm text-muted">
              This HUD home is FHA 203k eligible. Owner-occupants could purchase with 3.5% down ($9,835) 
              and finance the rehab. Live in it during renovation, then sell or rent out.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'rehab' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Realistic Rehab Scope - $65,000</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
              <h4 className="font-semibold text-accent mb-3">🍳 Kitchen Update</h4>
              <p className="text-2xl font-bold text-primary mb-2">$18,000</p>
              <ul className="space-y-1 text-sm text-muted">
                <li>• Cabinet refacing/painting</li>
                <li>• New quartz countertops</li>
                <li>• Stainless steel appliances</li>
                <li>• Tile backsplash</li>
                <li>• Modern fixtures</li>
              </ul>
            </div>
            
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <h4 className="font-semibold text-blue-600 mb-3">🛁 Bathroom Refresh</h4>
              <p className="text-2xl font-bold text-primary mb-2">$8,000</p>
              <ul className="space-y-1 text-sm text-muted">
                <li>• New vanity & top</li>
                <li>• Modern toilet</li>
                <li>• Tile flooring</li>
                <li>• Updated fixtures</li>
                <li>• Fresh tile surround</li>
              </ul>
            </div>
            
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
              <h4 className="font-semibold text-green-600 mb-3">🏠 Interior Updates</h4>
              <p className="text-2xl font-bold text-primary mb-2">$22,000</p>
              <ul className="space-y-1 text-sm text-muted">
                <li>• Full interior paint</li>
                <li>• LVP flooring throughout</li>
                <li>• Modern light fixtures</li>
                <li>• Interior doors</li>
                <li>• Window treatments</li>
              </ul>
            </div>
            
            <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
              <h4 className="font-semibold text-yellow-600 mb-3">🌳 Exterior Work</h4>
              <p className="text-2xl font-bold text-primary mb-2">$12,000</p>
              <ul className="space-y-1 text-sm text-muted">
                <li>• Exterior paint</li>
                <li>• Landscaping cleanup</li>
                <li>• New garage door</li>
                <li>• Front door & hardware</li>
                <li>• Fence repairs</li>
              </ul>
            </div>
          </div>

          <div className="bg-muted/10 rounded-lg p-4">
            <h4 className="font-semibold text-primary mb-2">🔧 Permits & Contingency - $5,000</h4>
            <p className="text-sm text-muted">
              Building permits, dumpster rental, and 10% contingency for unexpected issues. Focus on cosmetic 
              improvements that don&apos;t require major permits to keep timeline tight.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary mb-4">Quick Flip Returns</h3>
          
          <div className="bg-gradient-to-r from-green-500/10 to-accent/10 rounded-lg p-6 border border-accent/20">
            <h4 className="font-semibold text-primary mb-4">Comparable Sales Support</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-muted/10 rounded">
                <span className="text-sm text-muted">9608 D St (0.06 mi)</span>
                <span className="font-semibold">$534,000</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/10 rounded">
                <span className="text-sm text-muted">958 106th Ave</span>
                <span className="font-semibold">$500,000 ($710/sq ft)</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-accent/10 rounded">
                <span className="text-sm font-semibold">Conservative ARV</span>
                <span className="font-bold text-accent">$475,000 ($550/sq ft)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <h4 className="font-semibold text-blue-600 mb-3">📈 Value-Add Strategies</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Stage professionally (+$15-20K value)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Price at $499K (psychological barrier)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Market as &quot;turnkey&quot; to owner-occupants</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Highlight ADU potential on large lot</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
              <h4 className="font-semibold text-accent mb-3">💰 Final Numbers</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Total Investment</span>
                  <span className="font-semibold">$368,106</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Sale Price</span>
                  <span className="font-semibold">$475,000</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">Net Profit</span>
                  <span className="font-bold text-green-600">$78,794</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">ROI on Cash</span>
                  <span className="font-bold text-accent">280%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
            <h4 className="font-semibold text-yellow-600 mb-2">🏠 Alternative: Buy & Hold with ADU</h4>
            <p className="text-sm text-muted">
              Instead of flipping, renovate for $65K, add ADU for $150K. Rent main house for $2,800/month, 
              ADU for $1,800/month = $4,600/month total. Creates long-term wealth with Oakland appreciation.
            </p>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative h-full flex items-end md:items-center justify-center p-0 md:p-4">
        <div className="bg-background w-full md:max-w-5xl h-full md:max-h-[90vh] md:rounded-xl shadow-2xl flex flex-col relative">
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
            {['overview', 'financing', 'rehab', 'returns', 'pictures'].map((tab) => (
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
        <div className="flex-1 overflow-y-auto overscroll-contain -webkit-overflow-scrolling-touch p-4 md:p-6 min-h-0">
          {deal.id === 1 && renderSanDiegoDetails()}
          {deal.id === 2 && renderOaklandFlipDetails()}
          {deal.id === 3 && renderTampaDetails()}
          {deal.id === 4 && renderLafayetteDetails()}
          {deal.id === 5 && renderSanDiegoDuplexDetails()}
          {deal.id === 6 && renderOakland25UnitDetails()}
          {deal.id === 7 && renderSanLeandroDetails()}
          {deal.id === 8 && renderSanDiegoDuplexHouseHack()}
          {deal.id === 9 && renderKansasCityApartments()}
          {deal.id === 10 && renderTampaMobileHomePark()}
          {deal.id === 11 && renderLosGatosFlip()}
          {deal.id === 12 && renderOaklandHUDFlip()}
          
          {/* Dynamic properties render */}
          {deal.id !== 1 && deal.id !== 2 && deal.id !== 3 && deal.id !== 4 && deal.id !== 5 && deal.id !== 6 && deal.id !== 7 && deal.id !== 8 && deal.id !== 9 && deal.id !== 10 && deal.id !== 11 && deal.id !== 12 && (
            <div className="space-y-8">
              {activeTab === 'overview' ? (
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-4">Property Overview</h3>
                  <div className="bg-card rounded-lg p-6 shadow-lg border border-border/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-primary mb-3">Property Details</h4>
                        <div className="space-y-2">
                          {deal.bedrooms && <p className="text-sm"><span className="text-muted">Bedrooms:</span> <span className="font-medium">{deal.bedrooms}</span></p>}
                          {deal.bathrooms && <p className="text-sm"><span className="text-muted">Bathrooms:</span> <span className="font-medium">{deal.bathrooms}</span></p>}
                          {deal.sqft && <p className="text-sm"><span className="text-muted">Square Feet:</span> <span className="font-medium">{deal.sqft.toLocaleString()}</span></p>}
                          {deal.yearBuilt && <p className="text-sm"><span className="text-muted">Year Built:</span> <span className="font-medium">{deal.yearBuilt}</span></p>}
                          {deal.propertyType && <p className="text-sm"><span className="text-muted">Property Type:</span> <span className="font-medium">{deal.propertyType}</span></p>}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-primary mb-3">Investment Details</h4>
                        <div className="space-y-2">
                          {deal.investmentStrategy && <p className="text-sm"><span className="text-muted">Strategy:</span> <span className="font-medium">{deal.investmentStrategy}</span></p>}
                          {deal.confidence && <p className="text-sm"><span className="text-muted">Confidence Level:</span> <span className="font-medium">{deal.confidence.toUpperCase()}</span></p>}
                          {deal.riskLevel && <p className="text-sm"><span className="text-muted">Risk Level:</span> <span className="font-medium">{deal.riskLevel.toUpperCase()}</span></p>}
                          {deal.holdPeriod && <p className="text-sm"><span className="text-muted">Hold Period:</span> <span className="font-medium">{deal.holdPeriod} years</span></p>}
                        </div>
                      </div>
                    </div>
                    
                    {deal.description && (
                      <div className="mt-6">
                        <h4 className="text-lg font-semibold text-primary mb-3">Description</h4>
                        <p className="text-sm text-muted">{deal.description}</p>
                      </div>
                    )}
                    
                    {deal.features && deal.features.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-lg font-semibold text-primary mb-3">Features</h4>
                        <div className="flex flex-wrap gap-2">
                          {deal.features.map((feature: string, index: number) => (
                            <span key={index} className="px-3 py-1 bg-accent/10 text-accent rounded-lg text-sm">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
              
              {activeTab === 'financing' ? (
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-4">Financing Details</h3>
                  <div className="bg-card rounded-lg p-6 shadow-lg border border-border/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-primary mb-3">Loan Details</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted">Purchase Price</span>
                            <span className="font-semibold text-2xl">${deal.price?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted">Down Payment</span>
                            <span className="font-semibold">${deal.downPayment?.toLocaleString() || '0'} ({deal.downPaymentPercent || 0}%)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted">Loan Amount</span>
                            <span className="font-semibold">${((deal.price || 0) - (deal.downPayment || 0)).toLocaleString()}</span>
                          </div>
                          {deal.interestRate && (
                            <div className="flex justify-between">
                              <span className="text-muted">Interest Rate</span>
                              <span className="font-semibold">{deal.interestRate}%</span>
                            </div>
                          )}
                          {deal.loanTerm && (
                            <div className="flex justify-between">
                              <span className="text-muted">Loan Term</span>
                              <span className="font-semibold">{deal.loanTerm} years</span>
                            </div>
                          )}
                          {deal.monthlyPI && (
                            <div className="flex justify-between">
                              <span className="text-muted">Monthly P&I</span>
                              <span className="font-semibold">${deal.monthlyPI.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-semibold text-primary mb-3">Closing Costs</h4>
                        <div className="space-y-3">
                          {deal.closingCosts && (
                            <div className="flex justify-between">
                              <span className="text-muted">Closing Costs</span>
                              <span className="font-semibold">${deal.closingCosts.toLocaleString()}</span>
                            </div>
                          )}
                          {deal.rehabCosts && (
                            <div className="flex justify-between">
                              <span className="text-muted">Rehab Budget</span>
                              <span className="font-semibold">${deal.rehabCosts.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-3 border-t">
                            <span className="text-muted font-semibold">Total Cash Required</span>
                            <span className="font-bold text-accent text-xl">
                              ${((deal.downPayment || 0) + (deal.closingCosts || 0) + (deal.rehabCosts || 0)).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              
              {activeTab === 'rehab' ? (
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-4">Rehab & Renovation</h3>
                  <div className="bg-card rounded-lg p-6 shadow-lg border border-border/20">
                    {deal.rehabCosts ? (
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-lg font-semibold text-primary mb-3">Total Rehab Budget</h4>
                          <p className="text-3xl font-bold text-accent">${deal.rehabCosts.toLocaleString()}</p>
                        </div>
                        
                        {deal.rehabDetails && Object.keys(deal.rehabDetails).length > 0 && (
                          <div>
                            <h4 className="text-lg font-semibold text-primary mb-3">Rehab Breakdown</h4>
                            <div className="space-y-2">
                              {Object.entries(deal.rehabDetails).map(([key, value]) => (
                                <div key={key} className="flex justify-between py-2 border-b border-border/10">
                                  <span className="text-muted capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                  <span className="font-medium">${(value as number).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {deal.rehabTimeline && (
                          <div>
                            <h4 className="text-lg font-semibold text-primary mb-3">Timeline</h4>
                            <p className="text-muted">{deal.rehabTimeline}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted">No rehab or renovation planned for this property</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
              
              {activeTab === 'returns' ? (
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-4">Investment Returns</h3>
                  <div className="space-y-6">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-card rounded-lg p-4 shadow-lg border border-border/20">
                        <p className="text-sm text-muted mb-1">Monthly Rent</p>
                        <p className="text-2xl font-bold text-primary">${deal.monthlyRent?.toLocaleString() || '0'}</p>
                      </div>
                      <div className="bg-card rounded-lg p-4 shadow-lg border border-border/20">
                        <p className="text-sm text-muted mb-1">Monthly Cash Flow</p>
                        <p className={`text-2xl font-bold ${(typeof deal.monthlyCashFlow === 'number' ? deal.monthlyCashFlow : 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${deal.monthlyCashFlow?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div className="bg-card rounded-lg p-4 shadow-lg border border-border/20">
                        <p className="text-sm text-muted mb-1">Cap Rate</p>
                        <p className="text-2xl font-bold text-accent">{deal.capRate?.toFixed(2) || '0'}%</p>
                      </div>
                      <div className="bg-card rounded-lg p-4 shadow-lg border border-border/20">
                        <p className="text-sm text-muted mb-1">Total ROI</p>
                        <p className="text-2xl font-bold text-green-600">{deal.totalROI?.toFixed(1) || '0'}%</p>
                      </div>
                    </div>

                    {/* Expenses Breakdown */}
                    {(deal.propertyTax || deal.insurance || deal.hoa || deal.expenses) ? (
                      <div className="bg-card rounded-lg p-6 shadow-lg border border-border/20">
                        <h4 className="text-lg font-semibold text-primary mb-4">Monthly Expenses</h4>
                        <div className="space-y-3">
                          {deal.propertyTax && (
                            <div className="flex justify-between">
                              <span className="text-muted">Property Tax</span>
                              <span className="font-medium">${Math.round(deal.propertyTax / 12).toLocaleString()}</span>
                            </div>
                          )}
                          {deal.insurance && (
                            <div className="flex justify-between">
                              <span className="text-muted">Insurance</span>
                              <span className="font-medium">${Math.round(deal.insurance / 12).toLocaleString()}</span>
                            </div>
                          )}
                          {deal.hoa && (
                            <div className="flex justify-between">
                              <span className="text-muted">HOA Fees</span>
                              <span className="font-medium">${deal.hoa.toLocaleString()}</span>
                            </div>
                          )}
                          {deal.propertyManagement && (
                            <div className="flex justify-between">
                              <span className="text-muted">Property Management</span>
                              <span className="font-medium">${deal.propertyManagement.toLocaleString()}</span>
                            </div>
                          )}
                          {deal.maintenance && (
                            <div className="flex justify-between">
                              <span className="text-muted">Maintenance Reserve</span>
                              <span className="font-medium">${deal.maintenance.toLocaleString()}</span>
                            </div>
                          )}
                          {deal.monthlyPI && (
                            <div className="flex justify-between">
                              <span className="text-muted">Mortgage P&I</span>
                              <span className="font-medium">${deal.monthlyPI.toLocaleString()}</span>
                            </div>
                          )}
                          {(deal.totalExpenses || 
                            (deal.propertyTax || deal.insurance || deal.hoa || deal.propertyManagement || deal.maintenance || deal.monthlyPI)) && (
                            <div className="flex justify-between pt-3 border-t">
                              <span className="font-semibold">Total Monthly Expenses</span>
                              <span className="font-bold text-red-600">
                                ${(deal.totalExpenses || 
                                  (Math.round((deal.propertyTax || 0) / 12) + 
                                   Math.round((deal.insurance || 0) / 12) + 
                                   (deal.hoa || 0) + 
                                   (deal.propertyManagement || 0) + 
                                   (deal.maintenance || 0) + 
                                   (deal.monthlyPI || 0))).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {/* Investment Timeline */}
                    {deal.timeline && deal.timeline.length > 0 ? (
                      <div className="bg-card rounded-lg p-6 shadow-lg border border-border/20">
                        <h4 className="text-lg font-semibold text-primary mb-4">Investment Timeline</h4>
                        <div className="space-y-4">
                          {deal.timeline.map((item, index) => (
                            <div key={index} className="flex gap-4 items-start">
                              <div className="min-w-[100px] text-sm font-medium text-accent">{item.period}</div>
                              <div className="flex-1">
                                <p className="font-medium">{item.event || item.action || ''}</p>
                                {item.impact && <p className="text-sm text-muted mt-1">{item.impact}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
              
              {activeTab === 'pictures' ? (
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-4">Property Pictures</h3>
                  {deal.images && deal.images.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {deal.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted/20">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                              src={image} 
                              alt={`${deal.title} - Image ${index + 1}`}
                              className="absolute inset-0 w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                              onClick={() => {
                                // Open in new tab for full view
                                window.open(image, '_blank');
                              }}
                              onError={(e) => {
                                e.currentTarget.src = '/api/placeholder/400/300';
                              }}
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg pointer-events-none"></div>
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">
                              Click to enlarge
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-card rounded-lg p-12 shadow-lg border border-border/20 text-center">
                      <div className="text-6xl mb-4">📷</div>
                      <p className="text-muted">No property images available</p>
                    </div>
                  )}
                </div>
              ) : null}
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
              {deal.id === 8 && (
                <>
                  <p className="text-sm font-medium text-green-600">🏠 Ultimate House Hack</p>
                  <p className="text-xs text-muted mt-1">
                    Live nearly FREE in San Diego! Control $1M asset for $50K down while building $443K wealth over 5 years.
                  </p>
                </>
              )}
              {deal.id === 9 && (
                <>
                  <p className="text-sm font-medium text-yellow-600">🏆 Holy Grail Investment</p>
                  <p className="text-xs text-muted mt-1">
                    3.1% assumable loan saves $372K annually! 121 units with immediate 12.5% returns and $5.6M upside.
                  </p>
                </>
              )}
              {deal.id === 10 && (
                <>
                  <p className="text-sm font-medium text-green-600">💰 Cash Flow Machine</p>
                  <p className="text-xs text-muted mt-1">
                    30 individual mobile homes with seller financing! 11.5% returns growing to 17.6% with immediate upside.
                  </p>
                </>
              )}
              {deal.id === 11 && (
                <>
                  <p className="text-sm font-medium text-accent">🏔️ Premium Mountain Estate</p>
                  <p className="text-xs text-muted mt-1">
                    2.2 acres in Los Gatos! 710% ROI potential targeting tech executives seeking privacy and luxury.
                  </p>
                </>
              )}
              {deal.id === 12 && (
                <>
                  <p className="text-sm font-medium text-blue-600">🏚️ HUD Home Value Play</p>
                  <p className="text-xs text-muted mt-1">
                    East Oakland flip with 280% ROI! Large lot with ADU potential for long-term wealth building.
                  </p>
                </>
              )}
              {deal.id !== 1 && deal.id !== 2 && deal.id !== 3 && deal.id !== 4 && deal.id !== 5 && deal.id !== 6 && deal.id !== 7 && deal.id !== 8 && deal.id !== 9 && deal.id !== 10 && deal.id !== 11 && deal.id !== 12 && (
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
    </div>
  );
}