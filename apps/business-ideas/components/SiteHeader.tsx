import { getTranslations } from "next-intl/server";

import { AdminIndicator } from "@/components/admin/AdminIndicator";
import { CurrencySelect } from "@/components/CurrencySelect";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "@/i18n/navigation";

export async function SiteHeader() {
  const t = await getTranslations("header");

  return (
    <header className="border-b border-line bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-1">
          <span className="font-display text-lg font-bold uppercase tracking-tight sm:text-xl">
            {t("brand")}
          </span>
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent transition-transform group-hover:rotate-45" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <AdminIndicator />
          <ThemeToggle />
          <LanguageSwitcher />
          <CurrencySelect />
        </div>
      </div>
    </header>
  );
}
