import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'dealsletter2024!';

export async function middleware(request: NextRequest) {
  // Check if the request is for the admin area
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization');
    const cookie = request.cookies.get('admin-auth');

    // Check if already authenticated via cookie
    if (cookie?.value === ADMIN_PASSWORD) {
      return NextResponse.next({ request });
    }

    // Check basic auth header
    if (authHeader) {
      const [type, credentials] = authHeader.split(' ');
      if (type === 'Basic' && credentials) {
        const decoded = Buffer.from(credentials, 'base64').toString();
        const [, password] = decoded.split(':');
        
        if (password === ADMIN_PASSWORD) {
          const response = NextResponse.next({ request });
          response.cookies.set('admin-auth', ADMIN_PASSWORD, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7 // 7 days
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')
  const isAdminUsers = request.nextUrl.pathname.startsWith('/auth/admin-users')
  const isHomePage = request.nextUrl.pathname === '/'
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const isTestApiPage = request.nextUrl.pathname === '/test-api'
  const isPropertySearchDemo = request.nextUrl.pathname === '/property-search-demo'
  const isContactPage = request.nextUrl.pathname === '/contact'
  const isFAQPage = request.nextUrl.pathname === '/faq'
  const isBlogPage = request.nextUrl.pathname.startsWith('/blog')
  const isPricingPage = request.nextUrl.pathname === '/pricing'

  // Allow API routes to pass through without authentication
  if (isApiRoute) {
    return supabaseResponse
  }

  // If user is not logged in and trying to access protected routes
  if (!user && !isAuthPage && !isHomePage && !isContactPage && !isFAQPage && !isBlogPage && !isPricingPage && !isTestApiPage && !isPropertySearchDemo) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in but email not verified and trying to access dashboard
  if (user && !user.email_confirmed_at && isDashboard) {
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
    url.pathname = '/dashboard'
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