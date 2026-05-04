import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Basic rate limiting map (note: this is per-instance in serverless environments)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const RATE_LIMIT = 100; // requests
const WINDOW_MS = 60 * 1000; // 1 minute

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
  const now = Date.now();
  
  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const rateData = rateLimitMap.get(ip) ?? { count: 0, lastReset: now };
    
    if (now - rateData.lastReset > WINDOW_MS) {
      rateData.count = 1;
      rateData.lastReset = now;
    } else {
      rateData.count++;
    }
    
    rateLimitMap.set(ip, rateData);
    
    if (rateData.count > RATE_LIMIT) {
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: { 'Retry-After': '60' }
      });
    }
  }

  const response = NextResponse.next();

  // Additional security headers that can be set via middleware
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
