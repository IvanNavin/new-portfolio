import { getTranslations, setRequestLocale } from "next-intl/server";

import { BusinessList } from "@/components/home/BusinessList";
import { SiteHeader } from "@/components/SiteHeader";
import type { Locale } from "@/i18n/routing";
import { getBusinesses } from "@/lib/data/getBusinesses";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const businesses = await getBusinesses(locale as Locale);

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <section className="border-b border-line py-12 sm:py-16">
          <p className="rise-in font-mono text-xs uppercase tracking-[0.25em] text-accent">
            {t("badge")}
          </p>
          <h1
            className="rise-in mt-4 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-5xl"
            style={{ animationDelay: "80ms" }}
          >
            {t("heroPre")}{" "}
            <span className="rounded-lg bg-accent-soft px-2 text-accent-deep">
              {t("heroHighlight")}
            </span>
            {t("heroPost")}
          </h1>
          <p
            className="rise-in mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            {t("heroLead")}
          </p>
        </section>

        <section className="py-10">
          <h2 className="sr-only">{t("listHeading")}</h2>
          <BusinessList businesses={businesses} />
        </section>
      </main>

      <footer className="border-t border-line bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>{t("footerNote")}</p>
          <p className="font-mono uppercase tracking-widest">
            {t("footerMvp", { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </>
  );
}
