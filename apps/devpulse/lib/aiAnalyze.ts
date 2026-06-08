import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

/**
 * Single Gemini call returning {summary, tags} for one news item.
 * Combining the two outputs halves our quota footprint vs running
 * separate calls for each, and the prompt cost is dominated by the
 * input excerpt anyway. Free tier is plenty for our ~200 items/day.
 *
 * Failure modes resolve to `null` — caller treats null as "skip the
 * row for now, retry next cron run". Empty / too-short input is
 * filtered before the call so we don't waste tokens on stubs.
 */

const MODEL = "gemini-2.0-flash-lite";
const MAX_SUMMARY_CHARS = 220;

const Schema = z.object({
  summary: z.string().describe("1-2 short sentences, plain text, no markdown"),
  tags: z
    .array(z.string())
    .max(4)
    .describe(
      "1-3 lowercase kebab-case topical tags. Examples: server-components, " +
        "wasm, type-narrowing. Empty array if nothing distinctive.",
    ),
});

export type Analysis = z.infer<typeof Schema>;

export async function analyzeItem(
  title: string,
  excerpt: string | null,
): Promise<Analysis | null> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return null;
  if (!title || title.length < 12) return null;
  const body = (excerpt ?? "").trim();
  if (body.length < 40) return null;

  try {
    const { object } = await generateObject({
      model: google(MODEL),
      schema: Schema,
      temperature: 0.2,
      maxOutputTokens: 200,
      // Without an abort signal, generateObject hangs indefinitely
      // when Gemini is slow or has hit our quota — that's how the
      // cron blew its 300s budget on the first try.
      abortSignal: AbortSignal.timeout(8_000),
      system:
        "You annotate developer-focused news items. For each item return " +
        "a crisp 1-2 sentence TLDR plus 1-3 topical tags (lowercase " +
        "kebab-case, single words or short phrases — e.g. server-actions, " +
        "compiler, accessibility, performance). No markdown, no emojis, " +
        "no preamble. Tags should NOT repeat the source name or category.",
      prompt: `Title: ${title}\n\nExcerpt:\n${body.slice(0, 1500)}`,
    });

    const summary = (object.summary ?? "")
      .trim()
      .replace(/^["'`]+|["'`]+$/g, "");
    if (!summary) return null;
    const trimmedSummary =
      summary.length > MAX_SUMMARY_CHARS
        ? summary.slice(0, MAX_SUMMARY_CHARS - 1).trimEnd() + "…"
        : summary;

    const tags = (object.tags ?? [])
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length >= 2 && t.length <= 30)
      .slice(0, 3);

    return { summary: trimmedSummary, tags };
  } catch (err) {
    // Surface the error class once per failure so we can tell quota
    // exhaustion from auth issues from schema-validation drift. Single
    // line so 24-batch logs stay readable.
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[aiAnalyze] failed:", msg.slice(0, 160));
    return null;
  }
}
