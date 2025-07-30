# RentCast API Integration

This document describes the RentCast API integration for automated property analysis.

## Overview

The RentCast integration provides:
- Property details lookup by address
- Rental income estimates
- Comparable sales data
- Market analysis data
- AI-powered investment analysis

## Setup

### 1. Environment Variables

Add the following to your `.env.local`:

```env
# RentCast API Configuration
RENTCAST_API_KEY=your-rentcast-api-key-here
RENTCAST_API_URL=https://api.rentcast.io/v1
```

### 2. API Endpoints

#### Property Search
```
POST /api/property/search
```

Search for a property by address and optionally include rental estimates, comparables, and market data.

**Request Body:**
```json
{
  "address": "123 Main St, San Francisco, CA 94105",
  "includeRentEstimates": true,
  "includeComparables": true,
  "includeMarketData": true
}
```

**Response:**
```json
{
  "address": "123 Main St, San Francisco, CA 94105",
  "property": { /* RentCast property details */ },
  "rental": { /* Rental estimates */ },
  "comparables": { /* Sale comparables */ },
  "market": { /* Market data */ },
  "timestamp": "2024-01-30T12:00:00Z"
}
```

#### Property Details
```
GET /api/property/details/{address}
```

Get comprehensive property details including all available data and calculated metrics.

**Response:**
```json
{
  "property": { /* Property details */ },
  "rental": { /* Rental estimates */ },
  "comparables": { /* Sale comparables */ },
  "market": { /* Market data */ },
  "metrics": {
    "pricePerSqFt": 450,
    "rentToPriceRatio": "0.65%",
    "grossYield": "7.8%",
    "estimatedCapRate": "4.7%",
    "rentVsMarket": "+5.2%",
    "priceVsMarket": "-3.1%"
  },
  "timestamp": "2024-01-30T12:00:00Z"
}
```

#### Generate Analysis
```
POST /api/analysis/generate
```

Generate AI-powered investment analysis for a property.

**Request Body:**
```json
{
  "address": "123 Main St, San Francisco, CA 94105",
  "strategy": "rental", // or "flip", "brrrr", "airbnb"
  "purchasePrice": 750000,
  "downPayment": 150000,
  "loanTerms": {
    "interestRate": 7.5,
    "loanTerm": 30,
    "loanType": "conventional"
  },
  "rehabCosts": 25000,
  "holdingPeriod": 5
}
```

**Response:**
```json
{
  "address": "123 Main St, San Francisco, CA 94105",
  "strategy": "rental",
  "propertyData": { /* Complete property data */ },
  "analysis": {
    "summary": "Investment overview...",
    "marketPosition": "Market analysis...",
    "financialProjections": {
      "cashFlow": 500,
      "capRate": 4.5,
      "roi": 12.3,
      "cocReturn": 8.7,
      "details": "Detailed projections..."
    },
    "strategyAnalysis": {
      "type": "rental",
      "details": "Strategy-specific analysis..."
    },
    "riskAssessment": {
      "factors": ["Market risk", "Interest rate risk"],
      "details": "Risk analysis..."
    },
    "recommendation": "Investment recommendation...",
    "fullAnalysis": "Complete AI analysis text..."
  },
  "timestamp": "2024-01-30T12:00:00Z"
}
```

## Client-Side Usage

```typescript
import { propertyAPI } from '@/services/property-api';

// Search for a property
const searchResults = await propertyAPI.searchProperty({
  address: '123 Main St, San Francisco, CA 94105',
  includeRentEstimates: true,
  includeComparables: true,
  includeMarketData: true
});

// Get detailed property info
const details = await propertyAPI.getPropertyDetails(
  '123 Main St, San Francisco, CA 94105'
);

// Generate investment analysis
const analysis = await propertyAPI.generateAnalysis({
  address: '123 Main St, San Francisco, CA 94105',
  strategy: 'rental',
  purchasePrice: 750000,
  downPayment: 150000,
  loanTerms: {
    interestRate: 7.5,
    loanTerm: 30,
    loanType: 'conventional'
  }
});
```

## Rate Limiting

- Property Search: 30 requests per minute per IP
- Property Details: 30 requests per minute per IP  
- Analysis Generation: 10 requests per minute per IP

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in window
- `X-RateLimit-Reset`: Unix timestamp when limit resets

## Caching

Property data is cached for 24 hours to minimize API calls:
- Property details
- Rental estimates
- Sale comparables
- Market data

Cache is stored in-memory for development. For production, consider using Redis.

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details",
  "retryAfter": 60 // For rate limit errors
}
```

Common error codes:
- `400`: Bad Request (invalid input)
- `404`: Property Not Found
- `429`: Rate Limit Exceeded
- `500`: Internal Server Error
- `503`: Service Unavailable (API not configured)

## Security Considerations

1. **API Key Protection**: Never expose RentCast API key on client-side
2. **Rate Limiting**: Implemented to prevent abuse
3. **Input Validation**: All addresses are validated and sanitized
4. **Error Messages**: Sensitive information is not exposed in errors

## Future Enhancements

1. **Redis Caching**: Replace in-memory cache with Redis for production
2. **Webhook Support**: Real-time updates when property data changes
3. **Batch Processing**: Support multiple property lookups in one request
4. **Historical Data**: Track property value and rent changes over time
5. **Enhanced Analytics**: More sophisticated investment calculations
6. **PDF Reports**: Generate downloadable investment reports