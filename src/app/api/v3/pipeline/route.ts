import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(_request: NextRequest) {
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

    const { data, error } = await supabase
      .from('analyzed_properties')
      .select('id, address, deal_type, analysis_date, created_at, roi, profit, is_favorite, analysis_data')
      .eq('user_id', user.id)
      .order('analysis_date', { ascending: false })

    if (error) {
      console.error('Pipeline list error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch pipeline' },
        { status: 500 }
      )
    }

    const deals = (data || []).map(row => {
      const ad = (row.analysis_data || {}) as Record<string, unknown>
      const m = (ad.metrics || {}) as Record<string, number | null | undefined>
      const cf = (ad.cashFlow || {}) as Record<string, number | null | undefined>
      const aiMetrics =
        ((ad.ai_analysis as Record<string, unknown> | undefined)?.financial_metrics as
          | Record<string, number | null | undefined>
          | undefined) || {}
      return {
        id: row.id,
        address: row.address,
        strategy: (ad.strategy as string | undefined) || row.deal_type || 'Buy & Hold',
        signal: (ad.signal as string | undefined) || null,
        dealScore: (ad.dealScore as number | undefined) ?? null,
        cap: m.capRate ?? aiMetrics.cap_rate ?? null,
        coc: m.cashOnCash ?? aiMetrics.cash_on_cash_return ?? null,
        cashFlow: cf.monthly ?? aiMetrics.monthly_cash_flow ?? null,
        roi: row.roi ?? m.roi ?? null,
        addedDate: row.analysis_date || row.created_at,
        status: (ad.v3_pipeline_status as string | undefined) || 'Watching',
        isFavorite: !!row.is_favorite,
      }
    })

    return NextResponse.json({ deals })
  } catch (err) {
    console.error('Pipeline list unexpected error:', err)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
