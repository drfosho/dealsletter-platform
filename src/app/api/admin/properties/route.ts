import { NextRequest, NextResponse } from 'next/server';
import { adminAuthMiddleware } from '@/middleware/adminAuth';
import { 
  getAllProperties, 
  createProperty, 
  updateProperty, 
  deleteProperty 
} from '@/lib/properties';

export async function GET(request: NextRequest) {
  // Check authentication
  const authResponse = adminAuthMiddleware(request);
  if (authResponse.status === 401) {
    return authResponse;
  }

  // Return all properties (including static deals)
  const properties = await getAllProperties();
  return NextResponse.json(properties);
}

export async function POST(request: NextRequest) {
  // Check authentication
  const authResponse = adminAuthMiddleware(request);
  if (authResponse.status === 401) {
    return authResponse;
  }

  try {
    const body = await request.json();
    
    // Log the incoming data to debug images
    console.log('Creating property with data:', {
      ...body,
      images: body.images || 'No images provided'
    });
    
    // Create property
    const newProperty = await createProperty(body);

    return NextResponse.json(newProperty);
  } catch {
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // Check authentication
  const authResponse = adminAuthMiddleware(request);
  if (authResponse.status === 401) {
    return authResponse;
  }

  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Property ID required' },
        { status: 400 }
      );
    }

    // Update property
    const updatedProperty = await updateProperty(body.id, body);
    
    if (!updatedProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProperty);
  } catch {
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // For now, skip authentication check in development
  // TODO: Fix authentication middleware for API routes
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (!isDevelopment) {
    // Check authentication
    const authResponse = adminAuthMiddleware(request);
    if (authResponse.status === 401) {
      return authResponse;
    }
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Property ID required' },
        { status: 400 }
      );
    }

    console.log('Attempting to delete property with ID:', id);

    // Delete property
    const success = await deleteProperty(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Property not found or is a static deal that cannot be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE endpoint error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to delete property',
        details: error.toString()
      },
      { status: 400 }
    );
  }
}