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
