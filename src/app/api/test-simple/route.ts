import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    // Simple test to verify API connectivity
    const apiKey = process.env.RENTCAST_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'RentCast API key not configured',
        envCheck: {
          hasKey: false
        }
      }, { status: 500 });
    }

    // Test with a simple city search (less specific than address)
    const testUrl = 'https://api.rentcast.io/v1/properties?city=Austin&state=TX&limit=1';
    
    console.log('Making request to:', testUrl);
    console.log('API Key (first 10 chars):', apiKey.substring(0, 10) + '...');

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Api-Key': apiKey,
      },
    });

    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { rawText: responseText };
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: data,
      headers: {
        contentType: response.headers.get('content-type'),
        rateLimit: response.headers.get('x-ratelimit-limit'),
        remaining: response.headers.get('x-ratelimit-remaining'),
      },
      test: {
        url: testUrl,
        apiKeyLength: apiKey.length,
        apiKeyPrefix: apiKey.substring(0, 10) + '...',
      }
    });

  } catch (error) {
    console.error('Test Simple Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}