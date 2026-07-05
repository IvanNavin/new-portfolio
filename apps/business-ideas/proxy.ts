import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Пропускаємо API, статику та файли з розширенням — решту роутимо по мовах
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
