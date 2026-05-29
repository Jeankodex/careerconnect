

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth/jwt';

const publicPageRoutes = ['/', '/login', '/register', '/forgot-password', '/admin/login', '/debug-env'];
const publicApiRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/admin/login',
  '/api/debug-env'
];

const dashboardByRole: Record<string, string> = {
  candidate: '/candidate/dashboard',
  recruiter: '/recruiter/dashboard',
  admin: '/admin/dashboard',
};

function isPublicPage(pathname: string) {
  return publicPageRoutes.includes(pathname);
}

function isPublicApi(pathname: string) {
  return publicApiRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function unauthorized(request: NextRequest, message: string) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ success: false, message }, { status: 401 });
  }

  const url = new URL('/login', request.url);
  url.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search);
  const response = NextResponse.redirect(url);
  response.cookies.delete('auth_token');
  return response;
}

function redirectForRole(role: string, request: NextRequest) {
  return NextResponse.redirect(new URL(dashboardByRole[role] || '/login', request.url));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicApi(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;
  const payload = token ? verifyToken(token) : null;

  if (isPublicPage(pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    return unauthorized(request, 'Not authenticated');
  }

  if (!payload) {
    return unauthorized(request, 'Invalid or expired token');
  }

  const { role } = payload;

  if (pathname.startsWith('/candidate') && role !== 'candidate') {
    return redirectForRole(role, request);
  }

  if (pathname.startsWith('/recruiter') && role !== 'recruiter') {
    return redirectForRole(role, request);
  }

  if (pathname.startsWith('/admin') && role !== 'admin') {
    return redirectForRole(role, request);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('X-User-Id', payload.userId.toString());
  requestHeaders.set('X-User-Role', payload.role);
  requestHeaders.set('X-User-Email', payload.email);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico).*)',
  ],
};
