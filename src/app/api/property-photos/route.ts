import { NextRequest, NextResponse } from 'next/server';
import PropertyPhotoService from '@/services/property-photos';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const propertyType = searchParams.get('propertyType');
    const count = parseInt(searchParams.get('count') || '5');
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }
    
    const photos = await PropertyPhotoService.getPropertyPhotos(
      address,
      propertyType || undefined,
      undefined,
      count
    );
    
    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Error fetching property photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property photos' },
      { status: 500 }
    );
  }
}