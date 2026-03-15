/**
 * Script to create Stripe products and prices
 * Run this script to set up your subscription products in Stripe
 * 
 * Usage: node scripts/setup-stripe-products.js
 */

const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const products = [
  {
    name: 'Dealsletter Starter',
    description: 'Perfect for serious investors getting started',
    metadata: {
      tier: 'starter',
      analyses_limit: '12'
    },
    price: {
      unit_amount: 2900, // $29.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      }
    }
  },
  {
    name: 'Dealsletter Pro',
    description: 'For active investors and professionals',
    metadata: {
      tier: 'pro',
      analyses_limit: '35',
      popular: 'true'
    },
    price: {
      unit_amount: 6900, // $69.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      }
    }
  },
  {
    name: 'Dealsletter Premium',
    description: 'For power users and investment firms',
    metadata: {
      tier: 'premium',
      analyses_limit: 'unlimited'
    },
    price: {
      unit_amount: 15900, // $159.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      }
    }
  }
];

async function setupProducts() {
  console.log('🚀 Setting up Stripe products...\n');
  
  const createdProducts = [];
  
  for (const productData of products) {
    try {
      // Check if product already exists
      const existingProducts = await stripe.products.search({
        query: `name:"${productData.name}"`
      });
      
      let product;
      
      if (existingProducts.data.length > 0) {
        product = existingProducts.data[0];
        console.log(`✓ Product already exists: ${product.name}`);
        
        // Update product metadata
        product = await stripe.products.update(product.id, {
          description: productData.description,
          metadata: productData.metadata
        });
      } else {
        // Create new product
        product = await stripe.products.create({
          name: productData.name,
          description: productData.description,
          metadata: productData.metadata
        });
        console.log(`✓ Created product: ${product.name}`);
      }
      
      // Check for existing price
      const existingPrices = await stripe.prices.list({
        product: product.id,
        active: true,
        limit: 100
      });
      
      let price = existingPrices.data.find(p => 
        p.unit_amount === productData.price.unit_amount &&
        p.recurring?.interval === productData.price.recurring.interval
      );
      
      if (!price) {
        // Create new price
        price = await stripe.prices.create({
          product: product.id,
          ...productData.price,
          metadata: {
            tier: productData.metadata.tier
          }
        });
        console.log(`  → Created price: $${price.unit_amount / 100}/${price.recurring.interval}`);
      } else {
        console.log(`  → Price already exists: $${price.unit_amount / 100}/${price.recurring.interval}`);
      }
      
      createdProducts.push({
        tier: productData.metadata.tier,
        productId: product.id,
        priceId: price.id,
        amount: price.unit_amount / 100
      });
      
      console.log(`  → Price ID: ${price.id}\n`);
      
    } catch (error) {
      console.error(`❌ Error creating ${productData.name}:`, error.message);
    }
  }
  
  // Create yearly prices
  console.log('Creating yearly prices (20% discount)...\n');
  
  for (const productData of products) {
    try {
      const existingProducts = await stripe.products.search({
        query: `name:"${productData.name}"`
      });
      
      if (existingProducts.data.length > 0) {
        const product = existingProducts.data[0];
        const yearlyAmount = Math.floor(productData.price.unit_amount * 12 * 0.8); // 20% discount
        
        // Check for existing yearly price
        const existingPrices = await stripe.prices.list({
          product: product.id,
          active: true,
          limit: 100
        });
        
        let yearlyPrice = existingPrices.data.find(p => 
          p.recurring?.interval === 'year'
        );
        
        if (!yearlyPrice) {
          yearlyPrice = await stripe.prices.create({
            product: product.id,
            unit_amount: yearlyAmount,
            currency: 'usd',
            recurring: {
              interval: 'year',
                  },
            metadata: {
              tier: productData.metadata.tier,
              billing: 'yearly'
            }
          });
          console.log(`✓ Created yearly price for ${productData.name}: $${yearlyAmount / 100}/year`);
          console.log(`  → Yearly Price ID: ${yearlyPrice.id}\n`);
        } else {
          console.log(`✓ Yearly price already exists for ${productData.name}`);
          console.log(`  → Yearly Price ID: ${yearlyPrice.id}\n`);
        }
      }
    } catch (error) {
      console.error(`❌ Error creating yearly price for ${productData.name}:`, error.message);
    }
  }
  
  // Display summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 SETUP COMPLETE - Add these to your .env.local file:');
  console.log('='.repeat(60) + '\n');
  
  createdProducts.forEach(product => {
    const envKey = `NEXT_PUBLIC_STRIPE_PRICE_${product.tier.toUpperCase()}`;
    console.log(`${envKey}=${product.priceId}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('🔔 IMPORTANT NEXT STEPS:');
  console.log('='.repeat(60));
  console.log('\n1. Copy the price IDs above and update your .env.local file');
  console.log('2. Set up webhook endpoint in Stripe Dashboard:');
  console.log('   → Go to: https://dashboard.stripe.com/webhooks');
  console.log('   → Add endpoint: https://yourdomain.com/api/stripe/webhook');
  console.log('   → Select events:');
  console.log('     • checkout.session.completed');
  console.log('     • customer.subscription.updated');
  console.log('     • customer.subscription.deleted');
  console.log('     • invoice.payment_succeeded');
  console.log('     • invoice.payment_failed');
  console.log('3. Copy the webhook signing secret and add to .env.local:');
  console.log('   STRIPE_WEBHOOK_SECRET=whsec_...');
  console.log('4. Configure Customer Portal in Stripe Dashboard:');
  console.log('   → Go to: https://dashboard.stripe.com/settings/billing/portal');
  console.log('   → Enable features you want customers to access');
  console.log('\n✅ Your Stripe products are ready!');
}

// Run the setup
setupProducts().catch(console.error);