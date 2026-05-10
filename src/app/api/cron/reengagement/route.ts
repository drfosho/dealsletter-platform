import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendReengagementEmail } from '@/lib/v2-emails'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_SENDS_PER_RUN = 50
// Pull a wider candidate pool than MAX_SENDS so we have enough to filter from
const CANDIDATE_POOL_SIZE = 500

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('[ReengagementCron] Admin client init failed:', err)
    return NextResponse.json({ error: 'admin_client_unavailable' }, { status: 500 })
  }

  const now = Date.now()
  const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString()
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Step 1: Candidates are profiles that have not yet received a re-engagement
  // email and signed up at least 24h ago. The 24h floor is required for GROUP A;
  // for GROUP B it's a no-op since 7d inactivity implies signup > 24h ago.
  const { data: candidates, error: profErr } = await admin
    .from('user_profiles')
    .select('id, first_name, subscription_tier, created_at')
    .eq('reengagement_email_sent', false)
    .lte('created_at', twentyFourHoursAgo)
    .order('created_at', { ascending: true })
    .limit(CANDIDATE_POOL_SIZE)

  if (profErr) {
    console.error('[ReengagementCron] Profile query failed:', profErr)
    return NextResponse.json({ error: profErr.message }, { status: 500 })
  }

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0, errors: 0, candidates: 0, targets: 0 })
  }

  const candidateIds = candidates.map(c => c.id)

  // Step 2: For each candidate, find their most recent v2_analysis_requests row.
  // No row = never ran (GROUP A candidate). Most recent <= 7d ago = inactive (GROUP B).
  const { data: activityRows, error: actErr } = await admin
    .from('v2_analysis_requests')
    .select('user_id, created_at')
    .in('user_id', candidateIds)
    .order('created_at', { ascending: false })

  if (actErr) {
    console.error('[ReengagementCron] Activity query failed:', actErr)
    return NextResponse.json({ error: actErr.message }, { status: 500 })
  }

  const lastActivityByUser = new Map<string, string>()
  for (const row of activityRows || []) {
    if (row.user_id && !lastActivityByUser.has(row.user_id)) {
      lastActivityByUser.set(row.user_id, row.created_at)
    }
  }

  // Step 3: Categorize candidates into GROUP A (never ran, free tier) or
  // GROUP B (ran, but most recent activity >= 7 days ago). Mutually exclusive.
  const targets: typeof candidates = []
  for (const profile of candidates) {
    const lastActivity = lastActivityByUser.get(profile.id)
    if (!lastActivity) {
      if (profile.subscription_tier === 'free') {
        targets.push(profile)
      }
    } else if (lastActivity <= sevenDaysAgo) {
      targets.push(profile)
    }
    if (targets.length >= MAX_SENDS_PER_RUN) break
  }

  // Step 4: For each target, look up email via auth admin, send, mark sent.
  let sent = 0
  let skipped = 0
  let errors = 0

  for (const profile of targets) {
    try {
      const { data: userRecord, error: userErr } =
        await admin.auth.admin.getUserById(profile.id)

      if (userErr || !userRecord?.user?.email) {
        console.warn('[ReengagementCron] No email for user:', profile.id, userErr?.message)
        skipped++
        continue
      }

      const ok = await sendReengagementEmail(
        userRecord.user.email,
        profile.first_name || undefined
      )

      if (!ok) {
        errors++
        continue
      }

      const { error: updateErr } = await admin
        .from('user_profiles')
        .update({ reengagement_email_sent: true })
        .eq('id', profile.id)

      if (updateErr) {
        console.error('[ReengagementCron] Failed to mark sent:', profile.id, updateErr)
        errors++
      } else {
        sent++
      }
    } catch (err) {
      console.error('[ReengagementCron] Error processing user:', profile.id, err)
      errors++
    }
  }

  return NextResponse.json({
    sent,
    skipped,
    errors,
    candidates: candidates.length,
    targets: targets.length,
  })
}
