import { create } from "zustand";

import { BASE_CURRENCY, FALLBACK_RATES } from "@/lib/currency";

const STORAGE_KEY = "bi:currency";

type RatesStatus = "idle" | "loading" | "ready" | "error";

/**
 * Курси валют і поточний вибір користувача. Курси тягнемо з нашого
 * роут-хендлера /api/rates (він проксіює НБУ й кешує на годину).
 */
interface CurrencyStore {
  code: string;
  /** Скільки гривень за 1 одиницю валюти */
  rates: Record<string, number>;
  status: RatesStatus;
  setCode: (code: string) => void;
  loadRates: () => Promise<void>;
}

export const useCurrencyStore = create<CurrencyStore>((set, get) => ({
  code: BASE_CURRENCY,
  rates: FALLBACK_RATES,
  status: "idle",

  setCode: (code) => {
    set({ code });
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, code);
      } catch {
        // приватний режим / вимкнене сховище — не критично
      }
    }
  },

  loadRates: async () => {
    const status = get().status;
    if (status === "loading" || status === "ready") return;
    set({ status: "loading" });
    try {
      const response = await fetch("/api/rates");
      if (!response.ok) throw new Error(`rates ${response.status}`);
      const data = (await response.json()) as { rates: Record<string, number> };
      set({ rates: { ...FALLBACK_RATES, ...data.rates }, status: "ready" });
    } catch {
      // лишаємо запасні курси
      set({ status: "error" });
    }
  },
}));
