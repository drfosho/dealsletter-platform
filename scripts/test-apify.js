#!/usr/bin/env node

/**
 * Test script for Apify integration
 * Usage: node scripts/test-apify.js
 */

require('dotenv').config({ path: '.env.local' });

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;

async function testApifyConnection() {
  console.log('🔍 Testing Apify API Connection...\n');
  
  if (!APIFY_API_TOKEN) {
    console.error('❌ APIFY_API_TOKEN is not set in .env.local');
    console.log('Please add: APIFY_API_TOKEN=apify_api_your_token_here');
    process.exit(1);
  }

  console.log('✅ APIFY_API_TOKEN found');
  console.log(`Token format: ${APIFY_API_TOKEN.substring(0, 15)}...`);
  
  // Test API connection
  try {
    const url = `https://api.apify.com/v2/user?token=${APIFY_API_TOKEN}`;
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Successfully connected to Apify API');
      console.log(`User: ${data.data.username}`);
      console.log(`Email: ${data.data.email}`);
      console.log(`Plan: ${data.data.plan?.name || 'Free'}`);
    } else {
      console.error('❌ Failed to authenticate with Apify');
      console.error(`Status: ${response.status}`);
      const error = await response.text();
      console.error(`Error: ${error}`);
    }
  } catch (error) {
    console.error('❌ Failed to connect to Apify API');
    console.error(error.message);
  }
}

async function testZillowScraper() {
  console.log('\n📦 Testing Zillow Scraper...\n');
  
  const testUrl = 'https://www.zillow.com/homedetails/1419-Leavenworth-St-San-Francisco-CA-94109/2078507892_zpid/';
  console.log(`Test URL: ${testUrl}`);
  
  try {
    const response = await fetch(`http://localhost:3000/api/test-zillow-scraper?url=${encodeURIComponent(testUrl)}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Zillow scraper test successful');
      console.log('\nScraped Data:');
      console.log(`- Address: ${data.data.address}`);
      console.log(`- Price: $${data.data.price?.toLocaleString() || 'N/A'}`);
      console.log(`- Bedrooms: ${data.data.bedrooms || 'N/A'}`);
      console.log(`- Bathrooms: ${data.data.bathrooms || 'N/A'}`);
      console.log(`- Square Footage: ${data.data.squareFootage || 'N/A'} sqft`);
    } else {
      console.error('❌ Zillow scraper test failed');
      console.error(`Error: ${data.error}`);
      console.error(`Message: ${data.message}`);
    }
  } catch (error) {
    console.error('❌ Failed to test Zillow scraper');
    console.error(error.message);
    console.log('\nMake sure the development server is running: npm run dev');
  }
}

async function testLoopNetScraper() {
  console.log('\n📦 Testing LoopNet Scraper...\n');
  
  const testUrl = 'https://www.loopnet.com/Listing/28935005/2600-Telegraph-Avenue-Oakland-CA/';
  console.log(`Test URL: ${testUrl}`);
  
  try {
    const response = await fetch(`http://localhost:3000/api/test-loopnet-scraper?url=${encodeURIComponent(testUrl)}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ LoopNet scraper test successful');
      console.log('\nScraped Data:');
      console.log(`- Address: ${data.data.address}`);
      console.log(`- Price: $${data.data.price?.toLocaleString() || 'N/A'}`);
      console.log(`- Property Type: ${data.data.propertyType || 'N/A'}`);
      console.log(`- Square Footage: ${data.data.squareFootage || 'N/A'} sqft`);
      console.log(`- Cap Rate: ${data.data.capRate || 'N/A'}%`);
    } else {
      console.error('❌ LoopNet scraper test failed');
      console.error(`Error: ${data.error}`);
      console.error(`Message: ${data.message}`);
    }
  } catch (error) {
    console.error('❌ Failed to test LoopNet scraper');
    console.error(error.message);
    console.log('\nMake sure the development server is running: npm run dev');
  }
}

async function main() {
  console.log('========================================');
  console.log('     Apify Integration Test Suite');
  console.log('========================================\n');
  
  // Test Apify connection
  await testApifyConnection();
  
  // Check if dev server is running
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log('\n✅ Development server is running\n');
      
      // Test scrapers
      await testZillowScraper();
      await testLoopNetScraper();
    }
  } catch (error) {
    console.log('\n⚠️  Development server is not running');
    console.log('Start it with: npm run dev');
    console.log('Skipping scraper tests...');
  }
  
  console.log('\n========================================');
  console.log('     Test Suite Complete');
  console.log('========================================');
}

// Run tests
main().catch(console.error);