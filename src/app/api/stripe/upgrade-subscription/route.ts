import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { sendSubscriptionEmail } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  console.log('[UpgradeSubscription] Processing upgrade request...');

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetTier, billingPeriod = 'monthly' } = await request.json();
    console.log('[UpgradeSubscription] Target tier:', targetTier, 'Period:', billingPeriod);

    // Get user's current subscription
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_subscription_id, stripe_customer_id, subscription_tier')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    console.log('[UpgradeSubscription] Current tier:', profile.subscription_tier);

    // Get the target price ID
    const normalizedTier = (targetTier || '').toUpperCase().replace(/-/g, '_');
    const isYearly = billingPeriod === 'yearly' || billingPeriod === 'annual';
    let targetPriceId: string | undefined;
    let dbTierName: string;

    if (normalizedTier === 'PRO_PLUS' || normalizedTier === 'PROPLUS') {
      targetPriceId = isYearly
        ? process.env.STRIPE_PRICE_PRO_PLUS_YEARLY
        : process.env.STRIPE_PRICE_PRO_PLUS_MONTHLY;
      dbTierName = 'pro-plus';
    } else if (normalizedTier === 'PRO') {
      targetPriceId = isYearly
        ? process.env.STRIPE_PRICE_PRO_YEARLY
        : process.env.STRIPE_PRICE_PRO_MONTHLY;
      dbTierName = 'pro';
    } else {
      return NextResponse.json({ error: 'Invalid target tier' }, { status: 400 });
    }

    if (!targetPriceId) {
      return NextResponse.json({ error: 'Price not configured for this tier' }, { status: 500 });
    }

    // Get current subscription to find the item to replace
    const subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);
    const currentItem = subscription.items.data[0];

    if (!currentItem) {
      return NextResponse.json({ error: 'No subscription item found' }, { status: 400 });
    }

    // Update the subscription with proration
    console.log('[UpgradeSubscription] Updating Stripe subscription with proration...');
    const updatedSubscription = await stripe.subscriptions.update(
      profile.stripe_subscription_id,
      {
        items: [
          {
            id: currentItem.id,
            price: targetPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
        metadata: {
          ...subscription.metadata,
          tierName: normalizedTier,
        },
      }
    );

    console.log('[UpgradeSubscription] Stripe subscription updated:', {
      id: updatedSubscription.id,
      status: updatedSubscription.status,
    });

    // Update user_profiles with new tier
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        subscription_tier: dbTierName,
        subscription_status: updatedSubscription.status as string,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('[UpgradeSubscription] DB update error:', profileError);
    } else {
      console.log('[UpgradeSubscription] ✅ Tier updated to:', dbTierName);
    }

    // Send subscription confirmation email for the new tier
    if (user.email) {
      sendSubscriptionEmail({
        email: user.email,
        name: user.user_metadata?.full_name as string || undefined,
        tier: dbTierName === 'pro-plus' ? 'pro-plus' : 'pro',
      }).catch(err => console.error('[UpgradeSubscription] Email error:', err));
    }

    return NextResponse.json({
      success: true,
      tier: dbTierName,
      message: `Upgraded to ${dbTierName === 'pro-plus' ? 'Pro Plus' : 'Pro'}`,
    });
  } catch (error) {
    console.error('[UpgradeSubscription] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to upgrade subscription';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
