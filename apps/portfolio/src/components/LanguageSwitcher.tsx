import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DE, GB, RU, UA } from "country-flag-icons/react/3x2";
import { clsxm } from "@/lib/utils";
import { type Language } from "@/i18n/settings";

const FLAGS: { lng: Language; flag: React.ReactNode; label: string }[] = [
  { lng: "en", flag: <GB />, label: "English" },
  { lng: "de", flag: <DE />, label: "Deutsch" },
  { lng: "ua", flag: <UA />, label: "Українська" },
  { lng: "ru", flag: <RU />, label: "Русский" },
];

/**
 * Right-edge language panel, ported from the old portfolio. Tapping the
 * vertical "Language" label opens it; desktop also opens on hover. Unlike the
 * Next original it doesn't touch the URL — it calls i18next.changeLanguage,
 * which the language detector persists to the `i18next` cookie.
 */
export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const current = i18n.resolvedLanguage;

  return (
    <section
      data-print-hide=""
      className={clsxm(
        "shadow-custom-glow fixed top-64 z-[60] flex w-[50px] flex-col items-end justify-around rounded-l py-2.5",
        "transition-all duration-300 ease-linear md:hover:right-0",
        isOpen ? "right-0" : "-right-8",
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        aria-expanded={isOpen}
        aria-label={
          isOpen ? "Hide language switcher" : "Show language switcher"
        }
        className={clsxm(
          "text-shadow absolute left-0.5 rotate-180 leading-none shadow-black select-none",
          "[writing-mode:tb-rl] cursor-pointer border-0 bg-transparent p-0 text-white",
        )}
      >
        Language
      </button>

      {FLAGS.map(({ lng, flag, label }) => {
        const isCurrent = current === lng;
        return (
          <button
            key={lng}
            type="button"
            aria-label={`Switch language to ${label}`}
            aria-current={isCurrent ? "true" : undefined}
            disabled={isCurrent}
            className={clsxm(
              "m-1 h-4 w-5 cursor-pointer",
              isCurrent && "shadow-full-glow cursor-not-allowed",
            )}
            onClick={() => void i18n.changeLanguage(lng)}
          >
            {flag}
          </button>
        );
      })}
    </section>
  );
}
