#!/usr/bin/env node

/**
 * Test script for Enhanced Property Scraper
 * Tests the combination of Apify scraping + RentCast data enhancement
 */

require('dotenv').config({ path: '.env.local' });

const TEST_URLS = {
  zillow: 'https://www.zillow.com/homedetails/1419-Leavenworth-St-San-Francisco-CA-94109/2078507892_zpid/',
  loopnet: 'https://www.loopnet.com/Listing/28935005/2600-Telegraph-Avenue-Oakland-CA/'
};

async function testEnhancedScraper(url, source) {
  console.log(`\n📦 Testing Enhanced Scraper for ${source}...`);
  console.log(`URL: ${url}\n`);
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/scrape-property', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        includeRentCast: true,
        includeEstimates: true
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Enhanced scraping successful!\n');
      
      // Display key information
      console.log('📍 Property Information:');
      console.log(`   Address: ${result.data.address}`);
      console.log(`   City: ${result.data.city}, ${result.data.state} ${result.data.zipCode}`);
      console.log(`   Type: ${result.data.propertyType}`);
      
      if (result.data.bedrooms) {
        console.log(`   Size: ${result.data.bedrooms} bed / ${result.data.bathrooms} bath`);
      }
      if (result.data.squareFootage) {
        console.log(`   Square Footage: ${result.data.squareFootage.toLocaleString()} sqft`);
      }
      
      console.log('\n💰 Financial Data:');
      if (result.data.listingPrice) {
        console.log(`   Listing Price: $${result.data.listingPrice.toLocaleString()}`);
      }
      if (result.data.avm) {
        console.log(`   AVM (RentCast): $${result.data.avm.toLocaleString()}`);
      }
      if (result.data.price) {
        console.log(`   Combined Price: $${result.data.price.toLocaleString()}`);
      }
      if (result.data.monthlyRent) {
        console.log(`   Monthly Rent: $${result.data.monthlyRent.toLocaleString()}`);
      }
      if (result.data.rentEstimate) {
        console.log(`   Rent Estimate (RentCast): $${result.data.rentEstimate.toLocaleString()}`);
      }
      if (result.data.capRate) {
        console.log(`   Cap Rate: ${result.data.capRate}%`);
      }
      
      console.log('\n📊 Data Quality:');
      console.log(`   Completeness Score: ${result.data.dataCompleteness.score}%`);
      console.log(`   Data Sources:`);
      console.log(`     - Scraped Fields: ${result.data.dataCompleteness.sources.scraped}`);
      console.log(`     - RentCast Fields: ${result.data.dataCompleteness.sources.rentcast}`);
      console.log(`     - Estimated Fields: ${result.data.dataCompleteness.sources.estimated}`);
      
      if (result.data.dataCompleteness.missingFields.length > 0) {
        console.log(`   Missing Fields: ${result.data.dataCompleteness.missingFields.join(', ')}`);
      }
      
      console.log('\n🔍 Data Source Breakdown:');
      const sources = {};
      Object.values(result.data.dataSources).forEach((source) => {
        const key = `${source.source} (${source.confidence})`;
        sources[key] = (sources[key] || 0) + 1;
      });
      Object.entries(sources).forEach(([key, count]) => {
        console.log(`   ${key}: ${count} fields`);
      });
      
      console.log('\n📸 Images:');
      console.log(`   ${result.data.images ? result.data.images.length : 0} images available`);
      
      // Save to file for inspection
      const fs = require('fs');
      const filename = `enhanced-scrape-${source}-${Date.now()}.json`;
      fs.writeFileSync(filename, JSON.stringify(result, null, 2));
      console.log(`\n💾 Full data saved to: ${filename}`);
      
    } else {
      console.error('❌ Enhanced scraping failed');
      console.error(`   Error: ${result.error}`);
      console.error(`   Message: ${result.message}`);
      if (result.metadata?.scrapeError) {
        console.error(`   Scrape Error: ${result.metadata.scrapeError}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed');
    console.error(`   ${error.message}`);
    console.log('\n⚠️  Make sure the development server is running: npm run dev');
  }
}

async function checkServices() {
  console.log('🔍 Checking services...\n');
  
  // Check if dev server is running
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log('✅ Development server is running');
    }
  } catch {
    console.error('❌ Development server is not running');
    console.log('   Start it with: npm run dev');
    return false;
  }
  
  // Check environment variables
  const hasApify = !!process.env.APIFY_API_TOKEN;
  const hasRentCast = !!process.env.RENTCAST_API_KEY;
  
  console.log(`${hasApify ? '✅' : '❌'} APIFY_API_TOKEN ${hasApify ? 'configured' : 'missing'}`);
  console.log(`${hasRentCast ? '✅' : '❌'} RENTCAST_API_KEY ${hasRentCast ? 'configured' : 'missing'}`);
  
  if (!hasApify || !hasRentCast) {
    console.log('\n⚠️  Missing API keys. Add them to .env.local');
    return false;
  }
  
  return true;
}

async function main() {
  console.log('========================================');
  console.log('   Enhanced Property Scraper Test');
  console.log('========================================');
  
  // Check services
  const servicesOk = await checkServices();
  if (!servicesOk) {
    console.log('\nTests aborted due to missing requirements');
    return;
  }
  
  // Test Zillow scraping
  await testEnhancedScraper(TEST_URLS.zillow, 'zillow');
  
  // Add delay between tests
  console.log('\n⏳ Waiting 3 seconds before next test...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test LoopNet scraping
  await testEnhancedScraper(TEST_URLS.loopnet, 'loopnet');
  
  console.log('\n========================================');
  console.log('   Test Complete');
  console.log('========================================');
  console.log('\nThe enhanced scraper combines:');
  console.log('1. Scraped data from Zillow/LoopNet (primary)');
  console.log('2. RentCast API data (enhancement)');
  console.log('3. Estimated values (fallback)');
  console.log('\nThis creates comprehensive property datasets ready for AI analysis!');
}

// Run tests
main().catch(console.error);