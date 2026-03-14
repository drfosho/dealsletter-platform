import { NextRequest, NextResponse } from 'next/server';
import { rentCastService } from '@/services/rentcast';
import { EnhancedSearchParams } from '@/types/rentcast';
import { requireAuth } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  try {
    // SEC: require authentication — proxies paid RentCast API
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await req.json();
    const searchParams: EnhancedSearchParams = body;
    
    // Validate required parameters
    if (!searchParams.city && !searchParams.zipCode && !searchParams.county) {
      return NextResponse.json(
        { error: 'At least one location parameter is required' },
        { status: 400 }
      );
    }
    
    console.log('[API] Enhanced sale search request:', searchParams);
    
    // Perform the enhanced sale search
    const results = await rentCastService.searchSales(searchParams);
    
    console.log('[API] Sale search completed:', {
      totalResults: results.totalCount,
      returnedResults: results.returnedCount,
      hasMore: results.hasMore
    });
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('[API] Sale search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sale search failed' },
      { status: 500 }
    );
  }
}