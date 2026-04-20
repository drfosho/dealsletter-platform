import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const ALLOWED_STATUSES = ['Watching', 'Reviewing', 'Strong Buy', 'Passed', 'Saved']

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const dealId = body?.dealId as string | undefined
    const status = body?.status as string | undefined

    if (!dealId || !status) {
      return NextResponse.json(
        { error: 'dealId and status are required' },
        { status: 400 }
      )
    }
    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    // TODO: once analyzed_properties has a dedicated pipeline_status column,
    // update it directly. For now we persist the value inside analysis_data
    // (a JSONB column) so we do not have to migrate the schema.
    const { data: existing, error: fetchError } = await supabase
      .from('analyzed_properties')
      .select('analysis_data')
      .eq('id', dealId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    const merged = {
      ...(existing.analysis_data || {}),
      v3_pipeline_status: status,
    }

    const { error: updateError } = await supabase
      .from('analyzed_properties')
      .update({ analysis_data: merged })
      .eq('id', dealId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Pipeline status update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Pipeline status unexpected error:', err)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
