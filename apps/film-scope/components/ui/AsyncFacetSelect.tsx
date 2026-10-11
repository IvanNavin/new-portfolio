"use client";

import { Check, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Chip } from "@/components/ui/Chip";
import type { FacetLabels } from "@/components/ui/FacetSelect";
import { inputClass } from "@/components/ui/Field";
import { ModeToggle } from "@/components/ui/ModeToggle";
import type { MatchMode, SetFacet } from "@/lib/filters/schema";
import type { FacetKind, FacetOption } from "@/lib/tmdb/search";

type AsyncFacetSelectProps = {
  label: string;
  kind: FacetKind;
  placeholder: string;
  facet: SetFacet<number>;
  onChange: (facet: SetFacet<number>) => void;
  labels: FacetLabels;
  locale: string;
  hint?: string;
};

/**
 * The set control for facets too large to enumerate — people, keywords,
 * companies. Same include / exclude / AND-OR semantics as FacetSelect, but the
 * options come from TMDB search.
 *
 * The URL only ever carries ids, so names are resolved on mount for whatever
 * arrived in a shared link and cached from there on.
 */
export const AsyncFacetSelect = ({
  label,
  kind,
  placeholder,
  facet,
  onChange,
  labels,
  locale,
  hint,
}: AsyncFacetSelectProps) => {
  const [term, setTerm] = useState("");
  const [options, setOptions] = useState<FacetOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [names, setNames] = useState<Record<number, string>>({});

  const remember = (entries: FacetOption[]) =>
    setNames((current) => {
      const next = { ...current };
      for (const entry of entries) next[entry.id] = entry.name;
      return next;
    });

  const selected = [...facet.include, ...facet.exclude];
  const unresolvedKey = selected.filter((id) => !names[id]).join(",");

  // Resolve ids that arrived from the URL rather than from a search here.
  useEffect(() => {
    if (!unresolvedKey) return;
    const controller = new AbortController();

    fetch(`/api/search?kind=${kind}&locale=${locale}&ids=${unresolvedKey}`, {
      signal: controller.signal,
    })
      .then(
        (response) => response.json() as Promise<{ results: FacetOption[] }>,
      )
      .then((data) => remember(data.results))
      .catch(() => {
        // Offline or aborted — chips fall back to "#id", which is still usable.
      });

    return () => controller.abort();
  }, [unresolvedKey, kind, locale]);

  useEffect(() => {
    const query = term.trim();
    if (query.length < 2) {
      setOptions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      fetch(
        `/api/search?kind=${kind}&locale=${locale}&q=${encodeURIComponent(query)}`,
        {
          signal: controller.signal,
        },
      )
        .then(
          (response) => response.json() as Promise<{ results: FacetOption[] }>,
        )
        .then((data) => {
          remember(data.results);
          setOptions(data.results);
        })
        .catch(() => {
          // Aborted or offline — keep the previous options on screen.
        })
        .finally(() => setLoading(false));
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [term, kind, locale]);

  const add = (id: number, bucket: "include" | "exclude") => {
    const next: SetFacet<number> = {
      include: facet.include.filter((item) => item !== id),
      exclude: facet.exclude.filter((item) => item !== id),
      mode: facet.mode,
    };
    next[bucket] = [...next[bucket], id];
    onChange(next);
    setTerm("");
    setOptions([]);
  };

  const remove = (id: number) =>
    onChange({
      include: facet.include.filter((item) => item !== id),
      exclude: facet.exclude.filter((item) => item !== id),
      mode: facet.mode,
    });

  const nameOf = (id: number) => names[id] ?? `#${id}`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          {label}
        </span>
        {facet.include.length > 1 ? (
          <ModeToggle
            mode={facet.mode}
            onChange={(mode: MatchMode) => onChange({ ...facet, mode })}
            anyLabel={labels.matchAny}
            allLabel={labels.matchAll}
          />
        ) : null}
      </div>

      <div className="relative">
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
        {loading ? (
          <Loader2
            size={14}
            className="absolute right-3 top-3 animate-spin text-ink-faint"
          />
        ) : null}

        {options.length > 0 ? (
          <ul className="absolute z-40 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-edge bg-surface-raised p-1 shadow-2xl shadow-black/40">
            {options.map((option) => (
              <li key={option.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => add(option.id, "include")}
                  className="min-w-0 flex-1 truncate rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface-sunken"
                  title={labels.include}
                >
                  {option.name}
                  {option.hint ? (
                    <span className="ml-2 text-xs text-ink-faint">
                      {option.hint}
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={() => add(option.id, "include")}
                  aria-label={`${labels.include}: ${option.name}`}
                  title={labels.include}
                  className="rounded-md p-1.5 text-emerald-400 hover:bg-emerald-500/10"
                >
                  <Check size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => add(option.id, "exclude")}
                  aria-label={`${labels.exclude}: ${option.name}`}
                  title={labels.exclude}
                  className="rounded-md p-1.5 text-danger hover:bg-danger/10"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {selected.length ? (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {facet.include.map((id) => (
            <Chip key={`in-${id}`} tone="include" onRemove={() => remove(id)}>
              {nameOf(id)}
            </Chip>
          ))}
          {facet.exclude.map((id) => (
            <Chip key={`ex-${id}`} tone="exclude" onRemove={() => remove(id)}>
              {nameOf(id)}
            </Chip>
          ))}
        </div>
      ) : null}

      {hint ? (
        <p className="text-[11px] leading-snug text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
};
