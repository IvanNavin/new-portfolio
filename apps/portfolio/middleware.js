import { NextResponse } from 'next/server';
import { i18nRouter } from 'next-i18n-router';

import { ROUTES } from './app/constants/routes';
import { defaultLocale } from './app/i18n/settings';
import { i18n } from './i18n-config';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // ignore null; the fluid functional has null in the url;
  if (pathname === '/null') {
    return NextResponse.redirect(
      new URL(ROUTES.root(defaultLocale), request.url),
    );
  }

  return i18nRouter(request, i18n);
}

export const config = {
  matcher: ['/((?!api|static|.*\\..*|_next).*)'],
};
