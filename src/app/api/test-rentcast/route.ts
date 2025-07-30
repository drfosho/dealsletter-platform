import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    const apiKey = process.env.RENTCAST_API_KEY;
    const baseUrl = process.env.RENTCAST_API_URL || 'https://api.rentcast.io/v1';
    
    if (!apiKey) {
      return NextResponse.json({ error: 'RentCast API key not configured' }, { status: 500 });
    }

    // Try different test addresses
    const testAddresses = [
      '1600 Pennsylvania Avenue NW, Washington, DC 20500',
      '350 5th Avenue, New York, NY 10118',
      '1 Infinite Loop, Cupertino, CA 95014'
    ];

    const results = [];

    for (const address of testAddresses) {
      const encodedAddress = encodeURIComponent(address);
      
      console.log(`Testing RentCast API with address: ${address}`);
      console.log(`URL: ${baseUrl}/properties?address=${encodedAddress}`);

      try {
        const response = await fetch(`${baseUrl}/properties?address=${encodedAddress}`, {
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
          data = { rawResponse: responseText };
        }

        results.push({
          address,
          status: response.status,
          statusText: response.statusText,
          data
        });

        // If we get a successful response, break
        if (response.ok) {
          break;
        }
      } catch (fetchError) {
        results.push({
          address,
          error: fetchError instanceof Error ? fetchError.message : 'Fetch failed',
        });
      }
    }

    return NextResponse.json({
      apiKeyPresent: !!apiKey,
      apiKeyPrefix: apiKey.substring(0, 10) + '...',
      baseUrl,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test RentCast Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}