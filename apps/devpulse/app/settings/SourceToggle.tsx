"use client";

import { useTransition } from "react";

import { toggleSourceAction } from "./actions";

type Props = {
  sourceId: string;
  enabled: boolean;
};

/**
 * Small switch that flips a source's enabled state for the current user.
 * Wraps the server action in startTransition so the UI shows a brief
 * "pending" cursor while Prisma writes and the page revalidates.
 */
export function SourceToggle({ sourceId, enabled }: Props) {
  const [pending, startTransition] = useTransition();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.checked;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("sourceId", sourceId);
      fd.set("enabled", String(next));
      await toggleSourceAction(fd);
    });
  };

  return (
    <label
      className={[
        "relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full border transition-colors",
        enabled
          ? "border-emerald-400/60 bg-emerald-400/30"
          : "border-[var(--border)] bg-white/5",
        pending ? "opacity-60" : "",
      ].join(" ")}
    >
      <input
        type="checkbox"
        defaultChecked={enabled}
        onChange={onChange}
        className="sr-only"
        aria-label={enabled ? "Disable source" : "Enable source"}
        disabled={pending}
      />
      <span
        className={[
          "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
          enabled ? "translate-x-[18px]" : "translate-x-[2px]",
        ].join(" ")}
      />
    </label>
  );
}
