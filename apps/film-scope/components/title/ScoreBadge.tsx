import { cn } from "@/lib/cn";

/**
 * Shows the weighted score, not the raw average — that is the whole point of
 * the ranking. The raw value and vote count sit in the tooltip for anyone who
 * wants to check our work.
 */
export const ScoreBadge = ({
  score,
  raw,
  votes,
  className,
}: {
  score: number;
  raw?: number | null;
  votes?: number | null;
  className?: string;
}) => {
  if (!score) return null;

  const tone =
    score >= 7.5 ? "text-score" : score >= 6 ? "text-ink" : "text-ink-dim";

  return (
    <span
      title={raw ? `${raw.toFixed(1)} · ${votes ?? 0}` : undefined}
      className={cn(
        "inline-flex items-center rounded-md bg-surface-sunken/90 px-1.5 py-0.5 text-xs font-semibold tabular-nums backdrop-blur",
        tone,
        className,
      )}
    >
      {score.toFixed(1)}
    </span>
  );
};
