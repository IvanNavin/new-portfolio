import "../globals.css";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { type ReactNode, Suspense } from "react";

import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Link } from "@/lib/i18n/navigation";
import { routing } from "@/lib/i18n/routing";

export const generateStaticParams = () =>
  routing.locales.map((locale) => ({ locale }));

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "app" });
  return {
    title: `${t("name")} — ${t("tagline")}`,
    description: t("description"),
  };
};

const LocaleLayout = async ({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "app" });
  const footer = await getTranslations({ locale, namespace: "footer" });

  return (
    <html lang={locale}>
      <body className="min-h-dvh">
        <NextIntlClientProvider>
          <header className="border-b border-edge">
            <div className="mx-auto flex max-w-[100rem] items-center justify-between gap-4 px-4 py-4 sm:px-6">
              <Link href="/" className="group">
                <span className="text-lg font-semibold tracking-tight text-ink">
                  {t("name")}
                </span>
                <span className="ml-2 hidden text-sm text-ink-faint sm:inline">
                  {t("tagline")}
                </span>
              </Link>
              <Suspense fallback={<div className="h-[26px] w-[104px]" />}>
                <LocaleSwitcher />
              </Suspense>
            </div>
          </header>

          <main className="mx-auto max-w-[100rem] px-4 py-6 sm:px-6">
            {children}
          </main>

          <footer className="mt-12 border-t border-edge">
            <div className="mx-auto max-w-[100rem] space-y-1 px-4 py-6 text-xs leading-relaxed text-ink-faint sm:px-6">
              <p>{footer("attribution")}</p>
              <p>{footer("nonCommercial")}</p>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default LocaleLayout;
