"use client";

import { useEffect, useRef, useState } from "react";

type ArticleResp = {
  ok: boolean;
  title?: string;
  source?: string;
  url?: string;
  html?: string;
  cached?: boolean;
  error?: string;
};

type Props = {
  itemId: string;
  itemUrl: string;
  itemTitle: string;
  onClose: () => void;
};

/**
 * Fullscreen reader sheet. Fetches /api/article on mount, renders the
 * extracted body in a width-constrained prose column. Two affordances
 * at the top: "Open original" (target=_blank to source) and a close
 * button. Esc also closes.
 *
 * No inline JS execution risk — we drop the HTML straight into
 * dangerouslySetInnerHTML, but the upstream Mozilla Readability
 * already strips <script> + event-handler attributes during its
 * parse. We render in an iframe-less prose container so any rogue
 * styles don't bleed out.
 */
export function ReaderDrawer({ itemId, itemUrl, itemTitle, onClose }: Props) {
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "ok"; html: string; title: string; source: string }
    | { kind: "error"; message: string }
  >({ kind: "loading" });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch(`/api/article?id=${encodeURIComponent(itemId)}`, {
      signal: ac.signal,
    })
      .then(async (res) => {
        const data: ArticleResp = await res.json();
        if (!res.ok || !data.ok || !data.html) {
          setState({
            kind: "error",
            message: data.error ?? `status ${res.status}`,
          });
          return;
        }
        setState({
          kind: "ok",
          html: data.html,
          title: data.title ?? itemTitle,
          source: data.source ?? "",
        });
        // Scroll to top on render so long content doesn't show mid-body
        setTimeout(() => scrollRef.current?.scrollTo({ top: 0 }), 0);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setState({ kind: "error", message: String(err) });
      });
    return () => ac.abort();
  }, [itemId, itemTitle]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Lock body scroll while drawer is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Article reader"
      className="fixed inset-0 z-50 flex flex-col bg-[var(--bg)]"
    >
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--bg-elev)] px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] tracking-widest text-[var(--text-dim)] uppercase">
            Reader · {state.kind === "ok" ? state.source : "loading"}
          </div>
          <div className="truncate text-sm font-medium text-[var(--text)]">
            {state.kind === "ok" ? state.title : itemTitle}
          </div>
        </div>
        <a
          href={itemUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-md border border-[var(--c-accent-fg)] bg-[var(--c-accent-soft)] px-3 py-1.5 text-xs font-medium text-[var(--c-accent-fg)] hover:brightness-110"
        >
          ↗ Open original
        </a>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close reader"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text)] hover:border-[var(--c-danger-fg)] hover:text-[var(--c-danger-fg)]"
        >
          ×
        </button>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-[var(--bg)] px-4 py-6 sm:px-8"
      >
        <div className="mx-auto max-w-2xl">
          {state.kind === "loading" && (
            <div className="py-20 text-center text-sm text-[var(--text-dim)]">
              Fetching article…
            </div>
          )}
          {state.kind === "error" && (
            <div className="rounded-lg border border-[var(--c-danger-fg)] bg-[var(--c-danger-soft)] p-5 text-sm text-[var(--c-danger-fg)]">
              <div className="font-medium">
                Couldn&apos;t parse the article.
              </div>
              <div className="mt-1 text-xs opacity-80">{state.message}</div>
              <div className="mt-3">
                <a
                  href={itemUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline underline-offset-4"
                >
                  Open the source page instead →
                </a>
              </div>
            </div>
          )}
          {state.kind === "ok" && (
            <article
              className="reader-prose text-[var(--text)]"
              dangerouslySetInnerHTML={{ __html: state.html }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
