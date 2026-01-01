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
    // Note: similarity field may not always be provided by RentCast
    const validComps = comparables.filter(comp =>
      comp.price && comp.price > 50000 &&
      comp.squareFootage && comp.squareFootage > 0
      // Removed similarity filter - not always provided
    );

    console.log('[ARV Calculator] Comparables filter:', {
      totalComps: comparables.length,
      validComps: validComps.length,
      sampleComp: validComps[0] ? {
        price: validComps[0].price,
        sqft: validComps[0].squareFootage,
        similarity: validComps[0].similarity
      } : 'none'
    });

    if (validComps.length >= 2) {
      // Sort by similarity (highest first) if available, otherwise by distance
      const topComps = [...validComps]
        .sort((a, b) => {
          // Prefer similarity if available
          if (a.similarity !== undefined && b.similarity !== undefined) {
            return (b.similarity || 0) - (a.similarity || 0);
          }
          // Otherwise sort by distance (closer is better)
          return (a.distance || 999) - (b.distance || 999);
        })
        .slice(0, 5);

      // Calculate weighted average price per square foot
      let totalWeight = 0;
      let weightedPricePerSqFt = 0;

      for (const comp of topComps) {
        const pricePerSqFt = comp.price! / comp.squareFootage!;
        // Use similarity as weight if available, otherwise use 1
        const weight = comp.similarity !== undefined ? comp.similarity : 1;
        weightedPricePerSqFt += pricePerSqFt * weight;
        totalWeight += weight;
      }

      const avgPricePerSqFt = totalWeight > 0 ? weightedPricePerSqFt / totalWeight : 0;

      if (avgPricePerSqFt > 0) {
        // Calculate base ARV from comparable price per sqft
        const baseARV = avgPricePerSqFt * subjectPropertySqFt;

        // Apply renovation premium to get ARV
        let arv = Math.round(baseARV * (1 + renovationPremium));

        // CRITICAL: ARV must be at least 10% higher than purchase price for flips
        if (purchasePrice > 0 && arv < purchasePrice * 1.1) {
          console.log('[ARV Calculator] WARNING: Calculated ARV too low, adjusting to minimum');
          arv = Math.round(purchasePrice * (1.1 + renovationPremium));
        }

        console.log('[ARV Calculator] Calculated from comparables:', {
          comparablesUsed: topComps.length,
          avgPricePerSqFt,
          subjectPropertySqFt,
          baseARV,
          renovationPremium,
          purchasePrice,
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
  // But ARV should be based on purchase price, not AVM (AVM can be misleading)
  if (purchasePrice > 0) {
    // Strategy-specific multipliers based on renovation level
    let multiplier: number;

    if (strategy === 'brrrr') {
      // BRRRR: more conservative, ARV should reflect true market value after rehab
      switch (renovationLevel) {
        case 'cosmetic': multiplier = 1.10; break;
        case 'moderate': multiplier = 1.15; break;
        case 'extensive': multiplier = 1.22; break;
        case 'gut': multiplier = 1.30; break;
        default: multiplier = 1.15;
      }
    } else {
      // Flip: ARV should be achievable sale price after renovation
      switch (renovationLevel) {
        case 'cosmetic': multiplier = 1.12; break;
        case 'moderate': multiplier = 1.18; break;
        case 'extensive': multiplier = 1.25; break;
        case 'gut': multiplier = 1.35; break;
        default: multiplier = 1.18;
      }
    }

    let arv = Math.round(purchasePrice * multiplier);

    // If we have AVM and it's higher than purchase price, use it to validate ARV
    if (avmValue && avmValue > purchasePrice) {
      // AVM is higher than purchase price - good deal indicator
      // ARV should be between purchase price and AVM after renovation
      const avmBasedARV = Math.round(avmValue * (1 + renovationPremium * 0.5));
      // Use the higher of the two calculations, capped at 110% of AVM
      arv = Math.max(arv, Math.min(avmBasedARV, Math.round(avmValue * 1.1)));
    }

    console.log('[ARV Calculator] Calculated from purchase price:', {
      purchasePrice,
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
        renovationPremium: arv - purchasePrice
      }
    };
  }

  // If no purchase price but we have AVM, use it as reference
  if (avmValue && avmValue > 0) {
    let multiplier: number;

    if (strategy === 'brrrr') {
      switch (renovationLevel) {
        case 'cosmetic': multiplier = 1.08; break;
        case 'moderate': multiplier = 1.12; break;
        case 'extensive': multiplier = 1.18; break;
        case 'gut': multiplier = 1.25; break;
        default: multiplier = 1.12;
      }
    } else {
      switch (renovationLevel) {
        case 'cosmetic': multiplier = 1.10; break;
        case 'moderate': multiplier = 1.15; break;
        case 'extensive': multiplier = 1.22; break;
        case 'gut': multiplier = 1.30; break;
        default: multiplier = 1.15;
      }
    }

    const arv = Math.round(avmValue * multiplier);

    console.log('[ARV Calculator] Calculated from AVM (no purchase price):', {
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
