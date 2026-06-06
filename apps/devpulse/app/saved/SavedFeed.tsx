"use client";

import { NewsCard } from "@components/NewsCard";
import { onStorageChange, readSaved } from "@lib/storage";
import { useEffect, useState } from "react";

type Item = {
  id: string;
  url: string;
  title: string;
  excerpt: string | null;
  source: string;
  category: string;
  publishedAt: string;
};

type CardItem = Omit<Item, "publishedAt"> & { publishedAt: Date };

export function SavedFeed() {
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "empty" }
    | { kind: "ready"; items: CardItem[] }
  >({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const urls = [...readSaved()];
      if (urls.length === 0) {
        if (!cancelled) setState({ kind: "empty" });
        return;
      }
      try {
        const res = await fetch("/api/by-urls", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ urls }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (!json.ok || !Array.isArray(json.items)) {
          setState({ kind: "ready", items: [] });
          return;
        }
        const items: CardItem[] = (json.items as Item[]).map((i) => ({
          ...i,
          publishedAt: new Date(i.publishedAt),
        }));
        setState({ kind: "ready", items });
      } catch {
        if (!cancelled) setState({ kind: "ready", items: [] });
      }
    }

    refresh();
    const unsub = onStorageChange(refresh);
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  if (state.kind === "loading") {
    return (
      <p className="text-sm text-[var(--text-dim)]">
        Loading your saved items…
      </p>
    );
  }
  if (state.kind === "empty" || state.items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-elev)]/40 p-10 text-center">
        <h2 className="mb-2 text-lg font-medium">No saved items yet</h2>
        <p className="text-sm text-[var(--text-dim)]">
          Tap the ★ on any card on the home feed to save it for later.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {state.items.map((item) => (
        <li key={item.id}>
          <NewsCard item={item} />
        </li>
      ))}
    </ul>
  );
}
