/**
 * ARV (After Repair Value) Calculator
 * Calculates ARV using comparable sales data
 */

import { RentCastComparable } from '@/types/rentcast';

export interface ARVCalculationResult {
  arv: number;
  method: 'comparables' | 'multiplier' | 'manual';
  confidence: 'high' | 'medium' | 'low';
  details: {
    pricePerSqFt: number;
    comparablesUsed: number;
    adjustmentApplied: number;
    renovationPremium: number;
  };
}

interface ARVCalculationInput {
  subjectPropertySqFt: number;
  purchasePrice: number;
  comparables?: RentCastComparable[];
  avmValue?: number;
  renovationLevel: 'cosmetic' | 'moderate' | 'extensive' | 'gut';
  strategy: 'flip' | 'brrrr';
}

/**
 * Calculate ARV using comparable sales data
 * This provides a more accurate estimate than simple multipliers
 */
export function calculateARVFromComparables(input: ARVCalculationInput): ARVCalculationResult {
  const {
    subjectPropertySqFt,
    purchasePrice,
    comparables,
    avmValue,
    renovationLevel,
    strategy
  } = input;

  // Renovation premiums based on level (premium added to comparable sales prices)
  // These represent typical value increase from renovations
  const renovationPremiums: Record<string, number> = {
    cosmetic: 0.08,    // 8% premium for cosmetic updates
    moderate: 0.15,    // 15% premium for moderate renovations
    extensive: 0.22,   // 22% premium for extensive renovations
    gut: 0.30          // 30% premium for gut renovations
  };

  const renovationPremium = renovationPremiums[renovationLevel] || 0.15;

  // Try to calculate from comparables first
  if (comparables && comparables.length > 0 && subjectPropertySqFt > 0) {
    // Filter for valid comparables with prices
    const validComps = comparables.filter(comp =>
      comp.price && comp.price > 50000 &&
      comp.squareFootage && comp.squareFootage > 0 &&
      comp.similarity && comp.similarity > 0.5 // High similarity comps
    );

    if (validComps.length >= 2) {
      // Sort by similarity (highest first) and take top 5
      const topComps = [...validComps]
        .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
        .slice(0, 5);

      // Calculate weighted average price per square foot
      // Weight by similarity score
      let totalWeight = 0;
      let weightedPricePerSqFt = 0;

      for (const comp of topComps) {
        const pricePerSqFt = comp.price! / comp.squareFootage!;
        const weight = comp.similarity || 0.5;
        weightedPricePerSqFt += pricePerSqFt * weight;
        totalWeight += weight;
      }

      const avgPricePerSqFt = totalWeight > 0 ? weightedPricePerSqFt / totalWeight : 0;

      if (avgPricePerSqFt > 0) {
        // Calculate base ARV from comparable price per sqft
        const baseARV = avgPricePerSqFt * subjectPropertySqFt;

        // Apply renovation premium to get ARV
        const arv = Math.round(baseARV * (1 + renovationPremium));

        console.log('[ARV Calculator] Calculated from comparables:', {
          comparablesUsed: topComps.length,
          avgPricePerSqFt,
          subjectPropertySqFt,
          baseARV,
          renovationPremium,
          arv
        });

        return {
          arv,
          method: 'comparables',
          confidence: topComps.length >= 4 ? 'high' : topComps.length >= 2 ? 'medium' : 'low',
          details: {
            pricePerSqFt: avgPricePerSqFt,
            comparablesUsed: topComps.length,
            adjustmentApplied: renovationPremium,
            renovationPremium: arv - baseARV
          }
        };
      }
    }
  }

  // Fallback to AVM + renovation multiplier
  if (avmValue && avmValue > 0) {
    // Strategy-specific multipliers (more conservative than pure renovation premium)
    let multiplier: number;

    if (strategy === 'brrrr') {
      // BRRRR: more conservative, ARV should reflect true market value after rehab
      switch (renovationLevel) {
        case 'cosmetic': multiplier = 1.08; break;
        case 'moderate': multiplier = 1.12; break;
        case 'extensive': multiplier = 1.18; break;
        case 'gut': multiplier = 1.25; break;
        default: multiplier = 1.12;
      }
    } else {
      // Flip: ARV should be achievable sale price after renovation
      switch (renovationLevel) {
        case 'cosmetic': multiplier = 1.12; break;
        case 'moderate': multiplier = 1.18; break;
        case 'extensive': multiplier = 1.25; break;
        case 'gut': multiplier = 1.32; break;
        default: multiplier = 1.18;
      }
    }

    const arv = Math.round(avmValue * multiplier);

    console.log('[ARV Calculator] Calculated from AVM:', {
      avmValue,
      strategy,
      renovationLevel,
      multiplier,
      arv
    });

    return {
      arv,
      method: 'multiplier',
      confidence: 'low',
      details: {
        pricePerSqFt: subjectPropertySqFt > 0 ? arv / subjectPropertySqFt : 0,
        comparablesUsed: 0,
        adjustmentApplied: multiplier - 1,
        renovationPremium: arv - avmValue
      }
    };
  }

  // Last resort: use purchase price with multiplier
  if (purchasePrice > 0) {
    const multiplier = strategy === 'brrrr' ? 1.15 : 1.20;
    const arv = Math.round(purchasePrice * multiplier * (1 + renovationPremium));

    console.log('[ARV Calculator] Calculated from purchase price:', {
      purchasePrice,
      multiplier,
      renovationPremium,
      arv
    });

    return {
      arv,
      method: 'multiplier',
      confidence: 'low',
      details: {
        pricePerSqFt: subjectPropertySqFt > 0 ? arv / subjectPropertySqFt : 0,
        comparablesUsed: 0,
        adjustmentApplied: multiplier - 1 + renovationPremium,
        renovationPremium: arv - purchasePrice
      }
    };
  }

  // Return 0 if we can't calculate
  return {
    arv: 0,
    method: 'manual',
    confidence: 'low',
    details: {
      pricePerSqFt: 0,
      comparablesUsed: 0,
      adjustmentApplied: 0,
      renovationPremium: 0
    }
  };
}

/**
 * Get comparable properties from RentCast data
 */
export function extractComparableProperties(propertyData: Record<string, unknown>): RentCastComparable[] {
  const comparables = (propertyData as any)?.comparables;

  if (!comparables) return [];

  // RentCast may return comparables in different structures
  if (Array.isArray(comparables)) {
    return comparables;
  }

  if (comparables.comparables && Array.isArray(comparables.comparables)) {
    return comparables.comparables;
  }

  return [];
}

/**
 * Format ARV calculation result for display
 */
export function formatARVDetails(result: ARVCalculationResult): string {
  if (result.method === 'comparables') {
    return `Based on ${result.details.comparablesUsed} comparable sales at $${result.details.pricePerSqFt.toFixed(0)}/sqft, plus ${(result.details.adjustmentApplied * 100).toFixed(0)}% renovation premium`;
  } else if (result.method === 'multiplier') {
    return `Estimated using market data with ${(result.details.adjustmentApplied * 100).toFixed(0)}% renovation adjustment`;
  }
  return 'Manual estimate required';
}
