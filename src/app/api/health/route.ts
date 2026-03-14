import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  // Only expose that the service is up — no env details
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}