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

    const name = (user.user_metadata?.full_name as string) ||
                 (user.user_metadata?.first_name as string) ||
                 undefined;

    // Check if welcome email was already sent (dedup)
    // Query may fail if welcome_email_sent column doesn't exist yet — that's OK, just send
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('welcome_email_sent')
      .eq('id', user.id)
      .single();

    if (profile?.welcome_email_sent) {
      console.log('[WelcomeEmail] Already sent for user:', user.id);
      return NextResponse.json({ sent: false, reason: 'already_sent' });
    }

    console.log('[WelcomeEmail] Sending welcome email to:', user.email);
    const sent = await sendWelcomeEmail({
      email: user.email!,
      name,
    });

    // Mark as sent so we don't send duplicates (ignore error if column doesn't exist)
    if (sent) {
      await supabase
        .from('user_profiles')
        .update({ welcome_email_sent: true } as Record<string, unknown>)
        .eq('id', user.id);
    }

    return NextResponse.json({ sent });
  } catch (error) {
    console.error('[WelcomeEmail] Error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
