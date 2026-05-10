import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { sendReengagementEmail } from '../src/lib/v2-emails'

// One-time broadcast for users who signed up before the cron existed.
// Sends the re-engagement email to every user who has never run an analysis
// AND has reengagement_email_sent = false. No time filter.
//
// Run with: npx tsx scripts/send-reengagement-broadcast.ts

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY — cannot send emails')
    process.exit(1)
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Pull all profiles that have not yet been sent the re-engagement email.
  const { data: candidates, error: profErr } = await supabase
    .from('user_profiles')
    .select('id, first_name')
    .eq('reengagement_email_sent', false)

  if (profErr) {
    console.error('Profile query failed:', profErr)
    process.exit(1)
  }
  if (!candidates || candidates.length === 0) {
    console.log('No candidates with reengagement_email_sent = false')
    return
  }

  console.log(`Pulled ${candidates.length} candidate profiles`)

  // Filter to users who have never made an analysis request.
  const candidateIds = candidates.map(c => c.id)
  const everActive = new Set<string>()

  // Chunk the IN filter to avoid massive query strings.
  const CHUNK = 200
  for (let i = 0; i < candidateIds.length; i += CHUNK) {
    const chunk = candidateIds.slice(i, i + CHUNK)
    const { data: activeRows, error: actErr } = await supabase
      .from('v2_analysis_requests')
      .select('user_id')
      .in('user_id', chunk)

    if (actErr) {
      console.error('Activity query failed:', actErr)
      process.exit(1)
    }
    for (const r of activeRows || []) {
      if (r.user_id) everActive.add(r.user_id)
    }
  }

  const targets = candidates.filter(c => !everActive.has(c.id))
  console.log(`After filtering for never-ran: ${targets.length} target(s)`)

  let sent = 0
  let skipped = 0
  let errors = 0

  for (const profile of targets) {
    const { data: userRecord, error: userErr } =
      await supabase.auth.admin.getUserById(profile.id)

    if (userErr || !userRecord?.user?.email) {
      console.warn(`Skipping ${profile.id}: no email (${userErr?.message ?? 'no record'})`)
      skipped++
      continue
    }

    const ok = await sendReengagementEmail(
      userRecord.user.email,
      profile.first_name || undefined
    )

    if (!ok) {
      console.warn(`Send failed for ${profile.id}`)
      errors++
      continue
    }

    const { error: updErr } = await supabase
      .from('user_profiles')
      .update({ reengagement_email_sent: true })
      .eq('id', profile.id)

    if (updErr) {
      console.error(`Failed to mark sent for ${profile.id}:`, updErr)
      errors++
    } else {
      sent++
    }

    // Pace at ~5/sec to stay under Resend default rate limits.
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`Done. sent=${sent} skipped=${skipped} errors=${errors}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
