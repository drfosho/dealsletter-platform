/**
 * Apify API Integration Service
 * Handles web scraping for Zillow and LoopNet properties
 */

interface ApifyRunOptions {
  actorId: string;
  input: any;
  waitForFinish?: boolean;
  timeout?: number;
}

interface ApifyRunResult {
  id: string;
  status: string;
  defaultDatasetId: string;
}

class ApifyService {
  private readonly baseUrl = 'https://api.apify.com/v2';
  private readonly token: string;
  private readonly maxRetries = 3;
  private readonly pollInterval = 2000; // 2 seconds
  private readonly maxWaitTime = 120000; // 2 minutes

  constructor() {
    const token = process.env.APIFY_API_TOKEN;
    if (!token) {
      console.warn('[Apify] APIFY_API_TOKEN is not configured - scraping will use fallback methods');
      this.token = '';
    } else {
      this.token = token;
    }
  }

  /**
   * Start an Apify actor run
   */
  async startActorRun(options: ApifyRunOptions): Promise<ApifyRunResult> {
    const { actorId, input, waitForFinish = true, timeout = this.maxWaitTime } = options;
    
    const url = `${this.baseUrl}/acts/${actorId}/runs?token=${this.token}`;
    
    console.log(`[Apify] Starting actor run for ${actorId}`);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to start actor run: ${response.status} - ${error}`);
      }

      const runData = await response.json();
      console.log(`[Apify] Actor run started with ID: ${runData.data.id}`);

      if (waitForFinish) {
        return await this.waitForRun(runData.data.id, timeout);
      }

      return runData.data;
    } catch (error) {
      console.error(`[Apify] Error starting actor run:`, error);
      throw error;
    }
  }

  /**
   * Wait for an Apify run to complete
   */
  async waitForRun(runId: string, timeout: number = this.maxWaitTime): Promise<ApifyRunResult> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const url = `${this.baseUrl}/actor-runs/${runId}?token=${this.token}`;
      
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to get run status: ${response.status}`);
        }

        const runData = await response.json();
        const status = runData.data.status;
        
        console.log(`[Apify] Run ${runId} status: ${status}`);

        if (status === 'SUCCEEDED') {
          return runData.data;
        } else if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
          throw new Error(`Actor run ${status}: ${runData.data.statusMessage || 'Unknown error'}`);
        }

        // Still running, wait before polling again
        await new Promise(resolve => setTimeout(resolve, this.pollInterval));
      } catch (error) {
        console.error(`[Apify] Error checking run status:`, error);
        throw error;
      }
    }

    throw new Error(`Actor run timed out after ${timeout}ms`);
  }

  /**
   * Get dataset items from a completed run
   */
  async getDatasetItems(datasetId: string, options: { limit?: number; offset?: number } = {}): Promise<any[]> {
    const { limit = 100, offset = 0 } = options;
    const url = `${this.baseUrl}/datasets/${datasetId}/items?token=${this.token}&limit=${limit}&offset=${offset}`;
    
    console.log(`[Apify] Fetching dataset items from ${datasetId}`);
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get dataset items: ${response.status} - ${error}`);
      }

      const data = await response.json();
      console.log(`[Apify] Retrieved ${data.length} items from dataset`);
      
      return data;
    } catch (error) {
      console.error(`[Apify] Error fetching dataset items:`, error);
      throw error;
    }
  }

  /**
   * Scrape a Zillow property by URL
   */
  async scrapeZillowProperty(propertyUrl: string): Promise<any> {
    console.log(`[Apify] Starting Zillow scrape for: ${propertyUrl}`);
    
    // Validate URL
    if (!propertyUrl.includes('zillow.com')) {
      throw new Error('Invalid URL: Must be a Zillow property URL');
    }

    const actorId = 'autoscraping/zillow-full-properties-collect-by-url';
    
    try {
      // Start the actor run
      const run = await this.startActorRun({
        actorId,
        input: {
          urls: [propertyUrl],
          proxy: {
            useApifyProxy: true,
            apifyProxyGroups: ['RESIDENTIAL']
          },
          maxConcurrency: 1,
          handlePageTimeoutSecs: 60,
        },
        waitForFinish: true,
        timeout: 60000, // 1 minute timeout for Zillow
      });

      // Get the scraped data
      const items = await this.getDatasetItems(run.defaultDatasetId);
      
      if (items.length === 0) {
        throw new Error('No data scraped from Zillow URL');
      }

      // Process and return the first item (should be only one for single URL)
      const property = items[0];
      
      return {
        success: true,
        data: this.processZillowData(property),
        raw: property,
      };
    } catch (error) {
      console.error(`[Apify] Zillow scraping failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scrape Zillow property',
      };
    }
  }

  /**
   * Scrape a LoopNet property by URL
   */
  async scrapeLoopNetProperty(propertyUrl: string): Promise<any> {
    console.log(`[Apify] Starting LoopNet scrape for: ${propertyUrl}`);
    
    // Validate URL
    if (!propertyUrl.includes('loopnet.com')) {
      throw new Error('Invalid URL: Must be a LoopNet property URL');
    }

    const actorId = 'epctex/loopnet-scraper';
    
    try {
      // Start the actor run
      const run = await this.startActorRun({
        actorId,
        input: {
          startUrls: [{ url: propertyUrl }],
          proxy: {
            useApifyProxy: true,
            apifyProxyGroups: ['RESIDENTIAL']
          },
          maxItems: 1,
          endPage: 1,
          extendOutputFunction: '',
        },
        waitForFinish: true,
        timeout: 60000, // 1 minute timeout for LoopNet
      });

      // Get the scraped data
      const items = await this.getDatasetItems(run.defaultDatasetId);
      
      if (items.length === 0) {
        throw new Error('No data scraped from LoopNet URL');
      }

      // Process and return the first item
      const property = items[0];
      
      return {
        success: true,
        data: this.processLoopNetData(property),
        raw: property,
      };
    } catch (error) {
      console.error(`[Apify] LoopNet scraping failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scrape LoopNet property',
      };
    }
  }

  /**
   * Process Zillow scraped data into standardized format
   */
  private processZillowData(rawData: any): any {
    return {
      address: rawData.address || rawData.streetAddress,
      city: rawData.city,
      state: rawData.state,
      zipCode: rawData.zipcode || rawData.zipCode,
      price: rawData.price || rawData.zestimate,
      bedrooms: rawData.bedrooms,
      bathrooms: rawData.bathrooms,
      squareFootage: rawData.livingArea || rawData.sqft,
      lotSize: rawData.lotSize,
      yearBuilt: rawData.yearBuilt,
      propertyType: rawData.homeType || rawData.propertyType,
      description: rawData.description,
      images: rawData.images || [],
      monthlyRent: rawData.rentZestimate || rawData.rentEstimate,
      taxAssessedValue: rawData.taxAssessedValue,
      propertyTaxes: rawData.propertyTaxRate,
      hoaFee: rawData.monthlyHoaFee,
      listingStatus: rawData.homeStatus,
      daysOnMarket: rawData.daysOnZillow,
      priceHistory: rawData.priceHistory || [],
      taxHistory: rawData.taxHistory || [],
      schools: rawData.schools || [],
      url: rawData.url,
      zpid: rawData.zpid,
      latitude: rawData.latitude,
      longitude: rawData.longitude,
    };
  }

  /**
   * Process LoopNet scraped data into standardized format
   */
  private processLoopNetData(rawData: any): any {
    return {
      address: rawData.address || rawData.title,
      city: rawData.city,
      state: rawData.state,
      zipCode: rawData.zip,
      price: this.parseLoopNetPrice(rawData.price || rawData.salePrice),
      propertyType: rawData.propertyType || rawData.type,
      squareFootage: this.parseLoopNetNumber(rawData.buildingSize || rawData.sqft),
      lotSize: this.parseLoopNetNumber(rawData.lotSize),
      yearBuilt: rawData.yearBuilt,
      description: rawData.description || rawData.propertyDescription,
      images: rawData.images || rawData.photos || [],
      capRate: this.parseLoopNetNumber(rawData.capRate),
      noi: this.parseLoopNetNumber(rawData.noi),
      occupancy: this.parseLoopNetNumber(rawData.occupancy),
      numberOfUnits: rawData.units || rawData.numberOfUnits,
      parkingSpaces: rawData.parking,
      zoning: rawData.zoning,
      highlights: rawData.highlights || [],
      investmentHighlights: rawData.investmentHighlights,
      locationDescription: rawData.locationDescription,
      url: rawData.url,
      listingId: rawData.id || rawData.listingId,
      broker: rawData.broker || rawData.listingAgent,
      brokerCompany: rawData.brokerCompany,
    };
  }

  /**
   * Parse LoopNet price strings (e.g., "$1,500,000" -> 1500000)
   */
  private parseLoopNetPrice(priceStr: string | number): number {
    if (typeof priceStr === 'number') return priceStr;
    if (!priceStr) return 0;
    
    // Remove currency symbols, commas, and other non-numeric characters
    const cleaned = priceStr.toString().replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  }

  /**
   * Parse LoopNet number strings (e.g., "5,000 SF" -> 5000)
   */
  private parseLoopNetNumber(str: string | number): number {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    
    // Remove commas and non-numeric characters except decimal points
    const cleaned = str.toString().replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  }
}

// Export singleton instance
export const apifyService = new ApifyService();