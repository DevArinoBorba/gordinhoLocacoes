import { NextRequest, NextResponse } from 'next/server';
import { authorized, SESSION_COOKIE } from './lib/auth';

export function proxy(request: NextRequest) {
  const isPublic =
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/api/login' ||
    request.nextUrl.pathname === '/api/logout' ||
    request.nextUrl.pathname === '/loja' ||
    request.nextUrl.pathname.startsWith('/loja/') ||
    request.nextUrl.pathname.startsWith('/brand/');

  if (!isPublic && !authorized(request.headers.get('authorization'), request.cookies.get(SESSION_COOKIE)?.value)) {
    if (request.method !== 'GET' || request.nextUrl.pathname.startsWith('/api/'))
      return new NextResponse('Não autorizado.', { status: 401 });
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'same-origin');
  return response;
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|api/health).*)'] };
