"use client";

import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useTransition } from "react";

import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { type Locale, LOCALES } from "@/lib/i18n/routing";

/** Switches language without losing the current filters. */
export const LocaleSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const change = (next: Locale) => {
    const search = searchParams.toString();
    startTransition(() => {
      router.replace(search ? `${pathname}?${search}` : pathname, {
        locale: next,
      });
    });
  };

  return (
    <div
      className="inline-flex rounded-lg border border-edge bg-surface-raised p-0.5"
      aria-busy={pending}
    >
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => change(option)}
          aria-current={option === locale}
          className={
            option === locale
              ? "rounded-md bg-accent-soft px-2.5 py-1 text-xs font-medium uppercase text-accent"
              : "rounded-md px-2.5 py-1 text-xs uppercase text-ink-faint transition-colors hover:text-ink"
          }
        >
          {option}
        </button>
      ))}
    </div>
  );
};
