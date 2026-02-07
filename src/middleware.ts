import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

// SEC-001: Require ADMIN_PASSWORD from environment - no fallback
function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD
  if (!password) {
    throw new Error('ADMIN_PASSWORD environment variable is required but not set')
  }
  if (password.length < 16) {
    throw new Error('ADMIN_PASSWORD must be at least 16 characters')
  }
  return password
}

// SEC-002: Generate secure session token instead of storing password
function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

// SEC-002: Create HMAC signature for session validation
function signSessionToken(token: string, password: string): string {
  return createHmac('sha256', password).update(token).digest('hex')
}

// SEC-002: Timing-safe password comparison
function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do a comparison to maintain constant time
    const dummy = Buffer.from(a)
    timingSafeEqual(dummy, dummy)
    return false
  }
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export async function middleware(request: NextRequest) {
  // Allow API routes to pass through without middleware auth (they handle their own auth)
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next({ request });
  }

  // Check if the request is for the admin area (non-API)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    let adminPassword: string
    try {
      adminPassword = getAdminPassword()
    } catch (error) {
      console.error('[Admin Auth] Configuration error:', (error as Error).message)
      return new NextResponse('Server configuration error', { status: 500 })
    }

    const authHeader = request.headers.get('authorization');
    const sessionCookie = request.cookies.get('admin-session');
    const signatureCookie = request.cookies.get('admin-session-sig');

    // SEC-002: Check if already authenticated via signed session cookie
    if (sessionCookie?.value && signatureCookie?.value) {
      const expectedSig = signSessionToken(sessionCookie.value, adminPassword)
      if (secureCompare(signatureCookie.value, expectedSig)) {
        return NextResponse.next({ request });
      }
    }

    // Check basic auth header
    if (authHeader) {
      const [type, credentials] = authHeader.split(' ');
      if (type === 'Basic' && credentials) {
        const decoded = Buffer.from(credentials, 'base64').toString();
        const [, password] = decoded.split(':');

        // SEC-002: Use timing-safe comparison for password
        if (password && secureCompare(password, adminPassword)) {
          const response = NextResponse.next({ request });

          // SEC-002: Generate signed session token instead of storing password
          const sessionToken = generateSessionToken()
          const sessionSig = signSessionToken(sessionToken, adminPassword)

          response.cookies.set('admin-session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 4 // SEC-002: Reduced to 4 hours
          });
          response.cookies.set('admin-session-sig', sessionSig, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 4
          });
          return response;
        }
      }
    }

    // Require authentication
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Area"'
      }
    });
  }
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    console.error('[Middleware] Failed to fetch user session:', (error as Error).message)
    // If Supabase is unreachable, treat as unauthenticated rather than crashing
  }

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isAnalysisPage = request.nextUrl.pathname.startsWith('/analysis')
  const isAdminUsers = request.nextUrl.pathname.startsWith('/auth/admin-users')
  const isHomePage = request.nextUrl.pathname === '/'
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const isContactPage = request.nextUrl.pathname === '/contact'
  const isFAQPage = request.nextUrl.pathname === '/faq'
  const isBlogPage = request.nextUrl.pathname.startsWith('/blog')
  const isPricingPage = request.nextUrl.pathname === '/pricing'
  const isAccountPage = request.nextUrl.pathname.startsWith('/account')

  // Allow API routes to pass through without authentication
  if (isApiRoute) {
    return supabaseResponse
  }

  // Public routes that don't require authentication
  const isPublicRoute = isHomePage || isAuthPage || isContactPage || isFAQPage || isBlogPage || isPricingPage

  // If user is not logged in and trying to access protected routes
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in but email not verified and trying to access analysis or account
  if (user && !user.email_confirmed_at && (isAnalysisPage || isAccountPage)) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/verify-email'
    url.searchParams.set('email', user.email!)
    return NextResponse.redirect(url)
  }

  // If user is logged in and verified, redirect away from auth pages (except admin and verification pages)
  if (user && user.email_confirmed_at && isAuthPage && !isAdminUsers) {
    // Don't redirect from verification pages if user just verified
    if (request.nextUrl.pathname.includes('verify-success') ||
        request.nextUrl.pathname.includes('callback') ||
        request.nextUrl.pathname.includes('verify-email')) {
      return supabaseResponse
    }
    const url = request.nextUrl.clone()
    url.pathname = '/analysis'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() you must:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the response object you're returning to `myNewResponse`
  //    More details: https://supabase.com/docs/guides/auth/server-side/nextjs

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}