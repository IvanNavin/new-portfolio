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

// 2.5-flash-lite has the highest daily free-tier quota of any current
// Gemini model — 1000 requests/day vs 200 on 2.0 — which matters when
// the cron sweeps the backlog over several runs.
const MODEL = "gemini-2.5-flash-lite";
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
  // 60-char floor (was 40) so we don't burn quota on items whose
  // entire RSS body was HN boilerplate that parseFeed stripped down
  // to a fragment. AI can't summarize what isn't there.
  if (body.length < 60) return null;

  try {
    const { object } = await generateObject({
      model: google(MODEL),
      schema: Schema,
      temperature: 0.2,
      maxOutputTokens: 200,
      abortSignal: AbortSignal.timeout(8_000),
      // The default 3 retries triple our effective request count
      // against Gemini's 30 RPM free tier — a single batch of 6 can
      // burst to 18 RPS during retry storms and 429 the rest of the
      // run. Skip retries; failed rows come back next cron pass.
      maxRetries: 0,
      system:
        "You annotate developer-focused news items. Return a 1-2 " +
        "sentence TLDR plus 1-3 topical tags.\n\n" +
        "TLDR rules — these are non-negotiable:\n" +
        '- NEVER start with "This article", "This post", "The author", ' +
        '"The piece", "It explains", "It discusses", or any other meta ' +
        "phrase describing the writing.\n" +
        "- Open with the SUBJECT or the FACT itself.\n" +
        '  Bad:  "This article explains the concept of dopamine fracking."\n' +
        '  Good: "Dopamine fracking is the design pattern where apps ' +
        'exploit reward loops to keep users hooked."\n' +
        "- Plain text, no markdown, no quotes around the whole thing, " +
        "no emojis.\n" +
        "- If the excerpt is too thin to make a real claim, output an " +
        'empty string for summary — don\'t pad with "This describes…".\n\n' +
        "Tags rules:\n" +
        "- 1-3 lowercase kebab-case items (e.g. server-actions, wasm, " +
        "type-narrowing, accessibility, performance).\n" +
        "- Don't repeat the source name, the platform, or the category.",
      prompt: `Title: ${title}\n\nExcerpt:\n${body.slice(0, 1500)}`,
    });

    let summary = (object.summary ?? "").trim().replace(/^["'`]+|["'`]+$/g, "");
    // Defence in depth: even with the explicit system prompt the model
    // occasionally falls back to "This article…" / "The post…" framing.
    // Strip the meta-opener and capitalize the next word so a punchy
    // SUBJECT-first sentence remains.
    summary = summary.replace(
      /^(this (article|post|piece)|the (article|post|piece|author)|it)\s+(explains|describes|discusses|covers|introduces|presents|examines|details|argues)\s+/i,
      "",
    );
    if (summary) summary = summary[0].toUpperCase() + summary.slice(1);
    if (!summary || summary.length < 20) return null;
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
