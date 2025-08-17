const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const napaProperty = {
  id: `napa-caymus-${Date.now()}`,
  title: "Napa 3-Unit House Hack - Live in Wine Country Paradise!",
  address: "850 Caymus St, Napa, CA 94559",
  type: "Multi-Family House Hack",
  price: 825000,
  monthly_rent: 5600,
  location: "Napa, CA",
  bedrooms: 5,
  bathrooms: 3,
  square_feet: 2800,
  lot_size: 0.25,
  year_built: 1880,
  property_type: "Multi-Family",
  status: "active",
  is_draft: false,
  is_deleted: false,
  images: [],
  description: "Incredible house hack opportunity in downtown Napa! Two buildings on one lot with warehouse bonus. Live in a studio while collecting $5,600/month from the main house and other studio. Just 5 blocks from downtown Napa's restaurants and wine tasting rooms.",
  
  features: [
    "Two separate buildings on one lot",
    "Warehouse with ADU conversion potential", 
    "5 blocks from downtown Napa",
    "3BR main house + 2 studios",
    "Wine country premium location",
    "Multiple income streams possible",
    "FHA eligible - only 3.5% down",
    "Walk to restaurants & wine tasting",
    "Event hosting potential",
    "Development opportunities"
  ],
  
  // Financial metrics
  cap_rate: 6.1,
  cash_flow: -1240, // Initial, becomes positive
  roi: 1900, // 5-year projection
  total_return: 2549125, // 30-year projection
  
  // Store complex data as JSONB
  property_data: {
    // Basic Info
    propertyType: "Multi-Family",
    investmentStrategy: "House Hack",
    confidence: "Very High",
    riskLevel: "Low",
    
    // Financial Details  
    downPayment: 28875,
    downPaymentPercent: 3.5,
    interestRate: 6.75,
    loanTerm: 30,
    monthlyPI: 5166,
    monthlyMIP: 564,
    totalPayment: 5730,
    closingCosts: 16500,
    
    // Operating Expenses
    propertyTaxes: 860,
    insurance: 250,
    maintenance: 200,
    vacancy: 280,
    capitalExpenditures: 200,
    
    // Rental Analysis
    currentRent: 5600,
    projectedRent: 8100,
    rentUpside: 2500,
    currentCapRate: 6.1,
    proFormaCapRate: 9.8,
    proFormaCashFlow: 1260,
    cashOnCashReturn: -51.4,
    
    // Unit Breakdown
    units: {
      "Main House (3BR/2BA)": { rent: 3200, sqft: 1600 },
      "Studio #1": { rent: 2400, sqft: 600 },
      "Studio #2": { rent: 0, sqft: 600, note: "Owner occupied" },
      "Warehouse": { rent: 0, potential: 2500, note: "ADU conversion opportunity" }
    },
    
    // Neighborhood
    neighborhoodClass: "A",
    neighborhood: "Downtown Napa",
    walkScore: 85,
    proximity: "5 blocks to downtown",
    
    // Value Add Opportunities
    valueAddStrategies: [
      "Convert warehouse to ADU ($100k cost, $2,500/mo rent)",
      "Airbnb arbitrage on weekends ($300/night)",
      "Wine country event hosting ($1,000+ per event)",
      "Commercial warehouse rental ($1,500/mo)",
      "Wine storage business ($2,000/mo)"
    ],
    
    // Exit Strategies
    exitStrategies: [
      "Long-term hold for $8,100/mo income",
      "Condo conversion - sell 3 units separately",
      "Develop luxury rental compound",
      "Sell after warehouse conversion for $1.1M+"
    ]
  },
  
  financing_scenarios: [
    {
      name: "FHA 3.5% Down (Recommended)",
      downPayment: 28875,
      loanAmount: 796125,
      rate: 6.75,
      monthlyPayment: 5730,
      cashFlow: -1240,
      totalCashNeeded: 45375,
      note: "Best for low cash buyers"
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
      totalCashNeeded: 181500,
      note: "Positive cash flow from day 1"
    }
  ],
  
  thirty_year_projections: {
    totalRentalIncome: 2016000,
    totalCashFlow: 378000,
    principalPaydown: 796125,
    propertyAppreciation: 1375000,
    totalReturn: 2549125,
    averageAnnualReturn: 84971,
    totalROI: 8830,
    equityAtYear30: 2200000,
    assumptions: "5% appreciation, 3% rent growth, warehouse conversion in year 2"
  },
  
  location_analysis: {
    walkScore: 85,
    proximity: "5 blocks to downtown Napa",
    nearbyEmployers: ["Wine industry", "Queen of the Valley Hospital", "Hospitality"],
    publicTransit: "Vine Transit nearby",
    schools: "Napa Valley USD",
    shopping: "Oxbow Public Market, First Street Napa",
    appreciation: "5-7% annual historically",
    marketTrends: "Limited supply, high demand, wine country premium"
  },
  
  strategic_overview: `This is a rare house hack opportunity in the heart of Napa Valley. With just $28,875 down using an FHA loan, you can control a property with three income-producing units plus a warehouse with massive potential. The strategy is simple: live in one studio while renting the main house and other studio for $5,600/month, covering most of your housing costs. The real opportunity lies in the warehouse conversion - add an ADU and you'll actually get PAID to live in downtown Napa. This property offers multiple exit strategies and income optimization paths in one of California's most desirable wine country locations.`,
  
  url: "https://www.loopnet.com/Listing/850-Caymus-St-Napa-CA/37220526/",
  source: "LoopNet",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

async function addNapaProperty() {
  try {
    console.log('🍷 Adding Napa Wine Country property to database...\n');
    
    // First check if properties table exists
    const { error: tableError } = await supabase
      .from('properties')
      .select('id')
      .limit(1);
    
    if (tableError && tableError.message.includes('relation') && tableError.message.includes('does not exist')) {
      console.error('❌ Properties table does not exist!');
      console.log('Please run the migration first: supabase_properties_simple.sql');
      return;
    }
    
    // Insert the property
    const { data, error } = await supabase
      .from('properties')
      .insert([napaProperty])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error adding property:', error);
      return;
    }
    
    console.log('✅ Property added successfully!');
    console.log('\n📊 Property Details:');
    console.log('- ID:', data.id);
    console.log('- Title:', data.title);
    console.log('- Location:', data.location);
    console.log('\n💰 Key Investment Metrics:');
    console.log('- Price: $825,000');
    console.log('- FHA Down Payment: $28,875 (3.5%)');
    console.log('- Monthly Rental Income: $5,600');
    console.log('- Your Net Cost: $1,240/month');
    console.log('- After Warehouse ADU: GET PAID $1,260/month!');
    console.log('- 5-Year ROI: 1,900%');
    console.log('\n🏡 Features:');
    console.log('- 3BR main house + 2 studio units');
    console.log('- Warehouse with ADU potential');
    console.log('- 5 blocks from downtown Napa');
    console.log('- Multiple income strategies available');
    console.log('\n📍 View Options:');
    console.log('- Dashboard: http://localhost:3000/dashboard');
    console.log('- Admin Panel: http://localhost:3000/admin/properties');
    console.log('\n📸 Next Step: Add property images in the admin panel!');
    console.log('   Go to /admin/properties and click Edit to add images');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addNapaProperty();