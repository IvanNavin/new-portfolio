"use client";

import { useLocale } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/** Видимі підписи: `uk` (код мови ISO) показуємо як «UA», щоб не плутати з United Kingdom */
const LOCALE_LABELS: Record<string, string> = { uk: "UA", en: "EN" };

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex overflow-hidden rounded-full border border-line shadow-hard-sm">
      {routing.locales.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => router.replace(pathname, { locale: code })}
          aria-current={code === locale}
          className={`px-2 py-1 font-mono text-xs font-semibold uppercase tracking-wide transition-colors ${
            code === locale
              ? "bg-accent text-[color:var(--color-on-accent)]"
              : "bg-card text-ink-soft hover:bg-paper"
          }`}
        >
          {LOCALE_LABELS[code] ?? code}
        </button>
      ))}
    </div>
  );
}
