import { NextRequest, NextResponse } from 'next/server';
import { rentCastService } from '@/services/rentcast';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address') || '1234 Main St, Austin, TX 78701';
  
  try {
    console.log('[Test] Testing RentCast API with address:', address);
    
    // Test property details
    let propertyDetails;
    try {
      propertyDetails = await rentCastService.getPropertyDetails(address);
      console.log('[Test] Property details success:', propertyDetails);
    } catch (err) {
      console.error('[Test] Property details failed:', err);
    }
    
    // Test rental estimate
    let rentalEstimate;
    try {
      rentalEstimate = await rentCastService.getRentalEstimate(address);
      console.log('[Test] Rental estimate success:', rentalEstimate);
    } catch (err) {
      console.error('[Test] Rental estimate failed:', err);
    }
    
    // Test comparables
    let comparables;
    try {
      comparables = await rentCastService.getSaleComparables(address);
      console.log('[Test] Comparables success:', comparables);
    } catch (err) {
      console.error('[Test] Comparables failed:', err);
    }
    
    return NextResponse.json({
      success: true,
      address,
      data: {
        propertyDetails,
        rentalEstimate,
        comparables
      }
    });
    
  } catch (error) {
    console.error('[Test] Overall error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      address
    }, { status: 500 });
  }
}