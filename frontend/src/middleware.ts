import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Skip middleware for API routes and static files
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.includes('.') ||
    request.nextUrl.pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Let the select-role page handle its own logic
  if (request.nextUrl.pathname === '/select-role') {
    return NextResponse.next();
  }

  // For student and clinic routes, let them pass (role checking happens in the components)
  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
