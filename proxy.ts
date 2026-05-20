import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/leads') || pathname.startsWith('/properties') || pathname.startsWith('/team') || pathname.startsWith('/followups') || pathname.startsWith('/more');
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/auth');

  if (!isProtected || isAuthRoute) {
    return NextResponse.next();
  }

  if (request.cookies.getAll().length === 0) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/leads/:path*', '/properties/:path*', '/team/:path*', '/followups/:path*', '/more/:path*'],
};
