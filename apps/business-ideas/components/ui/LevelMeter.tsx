const LEVELS = [1, 2, 3, 4, 5] as const;

interface LevelMeterProps {
  label: string;
  value: number;
  /** risk — підфарбовує високі значення; difficulty — завжди чорнильний */
  variant: "difficulty" | "risk";
}

function riskColor(value: number): string {
  if (value >= 4) return "bg-loss";
  if (value === 3) return "bg-amber";
  return "bg-accent";
}

export function LevelMeter({ label, value, variant }: LevelMeterProps) {
  const filled = variant === "risk" ? riskColor(value) : "bg-ink";
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs uppercase tracking-wider text-ink-soft">
        {label}
      </span>
      <div className="flex gap-1" aria-label={`${label}: ${value}/5`}>
        {LEVELS.map((level) => (
          <span
            key={level}
            className={`h-2.5 w-2.5 rounded-full border border-line ${
              level <= value ? filled : "bg-transparent"
            }`}
          />
        ))}
      </div>
      <span className="font-mono text-xs text-ink-soft">{value}/5</span>
    </div>
  );
}
