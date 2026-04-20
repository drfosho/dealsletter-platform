'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

type AuthState =
  | { status: 'loading' }
  | { status: 'authed'; email: string | null; tier: string }
  | { status: 'unauthed' }

export default function V3Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [auth, setAuth] = useState<AuthState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (cancelled) return

      if (!session?.user) {
        setAuth({ status: 'unauthed' })
        router.replace('/v2/login')
        return
      }

      const tierRaw =
        (session.user.user_metadata?.tier as string | undefined) ||
        (session.user.app_metadata?.tier as string | undefined) ||
        'FREE'
      const tier = tierRaw.toUpperCase()

      setAuth({
        status: 'authed',
        email: session.user.email ?? null,
        tier,
      })
    }

    load()

    return () => {
      cancelled = true
    }
  }, [router])

  if (auth.status === 'loading' || auth.status === 'unauthed') {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--v3-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--v3-text-muted)',
          fontFamily: 'var(--v3-font-mono)',
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        {auth.status === 'loading' ? 'Authenticating…' : 'Redirecting…'}
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--v3-bg)',
        color: 'var(--v3-text)',
      }}
    >
      <Sidebar email={auth.email} tier={auth.tier} />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Topbar />
        <main
          style={{
            flex: 1,
            minWidth: 0,
            overflow: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
