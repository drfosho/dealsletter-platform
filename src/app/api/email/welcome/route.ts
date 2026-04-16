import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWelcomeEmail } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(_request: NextRequest) {
  try {
    // Use the user's session to get their identity
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use admin client (bypasses RLS) for the atomic claim
    const admin = createAdminClient();

    // Atomic claim: set welcome_email_sent = true ONLY if it's currently false/null.
    // Uses service role to bypass RLS. Only one concurrent request wins.
    const { data: claimed, error: claimError } = await admin
      .from('user_profiles')
      .update({ welcome_email_sent: true })
      .eq('id', user.id)
      .or('welcome_email_sent.is.null,welcome_email_sent.eq.false')
      .select('id')
      .maybeSingle();

    console.log('[WelcomeEmail] Claim result:', { claimed, claimError });

    if (claimError) {
      console.error('[WelcomeEmail] Claim error:', claimError.message);
      // If column doesn't exist, the error will contain "column" — skip dedup and send
      if (!claimError.message.includes('column')) {
        return NextResponse.json({ sent: false, error: claimError.message }, { status: 500 });
      }
    } else if (!claimed) {
      console.log('[WelcomeEmail] Already sent for user:', user.id);
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

    console.log('[WelcomeEmail] Sending welcome email to:', user.email);
    const sent = await sendWelcomeEmail({
      email: user.email!,
      name,
      subscribedNewsletter,
    });

    return NextResponse.json({ sent });
  } catch (error) {
    console.error('[WelcomeEmail] Error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
