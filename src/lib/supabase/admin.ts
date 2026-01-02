import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy-initialized admin client (created on first use, not at module load)
let supabaseAdminInstance: SupabaseClient | null = null

// Function to create admin client - uses SERVICE_ROLE_KEY to bypass RLS
// ONLY use this for server-side operations like webhooks where there's no user session
export function createAdminClient(): SupabaseClient {
  // Return cached instance if already created
  if (supabaseAdminInstance) {
    return supabaseAdminInstance
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.error('[SupabaseAdmin] Missing environment variables:')
    console.error('[SupabaseAdmin]   NEXT_PUBLIC_SUPABASE_URL:', url ? 'set' : 'MISSING')
    console.error('[SupabaseAdmin]   SUPABASE_SERVICE_ROLE_KEY:', serviceKey ? 'set' : 'MISSING')
    throw new Error('Supabase admin client configuration missing. Check SUPABASE_SERVICE_ROLE_KEY in Vercel.')
  }

  supabaseAdminInstance = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('[SupabaseAdmin] Admin client created successfully')
  return supabaseAdminInstance
}
