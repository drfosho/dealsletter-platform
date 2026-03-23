import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Atomic claim: set welcome_email_sent = true ONLY if it's currently false.
    // Only one concurrent request can succeed — the others get 0 rows updated.
    const { data: claimed, error: claimError } = await supabase
      .from('user_profiles')
      .update({ welcome_email_sent: true } as Record<string, unknown>)
      .eq('id', user.id)
      .or('welcome_email_sent.is.null,welcome_email_sent.eq.false')
      .select('id')
      .maybeSingle();

    if (claimError) {
      // Column may not exist yet — fall through and send anyway
      console.warn('[WelcomeEmail] Claim query error (column may not exist):', claimError.message);
    } else if (!claimed) {
      console.log('[WelcomeEmail] Already sent for user:', user.id);
      return NextResponse.json({ sent: false, reason: 'already_sent' });
    }

    const name = (user.user_metadata?.full_name as string) ||
                 (user.user_metadata?.first_name as string) ||
                 undefined;

    console.log('[WelcomeEmail] Sending welcome email to:', user.email);
    const sent = await sendWelcomeEmail({
      email: user.email!,
      name,
    });

    return NextResponse.json({ sent });
  } catch (error) {
    console.error('[WelcomeEmail] Error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
