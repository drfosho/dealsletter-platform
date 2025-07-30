import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      hasRentCastKey: !!process.env.RENTCAST_API_KEY,
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    }
  });
}