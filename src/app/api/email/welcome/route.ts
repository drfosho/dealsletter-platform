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
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('welcome_email_sent')
      .eq('id', user.id)
      .single();

    if (profile?.welcome_email_sent) {
      console.log('[WelcomeEmail] Already sent for user:', user.id);
      return NextResponse.json({ sent: false, reason: 'already_sent' });
    }

    const sent = await sendWelcomeEmail({
      email: user.email!,
      name,
    });

    // Mark as sent so we don't send duplicates
    if (sent) {
      await supabase
        .from('user_profiles')
        .update({ welcome_email_sent: true })
        .eq('id', user.id);
    }

    return NextResponse.json({ sent });
  } catch (error) {
    console.error('[WelcomeEmail] Error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
