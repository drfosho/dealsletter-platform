// Client-side service for property analysis APIs

import { 
  PropertySearchRequest, 
  PropertyAnalysisRequest,
  RentCastPropertyDetails,
  RentCastRentalEstimate,
  RentCastSaleComps,
  RentCastMarketData
} from '@/types/rentcast';

export interface PropertySearchResponse {
  address: string;
  property: RentCastPropertyDetails;
  rental?: RentCastRentalEstimate;
  comparables?: RentCastSaleComps;
  market?: RentCastMarketData;
  timestamp: string;
}

export interface PropertyDetailsResponse {
  property: RentCastPropertyDetails;
  rental: RentCastRentalEstimate;
  comparables: RentCastSaleComps;
  market: RentCastMarketData;
  metrics: {
    pricePerSqFt?: number;
    rentToPriceRatio?: string;
    grossYield?: string;
    estimatedCapRate?: string;
    rentVsMarket?: string;
    priceVsMarket?: string;
  };
  timestamp: string;
}

export interface PropertyAnalysisResponse {
  address: string;
  strategy: string;
  propertyData: Record<string, unknown>;
  analysis: {
    summary: string;
    marketPosition: string;
    financialProjections: Record<string, unknown>;
    strategyAnalysis: {
      type: string;
      details: string;
    };
    riskAssessment: {
      factors: string[];
      details: string;
    };
    recommendation: string;
    fullAnalysis: string;
  };
  timestamp: string;
}

class PropertyAPIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  // Search for property by address
  async searchProperty(request: PropertySearchRequest): Promise<PropertySearchResponse> {
    console.log('[PropertyAPI] searchProperty called with:', request);
    try {
      console.log('[PropertyAPI] Making fetch request to /api/property/search...');
      const response = await fetch('/api/property/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log('[PropertyAPI] Response received:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Include details in the error message for better debugging
        const errorMessage = errorData.details
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || 'Failed to search property';
        console.error('[PropertyAPI] API error:', errorData);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[PropertyAPI] Response data:', data);
      return data;
    } catch (error) {
      console.error('[PropertyAPI] Error:', error);
      throw error;
    }
  }

  // Get detailed property information
  async getPropertyDetails(address: string): Promise<PropertyDetailsResponse> {
    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(`/api/property/details/${encodedAddress}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch property details');
      }

      return await response.json();
    } catch (error) {
      console.error('Property details error:', error);
      throw error;
    }
  }

  // Generate property analysis
  async generateAnalysis(request: PropertyAnalysisRequest): Promise<PropertyAnalysisResponse> {
    try {
      const response = await fetch('/api/analysis/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate analysis');
      }

      return await response.json();
    } catch (error) {
      console.error('Analysis generation error:', error);
      throw error;
    }
  }

  // Validate address format
  validateAddress(address: string): boolean {
    if (!address || address.length < 5 || address.length > 200) {
      return false;
    }
    
    // Basic address validation - should contain at least street and city/state
    const parts = address.split(',').map(p => p.trim());
    return parts.length >= 2 && parts.every(p => p.length > 0);
  }

  // Format address for display
  formatAddress(property: RentCastPropertyDetails): string {
    const parts = [
      property.addressLine1,
      property.addressLine2,
      `${property.city}, ${property.state} ${property.zipCode}`
    ].filter(Boolean);
    
    return parts.join(', ');
  }

  // Calculate mortgage payment
  calculateMortgage(
    principal: number, 
    interestRate: number, 
    termYears: number
  ): number {
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = termYears * 12;
    
    if (monthlyRate === 0) {
      return principal / numPayments;
    }
    
    const payment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return Math.round(payment);
  }

  // Calculate cash flow
  calculateCashFlow(
    monthlyRent: number,
    mortgage: number,
    expenses: number
  ): number {
    return monthlyRent - mortgage - expenses;
  }

  // Calculate cap rate
  calculateCapRate(
    noi: number,
    propertyValue: number
  ): number {
    if (propertyValue === 0) return 0;
    return (noi / propertyValue) * 100;
  }

  // Calculate cash on cash return
  calculateCashOnCash(
    annualCashFlow: number,
    totalCashInvested: number
  ): number {
    if (totalCashInvested === 0) return 0;
    return (annualCashFlow / totalCashInvested) * 100;
  }
}

// Export singleton instance
export const propertyAPI = new PropertyAPIService();