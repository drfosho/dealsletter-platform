'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'

export type V3Tier = 'free' | 'pro' | 'pro_max'

export type V3TierState =
  | { status: 'loading' }
  | {
      status: 'ready'
      tier: V3Tier
      rawTier: string | null
      email: string | null
      userId: string | null
      firstName: string
    }
  | { status: 'anonymous' }

function normalizeTier(raw: string | null | undefined): V3Tier {
  const t = (raw || 'free').toLowerCase()
  if (t === 'pro-plus' || t === 'pro_plus' || t === 'premium' || t === 'pro_max' || t === 'pro-max') return 'pro_max'
  if (t === 'pro' || t === 'professional') return 'pro'
  return 'free'
}

function firstNameFromUser(meta: Record<string, unknown> | null | undefined, email: string | null): string {
  const m = meta || {}
  const first = (m.first_name as string | undefined) || (m.firstName as string | undefined)
  if (first) return first
  const full = (m.full_name as string | undefined) || (m.name as string | undefined)
  if (full) return full.split(' ')[0]
  if (email) return email.split('@')[0]
  return 'there'
}

export function useV3Tier(): V3TierState {
  const { user, loading } = useUser()
  const [rawTier, setRawTier] = useState<string | null>(null)
  const [tierLoading, setTierLoading] = useState(true)

  useEffect(() => {
    if (loading) return
    if (!user) {
      setTierLoading(false)
      return
    }
    let cancelled = false
    const run = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('user_profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()
      if (cancelled) return
      setRawTier((data?.subscription_tier as string | undefined) ?? 'free')
      setTierLoading(false)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [user, loading])

  if (loading) return { status: 'loading' }
  if (!user) return { status: 'anonymous' }
  if (tierLoading) return { status: 'loading' }

  return {
    status: 'ready',
    tier: normalizeTier(rawTier),
    rawTier,
    email: user.email ?? null,
    userId: user.id,
    firstName: firstNameFromUser(user.user_metadata as Record<string, unknown> | null, user.email ?? null),
  }
}
