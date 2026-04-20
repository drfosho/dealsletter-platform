import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
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
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    const {
      address,
      strategy,
      metrics,
      signal,
      dealScore,
      propertyData,
      aiAnalysis,
      cashFlow,
      proForma,
    } = body as Record<string, unknown>

    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'Address required' }, { status: 400 })
    }
    if (!strategy || typeof strategy !== 'string') {
      return NextResponse.json({ error: 'Strategy required' }, { status: 400 })
    }

    const m = (metrics as Record<string, number | null | undefined>) || {}
    const cf = (cashFlow as Record<string, number | null | undefined>) || {}

    const analysisData = {
      strategy,
      signal,
      dealScore,
      metrics,
      cashFlow,
      proForma,
      property_data: propertyData,
      ai_analysis: aiAnalysis,
      v3_pipeline_status: 'Watching',
      v3_saved_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('analyzed_properties')
      .insert({
        user_id: user.id,
        address,
        deal_type: strategy,
        analysis_date: new Date().toISOString(),
        analysis_data: analysisData,
        roi: m.roi ?? m.fiveYearROI ?? null,
        profit: m.profit ?? cf.annualCashFlow ?? null,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Pipeline save error:', error)
      return NextResponse.json(
        { error: 'Failed to save deal' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err) {
    console.error('Pipeline save unexpected error:', err)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
