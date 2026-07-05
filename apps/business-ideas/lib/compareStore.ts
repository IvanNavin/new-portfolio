import { create } from "zustand";

const STORAGE_KEY = "bi:compare";

/** Максимум бізнесів у порівнянні */
export const MAX_COMPARE = 5;

interface CompareStore {
  selected: string[];
  hydrated: boolean;
  hydrate: () => void;
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  setSelected: (slugs: string[]) => void;
}

function persist(slugs: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, slugs.join(","));
  } catch {
    // приватний режим / вимкнене сховище — не критично
  }
}

/**
 * Спільний вибір бізнесів для порівняння. Живе між сторінками й
 * зберігається в localStorage — картки, калькулятор і плаваюча кнопка
 * читають один і той самий список.
 */
export const useCompareStore = create<CompareStore>((set, get) => ({
  selected: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    let slugs: string[] = [];
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(STORAGE_KEY) ?? "";
      slugs = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, MAX_COMPARE);
    }
    set({ selected: slugs, hydrated: true });
  },

  toggle: (slug) =>
    set((state) => {
      let next: string[];
      if (state.selected.includes(slug)) {
        next = state.selected.filter((s) => s !== slug);
      } else if (state.selected.length >= MAX_COMPARE) {
        next = state.selected;
      } else {
        next = [...state.selected, slug];
      }
      persist(next);
      return { selected: next };
    }),

  remove: (slug) =>
    set((state) => {
      const next = state.selected.filter((s) => s !== slug);
      persist(next);
      return { selected: next };
    }),

  clear: () => {
    persist([]);
    set({ selected: [] });
  },

  setSelected: (slugs) => {
    const next = slugs.slice(0, MAX_COMPARE);
    persist(next);
    set({ selected: next, hydrated: true });
  },
}));
