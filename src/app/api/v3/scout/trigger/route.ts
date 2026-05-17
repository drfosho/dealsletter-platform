import { NextRequest, NextResponse } from 'next/server'
import { inngest } from '@/lib/inngest'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await inngest.send({
      name: 'scout/manual.trigger',
      data: { triggeredBy: user.id, manual: true },
    })

    return NextResponse.json({
      success: true,
      message: 'Scout run triggered. Check Inngest dashboard → Runs in ~10 seconds.',
    })
  } catch (err) {
    console.error('Scout trigger error:', err)
    return NextResponse.json({ error: 'Failed to trigger scout' }, { status: 500 })
  }
}
