import { NextRequest, NextResponse } from 'next/server';

// Import the properties from the admin API (in real app, this would be from a database)
// For now, we'll use a shared module
import { getPublishedProperties } from '@/lib/properties';

export async function GET() {
  try {
    // Get only published properties for public dashboard
    const properties = await getPublishedProperties();
    
    return NextResponse.json(properties);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}