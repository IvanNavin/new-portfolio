"use client";

import { useTransition } from "react";

import { setShowPreReleasesAction } from "./actions";

type Props = {
  current: boolean;
};

/**
 * Single switch at the top of /settings that controls whether canary /
 * beta / rc / dev releases appear in the home feed. Off by default —
 * matches the previous "auto-skip" behaviour, just now user-flippable.
 *
 * When ON, the page filter drops the isPreRelease=false constraint and
 * those items rejoin the feed (they were always being stored — this just
 * unhides them).
 */
export function PreReleaseToggle({ current }: Props) {
  const [pending, startTransition] = useTransition();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.checked;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("show", String(next));
      await setShowPreReleasesAction(fd);
    });
  };

  return (
    <label
      className={[
        "flex items-start gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-elev)]/40 p-5",
        "cursor-pointer transition-colors hover:border-sky-400/30",
        pending ? "opacity-70" : "",
      ].join(" ")}
    >
      <span
        className={[
          "relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors",
          current
            ? "border-emerald-400/60 bg-emerald-400/30"
            : "border-[var(--border)] bg-white/5",
        ].join(" ")}
      >
        <input
          type="checkbox"
          defaultChecked={current}
          onChange={onChange}
          disabled={pending}
          className="sr-only"
          aria-label="Show pre-release versions"
        />
        <span
          className={[
            "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
            current ? "translate-x-[18px]" : "translate-x-[2px]",
          ].join(" ")}
        />
      </span>
      <div className="flex-1">
        <div className="text-sm font-medium text-[var(--text)]">
          Show pre-release versions
        </div>
        <p className="mt-1 text-xs text-[var(--text-dim)]">
          Canary, beta, rc, alpha, dev tags. Off by default — turn on if you
          follow bleeding-edge releases (e.g. Next.js canaries, React
          experimental builds).
        </p>
      </div>
    </label>
  );
}
