import { NextRequest, NextResponse } from 'next/server';
import { rentCastService } from '@/services/rentcast';

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

    return NextResponse.json(data);
  } catch (error) {
    console.error('[V2 Property Data] Error:', error);
    return NextResponse.json(
      { error: 'Property data unavailable', fallback: true },
      { status: 200 }
    );
  }
}
