import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reason, planName } = body;

    if (!reason || typeof reason !== 'string') {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    const validReasons = ['too_expensive', 'not_using_enough', 'missing_feature', 'taking_a_break'];
    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: 'Invalid reason' }, { status: 400 });
    }

    const { error: insertError } = await supabase
      .from('cancellation_feedback')
      .insert({
        user_id: user.id,
        reason,
        plan_name: planName || null,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('[CancelFeedback] Insert error:', JSON.stringify(insertError, null, 2));
      console.error('[CancelFeedback] Error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      });
      return NextResponse.json({ saved: false, error: insertError.message });
    }

    console.log(`[CancelFeedback] Saved feedback for ${user.id}: ${reason} (plan: ${planName || 'unknown'})`);
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error('[CancelFeedback] Error:', error instanceof Error ? error.message : JSON.stringify(error));
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
  }
}
