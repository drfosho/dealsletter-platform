import { NextRequest, NextResponse } from 'next/server';
import { rentCastService } from '@/services/rentcast';

function calculateARVFromComps(
  comparables: any[],
  subjectSqft: number | null
): { arv: number | null; compsUsed: number; confidence: string } {
  if (!comparables || comparables.length === 0) {
    return { arv: null, compsUsed: 0, confidence: 'low' };
  }

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const recentComps = comparables.filter((comp) => {
    const saleDate = new Date(comp.saleDate || comp.lastSaleDate || '');
    return saleDate > twelveMonthsAgo && comp.price && comp.squareFootage;
  });

  const compsToUse =
    recentComps.length >= 3
      ? recentComps.slice(0, 5)
      : comparables.filter((c) => c.price).slice(0, 5);

  if (compsToUse.length === 0) {
    return { arv: null, compsUsed: 0, confidence: 'low' };
  }

  const pricePerSqft = compsToUse
    .filter((c) => c.price && c.squareFootage)
    .map((c) => c.price / c.squareFootage);

  if (pricePerSqft.length === 0) {
    const avgPrice =
      compsToUse.reduce((sum, c) => sum + (c.price || 0), 0) /
      compsToUse.length;
    return {
      arv: Math.round(avgPrice),
      compsUsed: compsToUse.length,
      confidence: 'medium',
    };
  }

  const sorted = [...pricePerSqft].sort((a, b) => a - b);
  const trimmed = sorted.length >= 4 ? sorted.slice(1, -1) : sorted;
  const avgPricePerSqft =
    trimmed.reduce((sum, p) => sum + p, 0) / trimmed.length;

  const arv = subjectSqft
    ? Math.round(avgPricePerSqft * subjectSqft)
    : Math.round(
        avgPricePerSqft *
          (compsToUse.reduce((sum, c) => sum + (c.squareFootage || 0), 0) /
            compsToUse.length)
      );

  const confidence =
    recentComps.length >= 4
      ? 'high'
      : recentComps.length >= 2
        ? 'medium'
        : 'low';

  return { arv: Math.round(arv), compsUsed: compsToUse.length, confidence };
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
    const subjectSqft =
      data?.property?.squareFootage || null;

    const arvData = calculateARVFromComps(
      (data?.comparables as any)?.comparables || [],
      subjectSqft
    );

    const avmValue =
      (data?.comparables as any)?.value ||
      (data?.comparables as any)?.price ||
      null;

    return NextResponse.json({
      ...data,
      arvAnalysis: {
        arvEstimate: arvData.arv,
        compsUsed: arvData.compsUsed,
        confidence: arvData.confidence,
        pricePerSqft:
          subjectSqft && arvData.arv
            ? Math.round(arvData.arv / subjectSqft)
            : null,
        avm: avmValue,
        note: arvData.arv
          ? `Based on ${arvData.compsUsed} comparable sales`
          : 'Insufficient comp data — using AVM estimate',
      },
    });
  } catch (error) {
    console.error('[V2 Property Data] Error:', error);
    return NextResponse.json(
      { error: 'Property data unavailable', fallback: true },
      { status: 200 }
    );
  }
}
