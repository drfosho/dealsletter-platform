import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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
  const isContactPage = request.nextUrl.pathname === '/contact'
  const isFAQPage = request.nextUrl.pathname === '/faq'
  const isBlogPage = request.nextUrl.pathname.startsWith('/blog')

  // If user is not logged in and trying to access protected routes
  if (!user && !isAuthPage && !isApiRoute && !isHomePage && !isContactPage && !isFAQPage && !isBlogPage) {
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