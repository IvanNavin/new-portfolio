"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

const KEY = "devpulse.theme";

function readTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const t = localStorage.getItem(KEY);
    if (t === "dark" || t === "light") return t;
  } catch {
    /* ignore */
  }
  return "system";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") {
    root.removeAttribute("data-theme");
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  } else {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* ignore */
    }
  }
}

/**
 * Tiny three-state theme button cycling System → Light → Dark → System.
 * Pre-hydration consistency is handled by ThemeScript in the layout
 * head; this component picks up after hydration.
 *
 * Also wires the global "t" keyboard shortcut that flips dark <-> light
 * (skipping system mode for speed — closest to what the user expects
 * after they've pressed "t" once).
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readTheme());
    setMounted(true);
  }, []);

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
      if (e.key !== "t") return;
      e.preventDefault();
      const next: Theme =
        document.documentElement.getAttribute("data-theme") === "light"
          ? "dark"
          : "light";
      setTheme(next);
      applyTheme(next);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const cycle = () => {
    const next: Theme =
      theme === "system" ? "light" : theme === "light" ? "dark" : "system";
    setTheme(next);
    applyTheme(next);
  };

  const label =
    theme === "system" ? "auto" : theme === "light" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${label}. Click to change.`}
      title="Theme (press t)"
      className="rounded-md border border-[var(--border)] px-2 py-1 text-xs normal-case tracking-normal text-[var(--text-dim)] hover:border-sky-400/40 hover:text-sky-200"
      // Mounted gate prevents a hydration mismatch — the server has no
      // idea which theme the client picked, so we render a placeholder
      // until JS catches up.
    >
      {mounted ? label : "—"}
    </button>
  );
}
