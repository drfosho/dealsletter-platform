import { stripe } from './stripe';
import Stripe from 'stripe';

// Product configurations
const PRODUCTS = {
  starter: {
    name: 'Dealsletter Starter',
    description: 'Perfect for beginners analyzing their first deals',
    metadata: {
      tier: 'starter',
      analyses_limit: '10',
      popular: 'false'
    },
    prices: {
      monthly: {
        unit_amount: 900, // $9.00
        currency: 'usd',
        recurring: {
          interval: 'month' as const,
          trial_period_days: 7
        }
      },
      yearly: {
        unit_amount: 9000, // $90.00 (10 months for price of 12)
        currency: 'usd',
        recurring: {
          interval: 'year' as const,
          trial_period_days: 7
        }
      }
    }
  },
  pro: {
    name: 'Dealsletter Pro',
    description: 'Full access to analysis tools and unlimited property evaluations',
    metadata: {
      tier: 'pro',
      analyses_limit: '35',
      popular: 'true'
    },
    prices: {
      monthly: {
        unit_amount: 2900, // $29.00
        currency: 'usd',
        recurring: {
          interval: 'month' as const,
          trial_period_days: 7
        }
      },
      yearly: {
        unit_amount: 29000, // $290.00 (10 months for price of 12)
        currency: 'usd',
        recurring: {
          interval: 'year' as const,
          trial_period_days: 7
        }
      }
    }
  },
  premium: {
    name: 'Dealsletter Premium',
    description: 'Enterprise features with priority support and API access',
    metadata: {
      tier: 'premium',
      analyses_limit: 'unlimited',
      popular: 'false'
    },
    prices: {
      monthly: {
        unit_amount: 4900, // $49.00
        currency: 'usd',
        recurring: {
          interval: 'month' as const,
          trial_period_days: 7
        }
      },
      yearly: {
        unit_amount: 49000, // $490.00 (10 months for price of 12)
        currency: 'usd',
        recurring: {
          interval: 'year' as const,
          trial_period_days: 7
        }
      }
    }
  }
};

/**
 * Get or create a Stripe price for a product
 * This ensures we always have a valid price ID even if not configured
 */
export async function getOrCreatePrice(
  tierName: string,
  billingPeriod: 'monthly' | 'yearly' = 'monthly'
): Promise<string | null> {
  console.log(`[Stripe Helper] Getting/creating price for ${tierName} (${billingPeriod})`);
  
  const productConfig = PRODUCTS[tierName.toLowerCase() as keyof typeof PRODUCTS];
  if (!productConfig) {
    console.error(`[Stripe Helper] No configuration found for tier: ${tierName}`);
    return null;
  }

  try {
    // First, try to find existing product
    const existingProducts = await stripe.products.search({
      query: `name:"${productConfig.name}"`
    });

    let product: Stripe.Product;
    
    if (existingProducts.data.length > 0) {
      product = existingProducts.data[0];
      console.log(`[Stripe Helper] Found existing product: ${product.id}`);
    } else {
      // Create new product
      product = await stripe.products.create({
        name: productConfig.name,
        description: productConfig.description,
        metadata: productConfig.metadata
      });
      console.log(`[Stripe Helper] Created new product: ${product.id}`);
    }

    // Now find or create the price
    const priceConfig = productConfig.prices[billingPeriod];
    if (!priceConfig) {
      console.error(`[Stripe Helper] No price configuration for ${billingPeriod}`);
      return null;
    }

    // Check for existing price
    const existingPrices = await stripe.prices.list({
      product: product.id,
      active: true,
      limit: 100
    });

    // Find matching price
    const matchingPrice = existingPrices.data.find(price => {
      return (
        price.unit_amount === priceConfig.unit_amount &&
        price.currency === priceConfig.currency &&
        price.recurring?.interval === priceConfig.recurring.interval
      );
    });

    if (matchingPrice) {
      console.log(`[Stripe Helper] Found existing price: ${matchingPrice.id}`);
      return matchingPrice.id;
    }

    // Create new price
    const newPrice = await stripe.prices.create({
      product: product.id,
      ...priceConfig,
      metadata: {
        tier: tierName,
        period: billingPeriod
      }
    });

    console.log(`[Stripe Helper] Created new price: ${newPrice.id}`);
    return newPrice.id;

  } catch (error) {
    console.error('[Stripe Helper] Error getting/creating price:', error);
    return null;
  }
}