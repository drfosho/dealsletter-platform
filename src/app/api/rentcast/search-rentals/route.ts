import { NextRequest, NextResponse } from 'next/server';
import { rentCastService } from '@/services/rentcast';
import { EnhancedSearchParams } from '@/types/rentcast';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const searchParams: EnhancedSearchParams = body;
    
    // Validate required parameters
    if (!searchParams.city && !searchParams.zipCode && !searchParams.county) {
      return NextResponse.json(
        { error: 'At least one location parameter is required' },
        { status: 400 }
      );
    }
    
    console.log('[API] Enhanced rental search request:', searchParams);
    
    // Perform the enhanced rental search
    const results = await rentCastService.searchRentals(searchParams);
    
    console.log('[API] Rental search completed:', {
      totalResults: results.totalCount,
      returnedResults: results.returnedCount,
      hasMore: results.hasMore
    });
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('[API] Rental search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Rental search failed' },
      { status: 500 }
    );
  }
}