// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('sb-access-token')?.value;
  const path = request.nextUrl.pathname;
  
  // Public routes (no auth needed)
  const publicRoutes = ['/', '/login', '/register', '/privacy', '/terms', '/contact'];
  const isPublicRoute = publicRoutes.includes(path);
  
  // Protected routes (need auth)
  const isProtectedRoute = 
    path.startsWith('/influencer/') ||
    path.startsWith('/brand/') ||
    path.startsWith('/admin/');
  
  // No token + trying to access protected route → redirect to login
  if (!token && isProtectedRoute && !isPublicRoute) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }
  
  // Has token + trying to access login/register → redirect to home
  if (token && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};