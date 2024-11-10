import { routeAccessMap } from '@/lib/settings';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Create matchers for routes using RegExp
const matchers = Object.entries(routeAccessMap).map(([route, allowedRoles]) => ({
  pattern: new RegExp(`^${route}$`),
  allowedRoles,
}));

const publicRoutes = ['/', '/register'];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;

  // Check if route is public
  if (publicRoutes.includes(path)) {
    return NextResponse.next();
  }

  // Check if path is a protected route
  const isProtectedRoute = path.startsWith('/list/') || 
    matchers.some(({ pattern }) => pattern.test(path));

  // If it's a protected route and no token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If there's no token for any non-public route
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check permissions for authenticated users
  if (isProtectedRoute) {
    const role = token.role as string;
    for (const { pattern, allowedRoles } of matchers) {
      if (pattern.test(path) && !allowedRoles.includes(role)) {
        return NextResponse.redirect(
          new URL(`/${role === 'admin' ? 'admin' : 'list/home'}`, request.url)
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
