import { createClient } from '@supabase/supabase-js'

// Admin client with service role key - bypasses RLS
// ONLY use this for server-side operations like webhooks where there's no user session
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Function to create admin client (alternative to direct import)
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.error('[SupabaseAdmin] Missing environment variables:')
    console.error('[SupabaseAdmin]   NEXT_PUBLIC_SUPABASE_URL:', url ? 'set' : 'MISSING')
    console.error('[SupabaseAdmin]   SUPABASE_SERVICE_ROLE_KEY:', serviceKey ? 'set' : 'MISSING')
    throw new Error('Supabase admin client configuration missing')
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
