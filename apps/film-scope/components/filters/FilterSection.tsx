"use client";

import { ChevronDown } from "lucide-react";
import { type ReactNode, useState } from "react";

import { cn } from "@/lib/cn";

/**
 * Twelve facets in one flat column is unusable — the actor filter ended up
 * below the fold and people never found it. Grouping keeps the common ones
 * open and the rest one click away, with a count so a collapsed section never
 * hides an active constraint.
 */
export const FilterSection = ({
  title,
  activeCount = 0,
  defaultOpen = false,
  children,
}: {
  title: string;
  activeCount?: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen || activeCount > 0);

  return (
    <section className="border-b border-edge pb-3 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 py-2 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-ink">
          {title}
          {activeCount ? (
            <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent">
              {activeCount}
            </span>
          ) : null}
        </span>
        <ChevronDown
          size={15}
          className={cn(
            "shrink-0 text-ink-faint transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? <div className="space-y-4 pt-1">{children}</div> : null}
    </section>
  );
};
