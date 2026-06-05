"use client";

import { useEffect } from "react";

/**
 * Google-Reader-style keyboard nav: j = next card, k = previous, Enter
 * opens the focused card. No-op when typing in an input or when meta keys
 * are held — typing into the search box must keep working.
 *
 * Cards are found via `[data-card-url]` (set by NewsCard). The first j/k
 * focuses the first visible card; subsequent ones step through.
 */
export function KeyboardNav() {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key !== "j" && e.key !== "k" && e.key !== "Enter") return;

      if (e.key === "Enter") {
        if (target && target.matches("[data-card-url]")) {
          // native browser default would open same tab; we want new tab
          // because cards have target=_blank — let the click handler win
          (target as HTMLAnchorElement).click();
          e.preventDefault();
        }
        return;
      }

      const cards = Array.from(
        document.querySelectorAll<HTMLAnchorElement>("[data-card-url]"),
      ).filter((el) => {
        // Skip dismissed (display:none) cards
        const li = el.closest("li");
        return !li || (li as HTMLElement).style.display !== "none";
      });
      if (cards.length === 0) return;

      const focused = document.activeElement as HTMLElement | null;
      const idx = focused ? cards.indexOf(focused as HTMLAnchorElement) : -1;
      const nextIdx =
        e.key === "j"
          ? Math.min(cards.length - 1, idx + 1)
          : Math.max(0, idx === -1 ? 0 : idx - 1);
      const next = cards[nextIdx];
      next.focus({ preventScroll: false });
      next.scrollIntoView({ block: "center", behavior: "smooth" });
      e.preventDefault();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
