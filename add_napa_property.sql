-- Add Napa Wine Country House Hack Property
-- Run this in Supabase SQL Editor

INSERT INTO public.properties (
  id,
  title,
  address,
  type,
  price,
  monthly_rent,
  location,
  bedrooms,
  bathrooms,
  square_feet,
  lot_size,
  year_built,
  property_type,
  status,
  is_draft,
  is_deleted,
  images,
  description,
  features,
  cap_rate,
  cash_flow,
  roi,
  total_return,
  property_data,
  financing_scenarios,
  thirty_year_projections,
  location_analysis,
  strategic_overview,
  url,
  source,
  created_at,
  updated_at
) VALUES (
  'napa-caymus-850',
  'Napa 3-Unit House Hack - Live in Wine Country Paradise!',
  '850 Caymus St, Napa, CA 94559',
  'Multi-Family House Hack',
  825000,
  5600,
  'Napa, CA',
  5,
  3,
  2800,
  0.25,
  1880,
  'Multi-Family',
  'active',
  false,
  false,
  '[]'::jsonb,
  'Incredible house hack opportunity in downtown Napa! Two buildings on one lot with warehouse bonus. Live in a studio while collecting $5,600/month from the main house and other studio. Just 5 blocks from downtown Napa''s restaurants and wine tasting rooms. Perfect for wine country lifestyle with mortgage paid by tenants!',
  '["Two separate buildings on one lot", "Warehouse with ADU conversion potential", "5 blocks from downtown Napa", "3BR main house + 2 studios", "Wine country premium location", "Multiple income streams possible", "FHA eligible - only 3.5% down", "Walk to restaurants & wine tasting", "Event hosting potential", "Development opportunities"]'::jsonb,
  6.1,
  -1240,
  1900,
  2549125,
  '{
    "propertyType": "Multi-Family",
    "investmentStrategy": "House Hack",
    "confidence": "Very High",
    "riskLevel": "Low",
    "downPayment": 28875,
    "downPaymentPercent": 3.5,
    "interestRate": 6.75,
    "loanTerm": 30,
    "monthlyPI": 5166,
    "monthlyMIP": 564,
    "totalPayment": 5730,
    "closingCosts": 16500,
    "propertyTaxes": 860,
    "insurance": 250,
    "maintenance": 200,
    "vacancy": 280,
    "capitalExpenditures": 200,
    "currentRent": 5600,
    "projectedRent": 8100,
    "rentUpside": 2500,
    "currentCapRate": 6.1,
    "proFormaCapRate": 9.8,
    "proFormaCashFlow": 1260,
    "cashOnCashReturn": -51.4,
    "units": {
      "Main House (3BR/2BA)": {"rent": 3200, "sqft": 1600},
      "Studio #1": {"rent": 2400, "sqft": 600},
      "Studio #2": {"rent": 0, "sqft": 600, "note": "Owner occupied"},
      "Warehouse": {"rent": 0, "potential": 2500, "note": "ADU conversion opportunity"}
    },
    "neighborhoodClass": "A",
    "neighborhood": "Downtown Napa",
    "walkScore": 85,
    "proximity": "5 blocks to downtown",
    "valueAddStrategies": [
      "Convert warehouse to ADU ($100k cost, $2,500/mo rent)",
      "Airbnb arbitrage on weekends ($300/night)",
      "Wine country event hosting ($1,000+ per event)",
      "Commercial warehouse rental ($1,500/mo)",
      "Wine storage business ($2,000/mo)"
    ],
    "exitStrategies": [
      "Long-term hold for $8,100/mo income",
      "Condo conversion - sell 3 units separately",
      "Develop luxury rental compound",
      "Sell after warehouse conversion for $1.1M+"
    ],
    "highlights": [
      "🏡 3 Units + Warehouse on one lot",
      "💰 Only $28,875 down with FHA",
      "📍 5 blocks from downtown Napa",
      "🍷 Wine country premium location",
      "💵 Live for $1,240/mo (vs $2,200 rent)",
      "🚀 Get PAID $1,260/mo after warehouse ADU",
      "📈 1,900% ROI over 5 years",
      "🎯 Multiple income strategies available"
    ]
  }'::jsonb,
  '[
    {
      "name": "FHA 3.5% Down (Recommended)",
      "downPayment": 28875,
      "loanAmount": 796125,
      "rate": 6.75,
      "monthlyPayment": 5730,
      "cashFlow": -1240,
      "totalCashNeeded": 45375,
      "note": "Best for low cash buyers - Live almost free in Napa!"
    },
    {
      "name": "Conventional 5% Down",
      "downPayment": 41250,
      "loanAmount": 783750,
      "rate": 7.25,
      "monthlyPayment": 5544,
      "cashFlow": -1004,
      "totalCashNeeded": 57750
    },
    {
      "name": "Conventional 20% Down",
      "downPayment": 165000,
      "loanAmount": 660000,
      "rate": 7.0,
      "monthlyPayment": 4391,
      "cashFlow": 169,
      "totalCashNeeded": 181500,
      "note": "Positive cash flow from day 1"
    }
  ]'::jsonb,
  '{
    "totalRentalIncome": 2016000,
    "totalCashFlow": 378000,
    "principalPaydown": 796125,
    "propertyAppreciation": 1375000,
    "totalReturn": 2549125,
    "averageAnnualReturn": 84971,
    "totalROI": 8830,
    "equityAtYear30": 2200000,
    "assumptions": "5% appreciation, 3% rent growth, warehouse conversion in year 2",
    "yearByYear": {
      "year1": {"cashflow": -14880, "equity": 41375, "total": 26495},
      "year2": {"cashflow": 15120, "equity": 84250, "total": 99370, "note": "Warehouse ADU complete"},
      "year5": {"cashflow": 75600, "equity": 236875, "total": 312475},
      "year10": {"cashflow": 189000, "equity": 538750, "total": 727750},
      "year30": {"cashflow": 378000, "equity": 2200000, "total": 2578000}
    }
  }'::jsonb,
  '{
    "walkScore": 85,
    "proximity": "5 blocks to downtown Napa",
    "nearbyEmployers": ["Wine industry", "Queen of the Valley Hospital", "Hospitality"],
    "publicTransit": "Vine Transit nearby",
    "schools": "Napa Valley USD - Great Schools Rating 7/10",
    "shopping": "Oxbow Public Market, First Street Napa",
    "appreciation": "5-7% annual historically",
    "marketTrends": "Limited supply, high demand, wine country premium",
    "demographics": {
      "medianIncome": 92000,
      "populationGrowth": "1.2% annually",
      "unemploymentRate": "3.8%",
      "rentalOccupancy": "97%"
    },
    "amenities": [
      "Downtown restaurants & cafes",
      "Wine tasting rooms",
      "Napa Valley Wine Train",
      "Napa River Trail",
      "Premium shopping & dining",
      "Cultural events & festivals"
    ]
  }'::jsonb,
  'This is a rare house hack opportunity in the heart of Napa Valley. With just $28,875 down using an FHA loan, you can control a property with three income-producing units plus a warehouse with massive potential. 

The strategy is simple: live in one studio while renting the main house and other studio for $5,600/month, covering most of your housing costs. Your net cost is only $1,240/month - cheaper than renting a studio in Napa!

The real opportunity lies in the warehouse conversion - add an ADU for $100k (financeable through HELOC after year 1) and you''ll actually GET PAID $1,260/month to live in downtown Napa. 

Additional income strategies include weekend Airbnb arbitrage ($300/night), wine country event hosting ($1,000+ per event), or commercial warehouse rental to winemakers ($1,500/month).

This property offers multiple exit strategies: long-term hold for $8,100/month income, condo conversion to sell 3 units separately, or develop into a luxury rental compound. 

Located just 5 blocks from downtown Napa with its restaurants, wine tasting rooms, and Oxbow Market, this property combines wine country lifestyle with serious wealth-building potential. 

The 5-year projection shows a total return of $550,000 on your initial $28,875 investment - a 1,900% ROI. This is the California dream made affordable!',
  'https://www.loopnet.com/Listing/850-Caymus-St-Napa-CA/37220526/',
  'LoopNet',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  property_data = EXCLUDED.property_data,
  updated_at = NOW();

-- Verify the insert
SELECT id, title, location, price, monthly_rent 
FROM public.properties 
WHERE id = 'napa-caymus-850';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Napa Wine Country property added successfully!';
  RAISE NOTICE '🏡 Property: 850 Caymus St, Napa, CA';
  RAISE NOTICE '💰 Price: $825,000 | Down: $28,875 (FHA 3.5%)';
  RAISE NOTICE '📊 Monthly Rent: $5,600 | Your Cost: $1,240/mo';
  RAISE NOTICE '🚀 After Warehouse: GET PAID $1,260/mo!';
  RAISE NOTICE '📈 5-Year ROI: 1,900%';
  RAISE NOTICE '';
  RAISE NOTICE '📸 Next: Add images via admin panel at /admin/properties';
END $$;