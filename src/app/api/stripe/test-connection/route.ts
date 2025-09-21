import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET() {
  try {
    // Test Stripe connection by fetching products
    const products = await stripe.products.list({ limit: 1 });

    return NextResponse.json({
      success: true,
      message: 'Stripe connection successful',
      hasProducts: products.data.length > 0,
      productCount: products.data.length,
      stripeConfigured: true,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[Stripe Test] Connection failed:', error.message);

    return NextResponse.json({
      success: false,
      message: 'Stripe connection failed',
      error: error.message,
      stripeConfigured: false,
      envCheck: {
        hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
        secretKeyLength: process.env.STRIPE_SECRET_KEY?.length || 0,
        secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7) || 'missing',
        hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        publishableKeyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 7) || 'missing'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}