import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Visible whenever the app is serving fixtures. The sample catalog is invented,
 * so it must never be mistaken for real ratings.
 */
export const DemoBanner = () => {
  const t = useTranslations("demo");

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-score/30 bg-score/10 px-4 py-3">
      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-score" />
      <p className="text-sm leading-snug text-ink-dim">
        <span className="font-semibold text-score">{t("title")}. </span>
        {t("body")}
      </p>
    </div>
  );
};
