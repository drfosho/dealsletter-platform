import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';

/**
 * Shared API route authentication helper.
 * Returns the authenticated user or a 401 NextResponse.
 *
 * Usage:
 *   const auth = await requireAuth();
 *   if (auth.error) return auth.error;
 *   const user = auth.user;
 */
export async function requireAuth(): Promise<
  { user: User; error: null } | { user: null; error: NextResponse }
> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Cookie setting may fail in certain contexts; allow getUser to continue
          }
        },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { user, error: null };
}
