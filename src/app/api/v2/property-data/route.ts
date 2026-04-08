import { NextRequest, NextResponse } from 'next/server';
import { rentCastService } from '@/services/rentcast';

// Keywords that indicate distressed sales
const distressedKeywords = [
  'foreclosure', 'reo', 'bank owned',
  'bank-owned', 'short sale', 'shortsale',
  'as-is', 'as is', 'distressed',
  'auction', 'trustee',
];

function isDistressed(comp: any): boolean {
  const text = [
    comp.remarks, comp.description,
    comp.condition, comp.listingType,
    comp.saleType, comp.status,
  ].filter(Boolean).join(' ').toLowerCase();

  return distressedKeywords.some(kw => text.includes(kw));
}

function calculateARVFromComps(
  comparables: any[],
  subjectSqft: number | null,
  avm: number | null
): {
  arvEstimate: number;
  arvLow: number;
  arvMid: number;
  arvHigh: number;
  compsUsed: number;
  confidence: 'high' | 'medium' | 'low';
  pricePerSqft: number;
  pricePerSqftRange: { low: number; high: number };
  avm: number | null;
  note: string;
  distressedExcluded: number;
} | null {
  if (!comparables || comparables.length === 0) return null;

  const now = new Date();
  const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const eighteenMonthsAgo = new Date(now.getTime() - 548 * 24 * 60 * 60 * 1000);

  // Filter to comps with price and sqft
  const validComps = comparables.filter(
    (c) => c.price && c.squareFootage && c.squareFootage > 0
  );

  if (validComps.length === 0) return null;

  // Separate distressed from clean comps
  const cleanComps = validComps.filter((c) => !isDistressed(c));
  const distressedCount = validComps.length - cleanComps.length;

  // Use clean comps, fall back to all if not enough clean ones
  const workingComps = cleanComps.length >= 2 ? cleanComps : validComps;

  // Filter by recency — prefer 12 months, fall back to 18 months
  const recentComps = workingComps.filter((c) => {
    if (!c.soldDate && !c.lastSaleDate) return false;
    const saleDate = new Date(c.soldDate || c.lastSaleDate);
    return saleDate >= twelveMonthsAgo;
  });

  const extendedComps = workingComps.filter((c) => {
    if (!c.soldDate && !c.lastSaleDate) return false;
    const saleDate = new Date(c.soldDate || c.lastSaleDate);
    return saleDate >= eighteenMonthsAgo;
  });

  // Pick the best set of comps
  let selectedComps = workingComps;
  let recencyLabel = 'all available';

  if (recentComps.length >= 3) {
    selectedComps = recentComps.slice(0, 6);
    recencyLabel = 'last 12 months';
  } else if (extendedComps.length >= 2) {
    selectedComps = extendedComps.slice(0, 6);
    recencyLabel = 'last 18 months';
  } else {
    selectedComps = workingComps.slice(0, 6);
  }

  // Calculate price per sqft for each comp
  const ppsf = selectedComps
    .map((c) => c.price / c.squareFootage)
    .filter((v) => v > 0 && v < 5000)
    .sort((a, b) => a - b);

  if (ppsf.length === 0) return null;

  // Remove outliers if enough comps
  let trimmedPpsf = ppsf;
  if (ppsf.length >= 5) {
    trimmedPpsf = ppsf.slice(1, -1);
  } else if (ppsf.length >= 4) {
    trimmedPpsf = ppsf.slice(0, -1);
  }

  // Calculate stats
  const avgPpsf = trimmedPpsf.reduce((a, b) => a + b, 0) / trimmedPpsf.length;
  const lowPpsf = trimmedPpsf[0];
  const highPpsf = trimmedPpsf[trimmedPpsf.length - 1];

  // Calculate variance for confidence
  const variance = highPpsf - lowPpsf;
  const variancePct = variance / avgPpsf;

  // Use subject sqft or avg comp sqft
  const sqft =
    subjectSqft ||
    selectedComps.reduce((a, c) => a + c.squareFootage, 0) / selectedComps.length;

  // Calculate ARV range
  const arvMid = Math.round(avgPpsf * sqft);
  const arvLow = Math.round(lowPpsf * sqft);
  const arvHigh = Math.round(highPpsf * sqft);

  // Confidence scoring
  let confidence: 'high' | 'medium' | 'low';
  if (
    selectedComps.length >= 4 &&
    recencyLabel === 'last 12 months' &&
    variancePct < 0.25 &&
    cleanComps.length >= 3
  ) {
    confidence = 'high';
  } else if (selectedComps.length >= 2 && variancePct < 0.4) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  // Build note
  const distressedNote =
    distressedCount > 0 ? ` (${distressedCount} distressed excluded)` : '';

  const note =
    `Based on ${selectedComps.length} comparable sales, ${recencyLabel}${distressedNote}`;

  return {
    arvEstimate: arvMid,
    arvLow,
    arvMid,
    arvHigh,
    compsUsed: selectedComps.length,
    confidence,
    pricePerSqft: Math.round(avgPpsf),
    pricePerSqftRange: {
      low: Math.round(lowPpsf),
      high: Math.round(highPpsf),
    },
    avm,
    note,
    distressedExcluded: distressedCount,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    console.log('[V2 Property Data] Fetching for:', address);

    const data = await rentCastService.getComprehensivePropertyData(address);

    // Calculate comp-based ARV
    const subjectSqft = data?.property?.squareFootage || null;

    const avmValue =
      (data?.comparables as any)?.value ||
      (data?.comparables as any)?.price ||
      null;

    const arvResult = calculateARVFromComps(
      (data?.comparables as any)?.comparables || [],
      subjectSqft,
      avmValue
    );

    return NextResponse.json({
      ...data,
      arvAnalysis: arvResult
        ? {
            arvEstimate: arvResult.arvEstimate,
            arvLow: arvResult.arvLow,
            arvMid: arvResult.arvMid,
            arvHigh: arvResult.arvHigh,
            compsUsed: arvResult.compsUsed,
            confidence: arvResult.confidence,
            pricePerSqft: arvResult.pricePerSqft,
            pricePerSqftRange: arvResult.pricePerSqftRange,
            avm: arvResult.avm,
            note: arvResult.note,
            distressedExcluded: arvResult.distressedExcluded,
          }
        : null,
    });
  } catch (error) {
    console.error('[V2 Property Data] Error:', error);
    return NextResponse.json(
      { error: 'Property data unavailable', fallback: true },
      { status: 200 }
    );
  }
}
