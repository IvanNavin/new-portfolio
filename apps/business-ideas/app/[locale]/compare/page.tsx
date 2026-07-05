import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CompareView } from "@/components/compare/CompareView";
import { SiteHeader } from "@/components/SiteHeader";
import type { Locale } from "@/i18n/routing";
import { getBusinesses } from "@/lib/data/getBusinesses";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "compare" });
  return { title: t("title") };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const businesses = await getBusinesses(locale as Locale);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6">
        <CompareView businesses={businesses} />
      </main>
    </>
  );
}
