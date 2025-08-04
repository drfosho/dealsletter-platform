# Apify Integration Documentation

## Overview
This platform integrates with Apify to scrape property data from Zillow and LoopNet, providing comprehensive property information for investment analysis.

## Setup

### 1. Environment Configuration
Add your Apify API token to `.env.local`:
```
APIFY_API_TOKEN=apify_api_your_token_here
```

### 2. Token Format
The token should follow this format:
```
apify_api_YOUR_API_TOKEN_HERE
```

## API Endpoints

### Test Zillow Scraper
```
GET /api/test-zillow-scraper?url=ZILLOW_URL
```

Example:
```bash
curl "http://localhost:3000/api/test-zillow-scraper?url=https://www.zillow.com/homedetails/123-Main-St-San-Francisco-CA-94102/12345_zpid/"
```

### Test LoopNet Scraper
```
GET /api/test-loopnet-scraper?url=LOOPNET_URL
```

Example:
```bash
curl "http://localhost:3000/api/test-loopnet-scraper?url=https://www.loopnet.com/Listing/12345/123-Main-Street-San-Francisco-CA/"
```

### Bulk Scraping (POST)
Both endpoints support bulk scraping via POST requests:

```bash
curl -X POST "http://localhost:3000/api/test-zillow-scraper" \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://www.zillow.com/homedetails/property1",
      "https://www.zillow.com/homedetails/property2"
    ]
  }'
```

Maximum 5 URLs per request to prevent abuse.

## Data Format

### Zillow Response
```json
{
  "success": true,
  "data": {
    "address": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "price": 1500000,
    "bedrooms": 3,
    "bathrooms": 2,
    "squareFootage": 2000,
    "yearBuilt": 1920,
    "propertyType": "Single Family",
    "monthlyRent": 6000,
    "taxAssessedValue": 1200000,
    "propertyTaxes": 15000,
    "hoaFee": 500,
    "daysOnMarket": 30,
    "images": ["url1", "url2"],
    "zpid": "12345",
    "latitude": 37.7749,
    "longitude": -122.4194
  }
}
```

### LoopNet Response
```json
{
  "success": true,
  "data": {
    "address": "123 Commercial St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94111",
    "price": 5000000,
    "propertyType": "Office",
    "squareFootage": 10000,
    "yearBuilt": 1985,
    "capRate": 6.5,
    "noi": 325000,
    "occupancy": 95,
    "numberOfUnits": 10,
    "parkingSpaces": 20,
    "zoning": "C-2",
    "images": ["url1", "url2"],
    "listingId": "12345"
  }
}
```

## Testing

Run the test suite to verify integration:

```bash
node scripts/test-apify.js
```

This will:
1. Verify API token configuration
2. Test connection to Apify API
3. Test Zillow scraper with sample URL
4. Test LoopNet scraper with sample URL

## Error Handling

The integration handles various error scenarios:

- **Authentication Failures**: Invalid or missing API token
- **Scraper Timeouts**: Default 60-second timeout
- **Invalid URLs**: Validates domain before scraping
- **Rate Limiting**: Handles Apify rate limits with retries
- **Network Errors**: Graceful error messages

## Service Architecture

### ApifyService (`/src/services/apify.ts`)
Core service handling all Apify interactions:
- Actor run management
- Status polling
- Dataset retrieval
- Data normalization

### Key Methods:
- `scrapeZillowProperty(url)`: Scrapes single Zillow property
- `scrapeLoopNetProperty(url)`: Scrapes single LoopNet property
- `startActorRun()`: Starts Apify actor with configuration
- `waitForRun()`: Polls for completion status
- `getDatasetItems()`: Retrieves scraped data

## Actors Used

### Zillow Scraper
- **Actor ID**: `autoscraping/zillow-full-properties-collect-by-url`
- **Features**: Full property details, images, price history, tax data
- **Proxy**: Uses residential proxies

### LoopNet Scraper
- **Actor ID**: `epctex/loopnet-scraper`
- **Features**: Commercial property data, investment metrics
- **Proxy**: Uses residential proxies

## Rate Limits & Performance

- Default timeout: 60 seconds per scrape
- Poll interval: 2 seconds
- Max retries: 3 attempts
- Bulk limit: 5 URLs per request

## Future Enhancements

1. **Caching**: Store scraped data to reduce API calls
2. **Webhooks**: Use Apify webhooks for async processing
3. **Scheduled Scraping**: Regular updates for tracked properties
4. **More Sources**: Add Redfin, Realtor.com, etc.
5. **Data Enrichment**: Combine with RentCast for comprehensive analysis

## Troubleshooting

### Token Not Working
1. Verify token format: `apify_api_...`
2. Check token permissions in Apify dashboard
3. Ensure token is in `.env.local` not `.env`

### Scraper Failures
1. Check URL format is correct
2. Verify actor is available in Apify store
3. Check Apify account credits
4. Review logs in Apify dashboard

### Timeout Issues
1. Increase timeout in service configuration
2. Check property complexity (large listings take longer)
3. Verify network connectivity

## Support

For issues with:
- **Apify Service**: Check Apify documentation at https://docs.apify.com
- **Actor Issues**: Contact actor maintainer via Apify store
- **Integration**: Review service logs and error messages