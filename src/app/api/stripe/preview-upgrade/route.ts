import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetTier, billingPeriod = 'monthly' } = await request.json();

    // Get user's current subscription
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_subscription_id, stripe_customer_id, subscription_tier')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_subscription_id || !profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // Get the target price ID
    const normalizedTier = (targetTier || '').toUpperCase().replace(/-/g, '_');
    const isYearly = billingPeriod === 'yearly' || billingPeriod === 'annual';
    let targetPriceId: string | undefined;

    if (normalizedTier === 'PRO_PLUS' || normalizedTier === 'PROPLUS') {
      targetPriceId = isYearly
        ? process.env.STRIPE_PRICE_PRO_PLUS_YEARLY
        : process.env.STRIPE_PRICE_PRO_PLUS_MONTHLY;
    } else if (normalizedTier === 'PRO') {
      targetPriceId = isYearly
        ? process.env.STRIPE_PRICE_PRO_YEARLY
        : process.env.STRIPE_PRICE_PRO_MONTHLY;
    }

    if (!targetPriceId) {
      return NextResponse.json({ error: 'Invalid target tier' }, { status: 400 });
    }

    // Get current subscription to find the item to replace
    const subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);
    const currentItem = subscription.items.data[0];

    if (!currentItem) {
      return NextResponse.json({ error: 'No subscription item found' }, { status: 400 });
    }

    // Preview the proration using invoice preview (createPreview in newer Stripe SDK)
    const upcomingInvoice = await stripe.invoices.createPreview({
      customer: profile.stripe_customer_id,
      subscription: profile.stripe_subscription_id,
      subscription_details: {
        items: [
          {
            id: currentItem.id,
            price: targetPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
      },
    });

    // Calculate the proration amount (what they'll be charged today)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lines = (upcomingInvoice.lines?.data || []) as any[];
    const prorationAmount = lines
      .filter(line => line.proration)
      .reduce((sum, line) => sum + (line.amount as number), 0);

    // Get the new recurring amount
    const newMonthlyAmount = lines
      .filter(line => !line.proration)
      .reduce((sum, line) => sum + (line.amount as number), 0);

    console.log('[PreviewUpgrade] Proration preview:', {
      currentTier: profile.subscription_tier,
      targetTier,
      prorationAmount: prorationAmount / 100,
      newMonthlyAmount: newMonthlyAmount / 100,
      totalDue: (upcomingInvoice.amount_due || 0) / 100,
    });

    return NextResponse.json({
      prorationAmount: prorationAmount / 100, // Convert cents to dollars
      newRecurringAmount: newMonthlyAmount / 100,
      totalDueToday: (upcomingInvoice.amount_due || 0) / 100,
      currency: upcomingInvoice.currency,
      currentTier: profile.subscription_tier,
      targetTier,
    });
  } catch (error) {
    console.error('[PreviewUpgrade] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to preview upgrade';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
