"use client";

import { useEffect, useState } from "react";

import { Tooltip } from "./Tooltip";

type Theme = "light" | "system" | "dark";

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
 * Three-button segmented control: ☀ light · 🖥 system · 🌙 dark.
 * The current choice is highlighted; the keyboard shortcut "t" toggles
 * between light and dark (skipping system) because that's almost always
 * what the user wants after pressing once.
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

  const pick = (next: Theme) => {
    setTheme(next);
    applyTheme(next);
  };

  // Pre-hydration: render a placeholder with the same footprint to avoid
  // layout shift when the real value lands.
  if (!mounted) {
    return (
      <span className="inline-flex h-7 w-[78px] rounded-md border border-[var(--border)]" />
    );
  }

  return (
    <span
      role="group"
      aria-label="Theme"
      className="inline-flex h-7 items-center rounded-md border border-[var(--border)] p-[2px]"
    >
      <ThemeBtn
        active={theme === "light"}
        onClick={() => pick("light")}
        ariaLabel="Light theme"
        tip="Light theme"
      >
        <SunIcon />
      </ThemeBtn>
      <ThemeBtn
        active={theme === "system"}
        onClick={() => pick("system")}
        ariaLabel="System theme (follow OS)"
        tip="Match OS theme"
      >
        <ComputerIcon />
      </ThemeBtn>
      <ThemeBtn
        active={theme === "dark"}
        onClick={() => pick("dark")}
        ariaLabel="Dark theme"
        tip="Dark theme (press t to toggle)"
      >
        <MoonIcon />
      </ThemeBtn>
    </span>
  );
}

function ThemeBtn({
  active,
  onClick,
  ariaLabel,
  tip,
  children,
}: {
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
  tip: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip label={tip} side="bottom">
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        aria-pressed={active}
        className={[
          "flex h-[22px] w-[22px] items-center justify-center rounded transition-colors",
          "focus-visible:ring-2 focus-visible:ring-sky-400/50 focus-visible:outline-none",
          active
            ? "bg-[var(--c-accent-soft)] text-[var(--c-accent-fg)]"
            : "text-[var(--text-dim)] hover:text-[var(--text)]",
        ].join(" ")}
      >
        {children}
      </button>
    </Tooltip>
  );
}

function SunIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
    </svg>
  );
}
function ComputerIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
