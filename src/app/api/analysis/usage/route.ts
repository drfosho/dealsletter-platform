import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAdminConfig } from '@/lib/admin-config';
import { FREE_MONTHLY_ANALYSIS_LIMIT } from '@/lib/constants';

// Canonical tier limits — single source of truth
// `null` means "no monthly cap" (paid tiers)
const TIER_LIMITS: Record<string, number | null> = {
  free: FREE_MONTHLY_ANALYSIS_LIMIT,
  basic: FREE_MONTHLY_ANALYSIS_LIMIT,
  starter: FREE_MONTHLY_ANALYSIS_LIMIT,
  pro: null,
  professional: null,
  'pro-plus': null,
  'pro_plus': null,
  premium: null,
  enterprise: null,
};

function getTierLimit(tier: string): number | null {
  const key = tier.toLowerCase();
  if (key in TIER_LIMITS) return TIER_LIMITS[key];
  return FREE_MONTHLY_ANALYSIS_LIMIT;
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
        tier_limit: null,
        remaining: null,
        subscription_tier: 'enterprise',
        subscription_status: 'active',
        message: 'Admin access - unlimited analyses',
        is_admin: true,
        analyses_this_month: 0,
        monthly_limit: null,
        monthly_remaining: null,
        is_limited: false,
      });
    }

    // Check user_profiles first (primary source — updated by Stripe webhook)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_tier, subscription_status, current_period_end')
      .eq('id', user.id)
      .single();

    // Also check subscriptions table as fallback
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier, status, trial_end, current_period_end')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Use the higher (more permissive) tier from either source.
    // null = unlimited beats any numeric limit.
    const profileTier = profile?.subscription_tier?.toLowerCase().replace('_', '-') || 'free';
    const subsTier = subscription?.tier?.toLowerCase().replace('_', '-') || 'free';
    const profileLimit = getTierLimit(profileTier);
    const subsLimit = getTierLimit(subsTier);

    // null > any number for "more permissive". If both are null, either tier works.
    let effectiveTier: string;
    let tierLimit: number | null;
    if (profileLimit === null && subsLimit === null) {
      effectiveTier = profileTier !== 'free' ? profileTier : subsTier;
      tierLimit = null;
    } else if (profileLimit === null) {
      effectiveTier = profileTier;
      tierLimit = null;
    } else if (subsLimit === null) {
      effectiveTier = subsTier;
      tierLimit = null;
    } else {
      effectiveTier = profileLimit >= subsLimit ? profileTier : subsTier;
      tierLimit = Math.max(profileLimit, subsLimit);
    }

    // Legacy counter (all-time-ish) — kept for backward compat with any UI
    // that still reads analyses_used. Source: usage_tracking.analysis_count.
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const { data: usageRow } = await supabase
      .from('usage_tracking')
      .select('analysis_count')
      .eq('user_id', user.id)
      .eq('month_year', currentMonth)
      .single();

    const analysesUsed = usageRow?.analysis_count ?? 0;

    // Source of truth for the free-tier monthly cap:
    // count completed analyses in analyzed_properties since the 1st of the month.
    // This matches what /api/v2/property-data uses for gating.
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: monthlyCount } = await supabase
      .from('analyzed_properties')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('analysis_data->>status', 'completed')
      .gte('created_at', startOfMonth.toISOString());

    const analysesThisMonth = monthlyCount || 0;

    const isFree = effectiveTier === 'free' || !effectiveTier;
    const monthlyLimit = isFree ? FREE_MONTHLY_ANALYSIS_LIMIT : null;
    const monthlyRemaining = monthlyLimit !== null
      ? Math.max(0, monthlyLimit - analysesThisMonth)
      : null;

    // canAnalyze is based on the monthly cap for free, always true for paid
    const canAnalyze = monthlyLimit === null || monthlyRemaining! > 0;

    // Backward-compat numeric "remaining" — for paid tiers there's no cap,
    // surface it as null in the new fields and keep legacy fields stable.
    const legacyRemaining = tierLimit !== null
      ? Math.max(tierLimit - analysesUsed, 0)
      : null;

    return NextResponse.json({
      can_analyze: canAnalyze,
      analyses_used: analysesUsed,
      tier_limit: tierLimit,
      remaining: legacyRemaining,
      subscription_tier: effectiveTier === 'free' || effectiveTier === 'basic' ? 'free' : effectiveTier,
      subscription_status: subscription?.status || profile?.subscription_status || 'inactive',
      trial_end: subscription?.trial_end || null,
      current_period_end: subscription?.current_period_end || profile?.current_period_end || null,
      is_admin: false,
      // New canonical fields — UI should prefer these
      analyses_this_month: analysesThisMonth,
      monthly_limit: monthlyLimit,
      monthly_remaining: monthlyRemaining,
      is_limited: isFree,
      message: canAnalyze
        ? (monthlyLimit !== null
            ? `${monthlyRemaining} of ${monthlyLimit} free analyses remaining this month`
            : 'Unlimited analyses on your plan')
        : `Monthly limit of ${monthlyLimit} analyses reached. Upgrade for more.`,
    });

  } catch (error) {
    console.error('Usage API Error:', error);
    return NextResponse.json(
      { error: 'Failed to check usage' },
      { status: 500 }
    );
  }
}
