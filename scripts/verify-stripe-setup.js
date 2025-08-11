/**
 * Script to verify Stripe setup is complete
 * Run this to check that all products, prices, and configuration are correct
 * 
 * Usage: node scripts/verify-stripe-setup.js
 */

const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function verifySetup() {
  console.log('🔍 Verifying Stripe Setup...\n');
  console.log('='.repeat(60));
  
  let allGood = true;
  
  // Check API Keys
  console.log('1️⃣  API Keys Configuration:');
  console.log('─'.repeat(40));
  
  if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_')) {
    console.log('✅ Live Secret Key configured');
  } else if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
    console.log('⚠️  Using TEST Secret Key (switch to Live for production)');
  } else {
    console.log('❌ Invalid or missing Secret Key');
    allGood = false;
  }
  
  if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live_')) {
    console.log('✅ Live Publishable Key configured');
  } else if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_')) {
    console.log('⚠️  Using TEST Publishable Key (switch to Live for production)');
  } else {
    console.log('❌ Invalid or missing Publishable Key');
    allGood = false;
  }
  
  // Check Webhook Secret
  if (process.env.STRIPE_WEBHOOK_SECRET === 'whsec_your_webhook_secret_here') {
    console.log('⚠️  Webhook Secret not configured (update after creating webhook)');
  } else if (process.env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_')) {
    console.log('✅ Webhook Secret configured');
  } else {
    console.log('⚠️  Invalid Webhook Secret format');
  }
  
  console.log('\n2️⃣  Price IDs Configuration:');
  console.log('─'.repeat(40));
  
  const priceIds = {
    starter: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
    pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    premium: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM
  };
  
  for (const [tier, priceId] of Object.entries(priceIds)) {
    if (!priceId || priceId.includes('price_starter_id')) {
      console.log(`❌ ${tier.toUpperCase()} price ID not configured`);
      allGood = false;
    } else {
      try {
        const price = await stripe.prices.retrieve(priceId);
        const product = await stripe.products.retrieve(price.product);
        console.log(`✅ ${tier.toUpperCase()}: $${price.unit_amount / 100}/${price.recurring?.interval} - "${product.name}"`);
      } catch (error) {
        console.log(`❌ ${tier.toUpperCase()} price ID invalid: ${priceId}`);
        allGood = false;
      }
    }
  }
  
  // Check Customer Portal Configuration
  console.log('\n3️⃣  Customer Portal Status:');
  console.log('─'.repeat(40));
  
  try {
    const config = await stripe.billingPortal.configurations.list({ limit: 1 });
    if (config.data.length > 0) {
      console.log('✅ Customer Portal is configured');
      const features = config.data[0].features;
      console.log(`   • Cancel subscriptions: ${features.subscription_cancel.enabled ? '✓' : '✗'}`);
      console.log(`   • Update payment methods: ${features.payment_method_update.enabled ? '✓' : '✗'}`);
      console.log(`   • Invoice history: ${features.invoice_history.enabled ? '✓' : '✗'}`);
    } else {
      console.log('⚠️  Customer Portal not configured');
      console.log('   → Configure at: https://dashboard.stripe.com/settings/billing/portal');
    }
  } catch (error) {
    console.log('⚠️  Could not check Customer Portal configuration');
  }
  
  // Check for webhooks (can't directly query, so provide instructions)
  console.log('\n4️⃣  Webhook Configuration:');
  console.log('─'.repeat(40));
  console.log('📝 Manual Check Required:');
  console.log('   1. Go to: https://dashboard.stripe.com/webhooks');
  console.log('   2. Verify endpoint exists for your domain');
  console.log('   3. Required events:');
  console.log('      • checkout.session.completed');
  console.log('      • customer.subscription.updated');
  console.log('      • customer.subscription.deleted');
  console.log('      • invoice.payment_succeeded');
  console.log('      • invoice.payment_failed');
  
  // Summary
  console.log('\n' + '='.repeat(60));
  if (allGood) {
    console.log('✅ STRIPE SETUP COMPLETE!');
    console.log('\nYour subscription system is ready to use.');
    console.log('Remember to:');
    console.log('1. Configure webhook endpoint in Stripe Dashboard');
    console.log('2. Update STRIPE_WEBHOOK_SECRET in .env.local');
    console.log('3. Run database migrations');
    console.log('4. Test with a real subscription flow');
  } else {
    console.log('⚠️  SETUP INCOMPLETE');
    console.log('\nPlease fix the issues above before going live.');
  }
  console.log('='.repeat(60));
}

// Run verification
verifySetup().catch(console.error);