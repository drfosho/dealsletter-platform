import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Import the properties from the admin API (in real app, this would be from a database)
// For now, we'll use a shared module
import { getPublishedProperties, getAllProperties, createProperty } from '@/lib/properties';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeAll = searchParams.get('includeAll') === 'true';
    
    // If includeAll is true, get all properties (for dashboard tabs)
    // Otherwise get only active properties (default behavior)
    const properties = includeAll 
      ? await getAllProperties() 
      : await getPublishedProperties();
    
    return NextResponse.json(properties);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create the new property
    const newProperty = await createProperty(body);
    
    return NextResponse.json({ 
      success: true, 
      property: newProperty 
    });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}