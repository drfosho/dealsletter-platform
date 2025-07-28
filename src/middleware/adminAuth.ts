import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'dealsletter2024!';

export function adminAuthMiddleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cookie = request.cookies.get('admin-auth');

  // Check if already authenticated via cookie
  if (cookie?.value === ADMIN_PASSWORD) {
    return NextResponse.next();
  }

  // Check basic auth header
  if (authHeader) {
    const [type, credentials] = authHeader.split(' ');
    if (type === 'Basic' && credentials) {
      const decoded = Buffer.from(credentials, 'base64').toString();
      const [, password] = decoded.split(':');
      
      if (password === ADMIN_PASSWORD) {
        const response = NextResponse.next();
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