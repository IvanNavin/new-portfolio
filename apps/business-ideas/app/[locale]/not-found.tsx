import { getTranslations } from "next-intl/server";

import { SiteHeader } from "@/components/SiteHeader";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-24 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-loss">
          {t("code")}
        </p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          {t("title")}
        </h1>
        <Link
          href="/"
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold uppercase tracking-widest text-[color:var(--color-on-accent)] shadow-hard-sm transition-transform hover:-translate-y-0.5"
        >
          {t("back")}
        </Link>
      </main>
    </>
  );
}
