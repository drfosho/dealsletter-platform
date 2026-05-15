import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTrialEndingEmail } from '@/lib/v2-emails'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_SENDS_PER_RUN = 200

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('[TrialEndingCron] Admin client init failed:', err)
    return NextResponse.json({ error: 'admin_client_unavailable' }, { status: 500 })
  }

  const now = new Date()
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  // Find users currently trialing whose trial ends within the next 3 days
  // and who have not yet been emailed about it.
  const { data: candidates, error: queryErr } = await admin
    .from('user_profiles')
    .select('id, first_name, current_period_end')
    .eq('subscription_status', 'trialing')
    .gte('current_period_end', now.toISOString())
    .lte('current_period_end', threeDaysFromNow.toISOString())
    .not('trial_ending_email_sent', 'is', true)
    .order('current_period_end', { ascending: true })
    .limit(MAX_SENDS_PER_RUN)

  if (queryErr) {
    console.error('[TrialEndingCron] Profile query failed:', queryErr)
    return NextResponse.json({ error: queryErr.message }, { status: 500 })
  }

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0, errors: 0, candidates: 0 })
  }

  let sent = 0
  let skipped = 0
  let errors = 0

  for (const profile of candidates) {
    try {
      const { data: userRecord, error: userErr } =
        await admin.auth.admin.getUserById(profile.id)

      if (userErr || !userRecord?.user?.email) {
        console.warn('[TrialEndingCron] No email for user:', profile.id, userErr?.message)
        skipped++
        continue
      }

      // Round up partial days; ensure at least 1 so we never send "0 days"
      const periodEnd = new Date(profile.current_period_end as unknown as string)
      const msLeft = periodEnd.getTime() - Date.now()
      const daysLeft = Math.max(1, Math.ceil(msLeft / (24 * 60 * 60 * 1000)))

      // Atomic claim: only the row that flips the flag actually sends. Prevents
      // duplicate sends if two cron runs overlap.
      const { data: claimed } = await admin
        .from('user_profiles')
        .update({ trial_ending_email_sent: true })
        .eq('id', profile.id)
        .not('trial_ending_email_sent', 'is', true)
        .select('id')
        .maybeSingle()

      if (!claimed) {
        skipped++
        continue
      }

      const ok = await sendTrialEndingEmail(
        userRecord.user.email,
        profile.first_name || undefined,
        daysLeft
      )

      if (!ok) {
        // Roll back the claim so a future run can retry
        await admin
          .from('user_profiles')
          .update({ trial_ending_email_sent: false })
          .eq('id', profile.id)
        errors++
        continue
      }

      sent++
    } catch (err) {
      console.error('[TrialEndingCron] Error processing user:', profile.id, err)
      errors++
    }
  }

  return NextResponse.json({
    sent,
    skipped,
    errors,
    candidates: candidates.length,
  })
}
