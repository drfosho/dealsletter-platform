import { createClient } from '@/lib/supabase/server';
import { staticDeals } from './staticDeals';

// Store status overrides for static deals in localStorage (persists across page reloads)
// This is a client-side solution for demo purposes
const getStaticDealStatusOverrides = (): Map<string, string> => {
  const overrides = new Map<string, string>();
  
  // Only use localStorage in browser environment
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('staticDealStatusOverrides');
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.entries(parsed).forEach(([id, status]) => {
          overrides.set(id, status as string);
        });
      }
    } catch (error) {
      console.error('Error loading status overrides from localStorage:', error);
    }
  }
  
  return overrides;
};

const saveStaticDealStatusOverrides = (overrides: Map<string, string>) => {
  if (typeof window !== 'undefined') {
    try {
      const obj = Object.fromEntries(overrides);
      localStorage.setItem('staticDealStatusOverrides', JSON.stringify(obj));
    } catch (error) {
      console.error('Error saving status overrides to localStorage:', error);
    }
  }
};

// Get published properties from Supabase
export async function getPublishedProperties() {
  try {
    const supabase = await createClient();
    
    // Get all non-draft, non-deleted properties
    const { data: dbProperties, error } = await supabase
      .from('properties')
      .select('*')
      .eq('is_draft', false)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching properties from Supabase:', error);
      // Apply status overrides to static deals
      const overrides = getStaticDealStatusOverrides();
      const dealsWithOverrides = staticDeals.map(deal => ({
        ...deal,
        status: overrides.get(String(deal.id)) || deal.status || 'active'
      }));
      return dealsWithOverrides;
    }

    // Apply status overrides to static deals
    const overrides = getStaticDealStatusOverrides();
    const dbPropertyIds = new Set(dbProperties?.map(p => p.id) || []);
    const uniqueStaticDeals = staticDeals
      .filter(deal => !dbPropertyIds.has(deal.id))
      .map(deal => ({
        ...deal,
        status: overrides.get(String(deal.id)) || deal.status || 'active'
      }));
    
    return [...(dbProperties || []), ...uniqueStaticDeals];
  } catch (error) {
    console.error('Error in getPublishedProperties:', error);
    // Apply status overrides to static deals
    const overrides = getStaticDealStatusOverrides();
    const dealsWithOverrides = staticDeals.map(deal => ({
      ...deal,
      status: overrides.get(String(deal.id)) || deal.status || 'active'
    }));
    return dealsWithOverrides;
  }
}

// Get all properties (including drafts) - for admin
export async function getAllProperties() {
  try {
    const supabase = await createClient();
    
    // Get all non-deleted properties
    const { data: dbProperties, error } = await supabase
      .from('properties')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all properties from Supabase:', error);
      // Apply status overrides to static deals
      const overrides = getStaticDealStatusOverrides();
      const dealsWithOverrides = staticDeals.map(deal => ({
        ...deal,
        status: overrides.get(String(deal.id)) || deal.status || 'active'
      }));
      return dealsWithOverrides;
    }

    // Apply status overrides to static deals
    const overrides = getStaticDealStatusOverrides();
    const dbPropertyIds = new Set(dbProperties?.map(p => p.id) || []);
    const uniqueStaticDeals = staticDeals
      .filter(deal => !dbPropertyIds.has(deal.id))
      .map(deal => ({
        ...deal,
        status: overrides.get(String(deal.id)) || deal.status || 'active'
      }));
    
    return [...(dbProperties || []), ...uniqueStaticDeals];
  } catch (error) {
    console.error('Error in getAllProperties:', error);
    // Apply status overrides to static deals
    const overrides = getStaticDealStatusOverrides();
    const dealsWithOverrides = staticDeals.map(deal => ({
      ...deal,
      status: overrides.get(String(deal.id)) || deal.status || 'active'
    }));
    return dealsWithOverrides;
  }
}

// Get property by ID
export async function getPropertyById(id: string) {
  try {
    const supabase = await createClient();
    
    // First try to get from database
    const { data: property, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (!error && property) {
      return property;
    }

    // If not found in database, check static deals
    return staticDeals.find(p => String(p.id) === String(id));
  } catch (error) {
    console.error('Error fetching property by ID:', error);
    // Fallback to static deals
    return staticDeals.find(p => String(p.id) === String(id));
  }
}

// Define allowed columns in the properties table
const ALLOWED_COLUMNS = [
  // Basic fields
  'id', 'title', 'type', 'price', 'monthly_rent', 'location', 'address',
  'bedrooms', 'bathrooms', 'square_feet', 'lot_size', 'year_built',
  'property_type', 'status', 'is_draft', 'is_deleted', 'images', 'description',
  'features', 'coordinates', 'url', 'source', 'listing_date',
  
  // Financial fields
  'cap_rate', 'cash_flow', 'roi', 'total_return', 'arv', 'avm',
  'city', 'state', 'zip_code', 'strategy', 'investment_strategy',
  'down_payment', 'down_payment_percent', 'monthly_cash_flow',
  'total_roi', 'cash_on_cash_return', 'rehab_costs', 'current_cap_rate',
  'pro_forma_cap_rate', 'confidence', 'risk_level', 'days_on_market',
  'listing_url', 'listing_source', 'units', 'estimated_rehab',
  'total_investment', 'expected_profit', 'interest_rate', 'loan_term',
  'monthly_pi', 'closing_costs', 'property_taxes', 'insurance',
  'hoa_fees', 'utilities', 'maintenance', 'property_management',
  'vacancy_rate', 'capital_expenditures', 'current_rent', 'projected_rent',
  'rent_upside', 'cash_required', 'neighborhood', 'neighborhood_class',
  'walk_score', 'crime_rate', 'pro_forma_cash_flow', 'timeframe',
  
  // Text fields
  'strategic_overview', 'value_add_description', 'executive_summary',
  'investment_thesis', 'exit_strategy',
  
  // JSONB fields
  'financing_scenarios', 'thirty_year_projections', 'location_analysis',
  'property_data', 'rent_analysis', 'market_analysis', 'rehab_analysis',
  'property_metrics', 'risk_assessment', 'value_add_opportunities',
  'recommended_actions', 'rehab_details', 'schools',
  
  // System fields
  'created_at', 'updated_at', 'created_by'
];

// Create a new property
export async function createProperty(property: Record<string, unknown>) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Generate a unique ID if not provided
    const propertyId = property.id || `prop_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    
    // Map common field names that might be different
    const mappedProperty: Record<string, unknown> = {
      ...property,
      // Ensure consistent field naming - map camelCase to snake_case
      zip_code: property.zipCode || property.zip_code,
      listing_url: property.listingUrl || property.listing_url,
      listing_source: property.listingSource || property.listing_source,
      down_payment: property.downPayment || property.down_payment,
      down_payment_percent: property.downPaymentPercent || property.down_payment_percent,
      monthly_cash_flow: property.monthlyCashFlow || property.monthly_cash_flow,
      total_roi: property.totalROI || property.total_roi,
      cash_on_cash_return: property.cashOnCashReturn || property.cash_on_cash_return,
      rehab_costs: property.rehabCosts || property.rehab_costs,
      cap_rate: property.capRate || property.cap_rate,  // Fixed: map capRate to cap_rate
      current_cap_rate: property.currentCapRate || property.current_cap_rate,
      pro_forma_cap_rate: property.proFormaCapRate || property.pro_forma_cap_rate,
      investment_strategy: property.investmentStrategy || property.investment_strategy || property.strategy,
      risk_level: property.riskLevel || property.risk_level,
      days_on_market: property.daysOnMarket || property.days_on_market,
      value_add_description: property.valueAddDescription || property.value_add_description,
      rent_analysis: property.rentAnalysis || property.rent_analysis,
      market_analysis: property.marketAnalysis || property.market_analysis,
      rehab_analysis: property.rehabAnalysis || property.rehab_analysis,
      property_metrics: property.propertyMetrics || property.property_metrics,
      property_type: property.propertyType || property.property_type,
      square_feet: property.sqft || property.squareFeet || property.square_feet,
      year_built: property.yearBuilt || property.year_built,
      monthly_rent: property.monthlyRent || property.monthly_rent,
      estimated_rehab: property.estimatedRehab || property.estimated_rehab,
      total_investment: property.totalInvestment || property.total_investment,
      expected_profit: property.expectedProfit || property.expected_profit,
      interest_rate: property.interestRate || property.interest_rate,
      loan_term: property.loanTerm || property.loan_term,
      monthly_pi: property.monthlyPI || property.monthly_pi,
      closing_costs: property.closingCosts || property.closing_costs,
      property_taxes: property.propertyTaxes || property.property_taxes,
      hoa_fees: property.hoaFees || property.hoa_fees || property.hoa,
      property_management: property.propertyManagement || property.property_management,
      vacancy_rate: property.vacancyRate || property.vacancy_rate || property.vacancy,
      capital_expenditures: property.capitalExpenditures || property.capital_expenditures,
      executive_summary: property.executiveSummary || property.executive_summary,
      investment_thesis: property.investmentThesis || property.investment_thesis,
      risk_assessment: property.riskAssessment || property.risk_assessment,
      value_add_opportunities: property.valueAddOpportunities || property.value_add_opportunities,
      exit_strategy: property.exitStrategy || property.exit_strategy,
      recommended_actions: property.recommendedActions || property.recommended_actions,
      rehab_details: property.rehabDetails || property.rehab_details,
      current_rent: property.currentRent || property.current_rent,
      projected_rent: property.projectedRent || property.projected_rent,
      rent_upside: property.rentUpside || property.rent_upside,
      cash_required: property.cashRequired || property.cash_required,
      neighborhood_class: property.neighborhoodClass || property.neighborhood_class,
      walk_score: property.walkScore || property.walk_score,
      crime_rate: property.crimeRate || property.crime_rate,
      pro_forma_cash_flow: property.proFormaCashFlow || property.pro_forma_cash_flow,
      // Fix timestamp fields
      created_at: property.createdAt || property.created_at || new Date().toISOString(),
      updated_at: property.updatedAt || property.updated_at || new Date().toISOString(),
      // Fix boolean fields
      is_draft: property.isDraft !== undefined ? property.isDraft : property.is_draft,
      is_deleted: property.isDeleted !== undefined ? property.isDeleted : property.is_deleted || false,
    };
    
    // Remove all camelCase duplicates to avoid conflicts
    const camelCaseFields = [
      'zipCode', 'listingUrl', 'listingSource', 'downPayment', 'downPaymentPercent',
      'monthlyCashFlow', 'totalROI', 'cashOnCashReturn', 'rehabCosts', 'capRate',
      'currentCapRate', 'proFormaCapRate', 'investmentStrategy', 'riskLevel',
      'daysOnMarket', 'valueAddDescription', 'rentAnalysis', 'marketAnalysis',
      'rehabAnalysis', 'propertyMetrics', 'propertyType', 'sqft', 'squareFeet',
      'yearBuilt', 'monthlyRent', 'estimatedRehab', 'totalInvestment',
      'expectedProfit', 'interestRate', 'loanTerm', 'monthlyPI', 'closingCosts',
      'propertyTaxes', 'hoaFees', 'hoa', 'propertyManagement', 'vacancyRate',
      'capitalExpenditures', 'executiveSummary', 'investmentThesis',
      'riskAssessment', 'valueAddOpportunities', 'exitStrategy',
      'recommendedActions', 'rehabDetails', 'currentRent', 'projectedRent',
      'rentUpside', 'cashRequired', 'neighborhoodClass', 'walkScore',
      'crimeRate', 'proFormaCashFlow', 'createdAt', 'updatedAt', 'isDraft', 'isDeleted'
    ];
    
    // Delete all camelCase fields to prevent database conflicts
    camelCaseFields.forEach(field => {
      delete mappedProperty[field];
    });
    
    // Filter to only include allowed columns
    const filteredProperty: Record<string, unknown> = {
      id: propertyId,
      created_by: user?.id || null,
    };
    
    // Only include fields that exist in ALLOWED_COLUMNS
    Object.keys(mappedProperty).forEach(key => {
      if (ALLOWED_COLUMNS.includes(key)) {
        filteredProperty[key] = mappedProperty[key];
      } else {
        console.log(`Skipping unknown field: ${key}`);
        // Store unknown fields in property_data JSONB column
        if (!filteredProperty.property_data) {
          filteredProperty.property_data = {};
        }
        (filteredProperty.property_data as any)[key] = mappedProperty[key];
      }
    });

    console.log('Creating property with filtered fields:', Object.keys(filteredProperty));

    const { data, error } = await supabase
      .from('properties')
      .insert([filteredProperty])
      .select()
      .single();

    if (error) {
      console.error('Error creating property:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createProperty:', error);
    throw error;
  }
}

// Update a property
export async function updateProperty(id: string | number, updates: Record<string, unknown>) {
  try {
    // Convert ID to string for consistency
    const propertyId = String(id);
    
    // Check if this is a static deal
    const isStaticDeal = staticDeals.some(deal => String(deal.id) === propertyId);
    if (isStaticDeal) {
      console.log(`Property ${propertyId} is a static deal. Storing status override.`);
      
      // Store the status override for static deals
      if ('status' in updates) {
        const overrides = getStaticDealStatusOverrides();
        overrides.set(propertyId, updates.status as string);
        saveStaticDealStatusOverrides(overrides);
        console.log(`Stored status override for static deal ${propertyId}: ${updates.status}`);
      }
      
      // Return the updated static deal
      const staticDeal = staticDeals.find(deal => String(deal.id) === propertyId);
      return { 
        ...staticDeal,
        ...updates,
        status: updates.status || staticDeal?.status || 'active',
        _warning: 'Static deal - status changes are stored locally'
      };
    }
    
    const supabase = await createClient();
    
    // Map common field names that might be different
    const mappedUpdates: Record<string, unknown> = {
      ...updates,
      id: id, // Ensure ID is preserved
    };
    
    // Convert camelCase to snake_case for database columns
    if ('capRate' in mappedUpdates) {
      mappedUpdates.cap_rate = mappedUpdates.capRate;
    }
    if ('cashFlow' in mappedUpdates) {
      mappedUpdates.cash_flow = mappedUpdates.cashFlow;
    }
    if ('totalROI' in mappedUpdates) {
      mappedUpdates.total_roi = mappedUpdates.totalROI;
    }
    if ('monthlyCashFlow' in mappedUpdates) {
      mappedUpdates.monthly_cash_flow = mappedUpdates.monthlyCashFlow;
    }
    if ('downPayment' in mappedUpdates) {
      mappedUpdates.down_payment = mappedUpdates.downPayment;
    }
    if ('downPaymentPercent' in mappedUpdates) {
      mappedUpdates.down_payment_percent = mappedUpdates.downPaymentPercent;
    }
    if ('propertyType' in mappedUpdates) {
      mappedUpdates.property_type = mappedUpdates.propertyType;
    }
    if ('sqft' in mappedUpdates) {
      mappedUpdates.square_feet = mappedUpdates.sqft;
    }
    if ('yearBuilt' in mappedUpdates) {
      mappedUpdates.year_built = mappedUpdates.yearBuilt;
    }
    if ('monthlyRent' in mappedUpdates) {
      mappedUpdates.monthly_rent = mappedUpdates.monthlyRent;
    }
    if ('investmentStrategy' in mappedUpdates) {
      mappedUpdates.investment_strategy = mappedUpdates.investmentStrategy;
    }
    if ('riskLevel' in mappedUpdates) {
      mappedUpdates.risk_level = mappedUpdates.riskLevel;
    }
    if ('daysOnMarket' in mappedUpdates) {
      mappedUpdates.days_on_market = mappedUpdates.daysOnMarket;
    }
    
    // Remove all camelCase duplicates to avoid conflicts
    const camelCaseFields = [
      'zipCode', 'listingUrl', 'listingSource', 'downPayment', 'downPaymentPercent',
      'monthlyCashFlow', 'totalROI', 'cashOnCashReturn', 'rehabCosts', 'capRate',
      'currentCapRate', 'proFormaCapRate', 'investmentStrategy', 'riskLevel',
      'daysOnMarket', 'valueAddDescription', 'rentAnalysis', 'marketAnalysis',
      'rehabAnalysis', 'propertyMetrics', 'propertyType', 'sqft', 'squareFeet',
      'yearBuilt', 'monthlyRent', 'estimatedRehab', 'totalInvestment',
      'expectedProfit', 'interestRate', 'loanTerm', 'monthlyPI', 'closingCosts',
      'propertyTaxes', 'hoaFees', 'hoa', 'propertyManagement', 'vacancyRate',
      'capitalExpenditures', 'executiveSummary', 'investmentThesis',
      'riskAssessment', 'valueAddOpportunities', 'exitStrategy',
      'recommendedActions', 'rehabDetails', 'currentRent', 'projectedRent',
      'rentUpside', 'cashRequired', 'neighborhoodClass', 'walkScore',
      'crimeRate', 'proFormaCashFlow', 'createdAt', 'updatedAt', 'isDraft', 'isDeleted'
    ];
    
    // Delete all camelCase fields to prevent database conflicts
    camelCaseFields.forEach(field => {
      delete mappedUpdates[field];
    });
    
    // Filter to only include allowed columns
    const filteredUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };
    
    // Only include fields that exist in ALLOWED_COLUMNS
    Object.keys(mappedUpdates).forEach(key => {
      if (ALLOWED_COLUMNS.includes(key)) {
        filteredUpdates[key] = mappedUpdates[key];
      } else if (key !== 'id') {
        console.log(`Skipping unknown field in update: ${key}`);
        // Store unknown fields in property_data JSONB column
        if (!filteredUpdates.property_data) {
          filteredUpdates.property_data = {};
        }
        (filteredUpdates.property_data as any)[key] = mappedUpdates[key];
      }
    });
    
    console.log('Updating property with filtered fields:', Object.keys(filteredUpdates));
    
    const { data, error } = await supabase
      .from('properties')
      .update(filteredUpdates)
      .eq('id', propertyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating property:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateProperty:', error);
    throw error;
  }
}

// Delete a property (soft delete for database, error for static)
export async function deleteProperty(id: string) {
  try {
    // First check if it's a static deal that cannot be deleted
    const isStaticDeal = staticDeals.some(deal => String(deal.id) === String(id));
    if (isStaticDeal) {
      console.log('Attempted to delete static deal:', id);
      throw new Error('Static properties cannot be deleted. They are hardcoded in the dashboard.');
    }
    
    const supabase = await createClient();
    
    // Check if property exists in database
    const { data: existingProperty, error: fetchError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      // If table doesn't exist
      if (fetchError.message?.includes('relation') && fetchError.message?.includes('does not exist')) {
        console.log('Properties table does not exist. Property might be static.');
        throw new Error('Cannot delete this property. Database table not configured.');
      }
      // Property not found in database
      console.log('Property not found in database:', id);
      return false;
    }
    
    if (!existingProperty) {
      console.log('Property not found:', id);
      return false;
    }
    
    // Soft delete by setting is_deleted to true
    const { data, error } = await supabase
      .from('properties')
      .update({
        is_deleted: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error deleting property:', error);
      // Check if column exists
      if (error.message?.includes('is_deleted')) {
        console.error('Column is_deleted may not exist. Please run migration: supabase_properties_migration.sql');
        throw new Error('Database schema issue. The properties table needs migration.');
      }
      throw error;
    }

    console.log('Property deleted successfully:', data);
    return true;
  } catch (error) {
    console.error('Error in deleteProperty:', error);
    throw error;
  }
}