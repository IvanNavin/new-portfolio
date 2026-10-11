import createMiddleware from "next-intl/middleware";

import { routing } from "./lib/i18n/routing";

/**
 * Next 16 renamed the `middleware` convention to `proxy`; the handler contract
 * is unchanged, so next-intl's factory drops straight in. Negotiates the
 * locale from Accept-Language on a first visit, then honours the cookie.
 */
export default createMiddleware(routing);

export const config = {
  // Everything except API routes, Next internals and static files.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
