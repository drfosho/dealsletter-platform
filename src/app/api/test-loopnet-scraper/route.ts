import { NextRequest, NextResponse } from 'next/server';
import { apifyService } from '@/services/apify';

export async function GET(request: NextRequest) {
  try {
    // Get URL from query parameters
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate it's a LoopNet URL
    if (!url.includes('loopnet.com')) {
      return NextResponse.json(
        { error: 'Invalid URL: Must be a LoopNet property URL' },
        { status: 400 }
      );
    }

    console.log(`[API] Testing LoopNet scraper for: ${url}`);

    // Scrape the property
    const result = await apifyService.scrapeLoopNetProperty(url);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error,
          message: 'Failed to scrape LoopNet property'
        },
        { status: 500 }
      );
    }

    // Return the scraped data
    return NextResponse.json({
      success: true,
      message: 'Successfully scraped LoopNet property',
      data: result.data,
      debug: {
        url,
        timestamp: new Date().toISOString(),
        hasRawData: !!result.raw
      }
    });

  } catch (error) {
    console.error('[API] LoopNet scraper error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('APIFY_API_TOKEN')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Apify API token not configured',
            message: 'Please set APIFY_API_TOKEN in environment variables'
          },
          { status: 503 }
        );
      }

      if (error.message.includes('authentication')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Authentication failed',
            message: 'Invalid Apify API token'
          },
          { status: 401 }
        );
      }

      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Scraper timeout',
            message: 'The scraper took too long to complete'
          },
          { status: 504 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// POST endpoint for bulk scraping (future enhancement)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      );
    }

    // Limit to 5 URLs at a time to prevent abuse
    if (urls.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 URLs allowed per request' },
        { status: 400 }
      );
    }

    // Process URLs in parallel
    const results = await Promise.allSettled(
      urls.map(url => apifyService.scrapeLoopNetProperty(url))
    );

    // Format results
    const processed = results.map((result, index) => ({
      url: urls[index],
      success: result.status === 'fulfilled' && result.value.success,
      data: result.status === 'fulfilled' ? result.value.data : null,
      error: result.status === 'rejected' ? result.reason.message : 
             (result.status === 'fulfilled' && !result.value.success ? result.value.error : null)
    }));

    const successCount = processed.filter(r => r.success).length;

    return NextResponse.json({
      success: successCount > 0,
      message: `Successfully scraped ${successCount} of ${urls.length} properties`,
      results: processed
    });

  } catch (error) {
    console.error('[API] Bulk LoopNet scraper error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process bulk scraping request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}