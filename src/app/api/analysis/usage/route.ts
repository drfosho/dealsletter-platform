import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAdminConfig } from '@/lib/admin-config';

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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
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
        message: 'Admin access - unlimited analyses',
        is_admin: true
      });
    }

    // Check user's usage limits
    const { data: usageData, error: usageError } = await supabase
      .rpc('can_user_analyze', { p_user_id: user.id });
    
    if (usageError) {
      console.error('Usage check error:', usageError);
      // Return default values if function fails
      return NextResponse.json({
        can_analyze: true,
        analyses_used: 0,
        tier_limit: 3,
        remaining: 3,
        subscription_tier: 'free',
        message: 'Usage check unavailable'
      });
    }

    return NextResponse.json(usageData);

  } catch (error) {
    console.error('Usage API Error:', error);
    return NextResponse.json(
      { error: 'Failed to check usage' },
      { status: 500 }
    );
  }
}