// src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Public routes (no auth needed)
  const publicRoutes = ['/', '/login', '/register', '/privacy', '/terms', '/contact', '/tools'];
  const isPublicRoute = publicRoutes.includes(path);

  // Protected routes (need auth)
  const isProtectedRoute =
    path.startsWith('/influencer/') ||
    path.startsWith('/brand/') ||
    path.startsWith('/admin/');

  // No token → session refresh attempt + check
  const cookieNames = request.cookies.getAll().map((c) => c.name);
  const sessionCookie = cookieNames.find((name) => name.startsWith('sb-') && name.endsWith('-auth-token'));

  if (!sessionCookie) {
    // No auth session at all
    if (isProtectedRoute) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client bound to the request cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value }) => response.cookies.set(name, value));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Has a token but no valid user → treat as logged out
  if (!user) {
    if (isProtectedRoute) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Fetch role
  const { data: roleData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = roleData?.role || user.user_metadata?.role || 'influencer';

  const roleBase =
    role === 'admin' ? `/admin/${user.id}` : role === 'brand' ? `/brand/${user.id}` : `/influencer/${user.id}`;

  // Authenticated user accessing /login or /register → send to their dashboard
  if (path === '/login' || path === '/register') {
    return NextResponse.redirect(new URL(roleBase, request.url));
  }

  // Role-based access: user on wrong role path → redirect to their own dashboard
  const expectedBase =
    role === 'admin' ? `/admin/` : role === 'brand' ? `/brand/` : `/influencer/`;
  if (isProtectedRoute && !path.startsWith(expectedBase)) {
    return NextResponse.redirect(new URL(roleBase, request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
