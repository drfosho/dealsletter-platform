import { NextRequest, NextResponse } from 'next/server';
import { mergePropertyData } from '@/utils/property-data-merger';
import { propertyCache } from '@/services/property-cache';
import { extractBasicPropertyData } from '@/utils/basic-property-extractor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, includeRentCast = true, includeEstimates = true, clearCache = false } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    console.log(`[API] Starting enhanced property scrape for: ${url}`);

    // Clear cache if requested (useful for testing)
    if (clearCache) {
      propertyCache.clearAll();
      console.log('[API] Cache cleared');
    }

    // Check cache first
    const cachedData = propertyCache.getScrapedData(url);
    if (cachedData && !clearCache) {
      console.log('[API] Returning cached property data');
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
        message: 'Data retrieved from cache'
      });
    }

    // Step 1: Determine the source and attempt scraping
    let scrapedData = null;
    let scrapeError = null;
    let source = 'unknown';

    // Check if Apify is configured
    const hasApifyToken = !!process.env.APIFY_API_TOKEN;
    
    if (url.includes('zillow.com')) {
      source = 'zillow';
      console.log('[API] Detected Zillow URL');
      
      if (hasApifyToken) {
        // Try Apify scraping
        try {
          const { apifyService } = await import('@/services/apify');
          const result = await apifyService.scrapeZillowProperty(url);
          if (result.success) {
            scrapedData = result.data;
            console.log('[API] Zillow scrape via Apify successful');
          } else {
            scrapeError = result.error;
            console.error('[API] Zillow scrape failed:', scrapeError);
          }
        } catch (error) {
          scrapeError = error instanceof Error ? error.message : 'Scraping failed';
          console.error('[API] Zillow scrape error:', error);
        }
      } else {
        console.log('[API] Apify not configured, using basic extraction');
      }
      
    } else if (url.includes('loopnet.com')) {
      source = 'loopnet';
      console.log('[API] Detected LoopNet URL');
      
      if (hasApifyToken) {
        try {
          const { apifyService } = await import('@/services/apify');
          const result = await apifyService.scrapeLoopNetProperty(url);
          if (result.success) {
            scrapedData = result.data;
            console.log('[API] LoopNet scrape via Apify successful');
          } else {
            scrapeError = result.error;
            console.error('[API] LoopNet scrape failed:', scrapeError);
          }
        } catch (error) {
          scrapeError = error instanceof Error ? error.message : 'Scraping failed';
          console.error('[API] LoopNet scrape error:', error);
        }
      } else {
        console.log('[API] Apify not configured, using basic extraction');
      }
      
    } else if (url.includes('realtor.com')) {
      source = 'realtor';
      console.log('[API] Detected Realtor.com URL');
    } else if (url.includes('redfin.com')) {
      source = 'redfin';
      console.log('[API] Detected Redfin URL');
    }

    // Step 2: Extract address for RentCast lookup
    let address = '';
    if (scrapedData) {
      // Build full address from scraped data
      const parts = [];
      if (scrapedData.address) parts.push(scrapedData.address);
      if (scrapedData.city) parts.push(scrapedData.city);
      if (scrapedData.state) parts.push(scrapedData.state);
      if (scrapedData.zipCode || scrapedData.zip) {
        parts.push(scrapedData.zipCode || scrapedData.zip);
      }
      address = parts.join(', ');
    }

    // If no scraped data, use basic extraction as fallback
    if (!scrapedData) {
      console.log('[API] No scraped data, using basic extraction from URL');
      const basicData = extractBasicPropertyData(url);
      
      if (basicData) {
        scrapedData = basicData;
        // Build address from extracted data
        const parts = [];
        if (basicData.address) parts.push(basicData.address);
        if (basicData.city) parts.push(basicData.city);
        if (basicData.state) parts.push(basicData.state);
        if (basicData.zipCode) parts.push(basicData.zipCode);
        address = parts.join(', ');
        
        console.log('[API] Basic extraction found address:', address);
      }
    }

    // If still no address, create a generic one
    if (!address) {
      console.log('[API] No address found, using generic address for data merge');
      address = 'Property Address Unknown';
    }

    // Step 3: Merge with RentCast data
    console.log('[API] Merging data with RentCast...');
    const mergedData = await mergePropertyData(
      scrapedData,
      address,
      {
        includeRentCast,
        includeEstimates
      }
    );

    // Step 4: Add metadata
    const response = {
      success: true,
      source,
      url,
      address,
      data: mergedData,
      metadata: {
        scrapedAt: new Date().toISOString(),
        dataCompleteness: mergedData.dataCompleteness,
        dataSources: {
          scraped: Object.values(mergedData.dataSources).filter(d => d.source === 'scraped').length,
          rentcast: Object.values(mergedData.dataSources).filter(d => d.source === 'rentcast').length,
          estimated: Object.values(mergedData.dataSources).filter(d => d.source === 'estimated').length
        },
        hasScrapedData: !!scrapedData,
        scrapeError: scrapeError || null
      }
    };

    console.log('[API] Enhanced property data ready:', {
      source,
      completeness: mergedData.dataCompleteness.score + '%',
      fields: Object.keys(mergedData.dataSources).length
    });

    // Cache the merged data for future use
    propertyCache.setScrapedData(url, mergedData);
    console.log('[API] Data cached for future requests');

    return NextResponse.json(response);

  } catch (error) {
    console.error('[API] Enhanced scrape error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Failed to process property'
      },
      { status: 500 }
    );
  }
}