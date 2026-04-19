import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { hashToken } from '@/lib/auth-utils'

export async function middleware(request: NextRequest) {
  // Only protect /api/ routes, but exclude /api/auth
  if (request.nextUrl.pathname.startsWith('/api/') && !request.nextUrl.pathname.startsWith('/api/auth/')) {
    
    // 1. Check for cookie (Browser)
    const cookieValue = request.cookies.get('auth_token')?.value;
    const correctPassword = process.env.FRONTEND_PASSWORD || process.env.API_KEY || '';
    const hashedCorrectPassword = await hashToken(correctPassword);
    const hasValidCookie = Boolean(cookieValue && hashedCorrectPassword && cookieValue === hashedCorrectPassword);
    
    // 2. Check for API key in header (Postman / programmatic)
    const apiKeyHeader = request.headers.get('x-api-key');
    const validApiKey = process.env.API_KEY || '';
    const hasValidHeader = Boolean(apiKeyHeader && validApiKey && apiKeyHeader === validApiKey);

    if (!hasValidCookie && !hasValidHeader) {
      return NextResponse.json({ error: "Unauthorized - Vault locked" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
}
