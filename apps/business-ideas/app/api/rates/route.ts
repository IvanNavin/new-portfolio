import { NextResponse } from "next/server";

import { CURRENCIES, FALLBACK_RATES } from "@/lib/currency";

/**
 * Проксі до відкритого API Національного банку України. Робимо запит на
 * сервері (без CORS-проблем у браузері) і кешуємо на годину. Повертаємо
 * курси у вигляді «гривень за 1 одиницю валюти».
 */
const NBU_URL =
  "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json";

interface NbuRate {
  cc: string;
  rate: number;
}

export const revalidate = 3600;

export async function GET() {
  const wanted = new Set(CURRENCIES.map((currency) => currency.code));

  try {
    const response = await fetch(NBU_URL, { next: { revalidate } });
    if (!response.ok) throw new Error(`NBU ${response.status}`);

    const list = (await response.json()) as NbuRate[];
    const rates: Record<string, number> = { UAH: 1 };
    for (const item of list) {
      if (wanted.has(item.cc)) rates[item.cc] = item.rate;
    }

    return NextResponse.json({ rates, source: "nbu" });
  } catch {
    return NextResponse.json({ rates: FALLBACK_RATES, source: "fallback" });
  }
}
