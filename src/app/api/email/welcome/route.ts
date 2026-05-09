import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWelcomeEmail } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(_request: NextRequest) {
  console.log('[WelcomeEmail] Route hit');

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('[WelcomeEmail] Auth check:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authError: authError?.message,
    });

    if (authError || !user) {
      console.log('[WelcomeEmail] BLOCKED — no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();

    const { data: claimed, error: claimError } = await admin
      .from('user_profiles')
      .update({ welcome_email_sent: true })
      .eq('id', user.id)
      .not('welcome_email_sent', 'is', true)
      .select('id')
      .maybeSingle();

    console.log('[WelcomeEmail] Claim:', {
      claimed: !!claimed,
      claimError: claimError?.message,
    });

    if (claimError) {
      console.error('[WelcomeEmail] Claim error:', claimError.message);
      if (!claimError.message.includes('column')) {
        return NextResponse.json(
          { sent: false, error: claimError.message },
          { status: 500 }
        );
      }
    } else if (!claimed) {
      console.log('[WelcomeEmail] Already sent');
      return NextResponse.json({ sent: false, reason: 'already_sent' });
    }

    const { data: profile } = await admin
      .from('user_profiles')
      .select('first_name')
      .eq('id', user.id)
      .single();

    const name = (user.user_metadata?.first_name as string) ||
                 profile?.first_name ||
                 (user.user_metadata?.full_name as string)?.split(' ')[0] ||
                 'there';

    const subscribedNewsletter = user.user_metadata?.newsletter_subscribed === true;

    console.log('[WelcomeEmail] Sending to:', user.email, { name, subscribedNewsletter });

    const sent = await sendWelcomeEmail({
      email: user.email!,
      name,
      subscribedNewsletter,
    });

    console.log('[WelcomeEmail] Result:', sent);

    return NextResponse.json({ sent });

  } catch (error) {
    console.error('[WelcomeEmail] Caught error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
