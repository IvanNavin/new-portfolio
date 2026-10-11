"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type ChipProps = {
  children: ReactNode;
  tone?: "neutral" | "include" | "exclude" | "accent";
  onClick?: () => void;
  onRemove?: () => void;
  active?: boolean;
  title?: string;
};

const TONES = {
  neutral:
    "border-edge bg-surface-raised text-ink-dim hover:border-edge-strong hover:text-ink",
  include: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  exclude:
    "border-danger/40 bg-danger/10 text-danger line-through decoration-danger/60",
  accent: "border-accent/50 bg-accent-soft text-accent",
} as const;

export const Chip = ({
  children,
  tone = "neutral",
  onClick,
  onRemove,
  active,
  title,
}: ChipProps) => {
  const Element = onClick ? "button" : "span";

  return (
    <Element
      type={onClick ? "button" : undefined}
      onClick={onClick}
      title={title}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
        TONES[tone],
        active &&
          tone === "neutral" &&
          "border-accent/50 bg-accent-soft text-accent",
        onClick && "cursor-pointer",
      )}
    >
      {children}
      {onRemove ? (
        <span
          role="button"
          tabIndex={0}
          aria-label="Remove"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.stopPropagation();
              onRemove();
            }
          }}
          className="-mr-1 rounded-full p-0.5 opacity-60 hover:opacity-100"
        >
          <X size={12} />
        </span>
      ) : null}
    </Element>
  );
};
