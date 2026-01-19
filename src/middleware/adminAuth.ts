import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

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
    const dummy = Buffer.from(a)
    timingSafeEqual(dummy, dummy)
    return false
  }
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export function adminAuthMiddleware(request: NextRequest) {
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
      return NextResponse.next();
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
        const response = NextResponse.next();

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