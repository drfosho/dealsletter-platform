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
        { error: 'At least one location parameter (city, zipCode, or county) is required' },
        { status: 400 }
      );
    }
    
    console.log('[API] Enhanced property search request:', searchParams);
    
    // Perform the enhanced search
    const results = await rentCastService.searchProperties(searchParams);
    
    console.log('[API] Search completed:', {
      totalResults: results.totalCount,
      returnedResults: results.returnedCount,
      hasMore: results.hasMore
    });
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('[API] Search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Parse query parameters from URL
    const searchParams = req.nextUrl.searchParams;
    
    const params: EnhancedSearchParams = {
      city: searchParams.get('city') || undefined,
      state: searchParams.get('state') || undefined,
      zipCode: searchParams.get('zipCode') || undefined,
      minBeds: searchParams.get('minBeds') ? parseInt(searchParams.get('minBeds')!) : undefined,
      maxBeds: searchParams.get('maxBeds') ? parseInt(searchParams.get('maxBeds')!) : undefined,
      minBaths: searchParams.get('minBaths') ? parseFloat(searchParams.get('minBaths')!) : undefined,
      maxBaths: searchParams.get('maxBaths') ? parseFloat(searchParams.get('maxBaths')!) : undefined,
      minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
      minSqft: searchParams.get('minSqft') ? parseInt(searchParams.get('minSqft')!) : undefined,
      maxSqft: searchParams.get('maxSqft') ? parseInt(searchParams.get('maxSqft')!) : undefined,
      propertyTypes: searchParams.get('propertyTypes')?.split(',').filter(Boolean),
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };
    
    // Remove undefined values
    Object.keys(params).forEach(key => {
      if ((params as any)[key] === undefined) {
        delete (params as any)[key];
      }
    });
    
    // Validate required parameters
    if (!params.city && !params.zipCode) {
      return NextResponse.json(
        { error: 'At least one location parameter (city or zipCode) is required' },
        { status: 400 }
      );
    }
    
    console.log('[API] Enhanced property search GET request:', params);
    
    // Perform the enhanced search
    const results = await rentCastService.searchProperties(params);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('[API] Search GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}