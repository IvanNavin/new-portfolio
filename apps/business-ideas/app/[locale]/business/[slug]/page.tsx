import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";
import { EditableBusinessInfo } from "@/components/admin/EditableBusinessInfo";
import { CompareToggle } from "@/components/compare/CompareToggle";
import { SiteHeader } from "@/components/SiteHeader";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getBusinessBySlug, getBusinessSlugs } from "@/lib/data/getBusinesses";

interface BusinessPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getBusinessSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BusinessPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const business = await getBusinessBySlug(slug, locale as Locale);
  if (!business) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("businessTitle", { name: business.name }),
    description: business.shortDescription,
  };
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("business");

  // Створення нового бізнесу — порожній редактор (лише для адміна; права
  // перевіряються на сервері під час збереження)
  if (slug === "new") {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <nav className="py-5">
            <Link
              href="/"
              className="font-mono text-xs uppercase tracking-widest text-ink-soft transition-colors hover:text-accent"
            >
              {t("backToAll")}
            </Link>
          </nav>
          <EditableBusinessInfo locale={locale} isCreate />
        </main>
      </>
    );
  }

  const business = await getBusinessBySlug(slug, locale as Locale);
  if (!business) notFound();

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <nav className="flex items-center justify-between gap-3 py-5">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-widest text-ink-soft transition-colors hover:text-accent"
          >
            {t("backToAll")}
          </Link>
          <div className="flex items-center gap-2">
            <AdminDeleteButton
              slug={business.slug}
              name={business.name}
              redirectTo={`/${locale}`}
            />
            <CompareToggle slug={business.slug} variant="button" />
          </div>
        </nav>

        {/* Картка + калькулятор (у режимі редагування — WYSIWYG всередині) */}
        <EditableBusinessInfo business={business} locale={locale} />
      </main>
    </>
  );
}
