import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAdminConfig } from '@/lib/admin-config';

// Canonical tier limits — single source of truth
const TIER_LIMITS: Record<string, number> = {
  free: 3,
  basic: 3,
  starter: 3,
  pro: 50,
  professional: 50,
  'pro-plus': 200,
  'pro_plus': 200,
  premium: 50,
  enterprise: 9999,
};

function getTierLimit(tier: string): number {
  return TIER_LIMITS[tier.toLowerCase()] ?? 3;
}

export async function GET(_request: NextRequest) {
  try {
    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Cookie setting may fail in certain contexts
            }
          },
        },
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminConfig = getAdminConfig(user.email);

    // If admin, return unlimited access
    if (adminConfig.bypassSubscriptionLimits) {
      return NextResponse.json({
        can_analyze: true,
        analyses_used: 0,
        tier_limit: 9999,
        remaining: 9999,
        subscription_tier: 'enterprise',
        subscription_status: 'active',
        message: 'Admin access - unlimited analyses',
        is_admin: true
      });
    }

    // Fetch subscription details from the subscriptions table
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier, status, trial_end, current_period_end')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .single();

    // Determine the effective tier and limit
    const effectiveTier = subscription?.tier?.toLowerCase().replace('_', '-') || 'free';
    const tierLimit = getTierLimit(effectiveTier);

    // Get current month usage count
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const { data: usageRow } = await supabase
      .from('usage_tracking')
      .select('analysis_count')
      .eq('user_id', user.id)
      .eq('month_year', currentMonth)
      .single();

    const analysesUsed = usageRow?.analysis_count ?? 0;
    const remaining = Math.max(tierLimit - analysesUsed, 0);
    const canAnalyze = remaining > 0;

    return NextResponse.json({
      can_analyze: canAnalyze,
      analyses_used: analysesUsed,
      tier_limit: tierLimit,
      remaining,
      subscription_tier: effectiveTier === 'free' || effectiveTier === 'basic' ? 'free' : effectiveTier,
      subscription_status: subscription?.status || 'inactive',
      trial_end: subscription?.trial_end || null,
      current_period_end: subscription?.current_period_end || null,
      is_admin: false,
      message: canAnalyze
        ? `${remaining} of ${tierLimit} analyses remaining this month`
        : `Monthly limit of ${tierLimit} analyses reached. Upgrade for more.`,
    });

  } catch (error) {
    console.error('Usage API Error:', error);
    return NextResponse.json(
      { error: 'Failed to check usage' },
      { status: 500 }
    );
  }
}
