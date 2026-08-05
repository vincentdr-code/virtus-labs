import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { ENABLED_SOURCES } from "./sources";
import { fetchSource, type RawItem, type FetchResult } from "./fetchers";
import { dedupe, normalizeUrl, scoreImportance } from "./scoring";

export interface ScanSummary {
  runId: string;
  itemsFound: number;
  itemsNew: number;
  sourcesOk: number;
  sourcesFailed: number;
  failures: Array<{ sourceId: string; error: string }>;
  newItemIds: string[];
}

/**
 * One weekly pass: hit every enabled source, drop anything already stored,
 * score what is left, optionally have Claude sharpen the summaries, and
 * write it all down. Records a ScanRun either way so a silent failure is
 * still visible in the UI.
 */
export async function runScan(
  options: { useClaude?: boolean } = {},
): Promise<ScanSummary> {
  const useClaude =
    options.useClaude ?? Boolean(process.env.ANTHROPIC_API_KEY?.startsWith("sk-ant-"));

  const run = await prisma.scanRun.create({ data: { status: "RUNNING" } });

  try {
    // Sources are independent, so fetch them together rather than serially —
    // a weekly scan across ~25 feeds should not take 25 timeouts to finish.
    const results: FetchResult[] = await Promise.all(
      ENABLED_SOURCES.map((source) => fetchSource(source)),
    );

    const allItems = results.flatMap((r) => r.items);
    const failures = results
      .filter((r) => !r.ok)
      .map((r) => ({ sourceId: r.sourceId, error: r.error ?? "unknown" }));

    // Compare against what is already stored so re-running the scan is safe.
    const existing = await prisma.newsItem.findMany({
      select: { sourceUrl: true },
    });
    const knownUrls = new Set(existing.map((e) => normalizeUrl(e.sourceUrl)));

    const fresh = dedupe(allItems, knownUrls);
    const scored = fresh.map((item) => ({
      ...item,
      importance: scoreImportance(item),
    }));

    const enriched = useClaude ? await enrichWithClaude(scored) : scored;

    const created = await persistItems(enriched);

    await prisma.scanRun.update({
      where: { id: run.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        itemsFound: allItems.length,
        itemsNew: created.length,
        log: JSON.stringify(
          results.map((r) => ({
            source: r.sourceId,
            ok: r.ok,
            count: r.items.length,
            ms: r.durationMs,
            error: r.error,
          })),
        ),
      },
    });

    return {
      runId: run.id,
      itemsFound: allItems.length,
      itemsNew: created.length,
      sourcesOk: results.filter((r) => r.ok).length,
      sourcesFailed: failures.length,
      failures,
      newItemIds: created,
    };
  } catch (err) {
    await prisma.scanRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        error: err instanceof Error ? err.message : String(err),
      },
    });
    throw err;
  }
}

type ScoredItem = RawItem & { importance: number };

/**
 * Write items one at a time rather than with createMany: the unique constraint
 * on sourceUrl means a concurrent scan could collide, and a single duplicate
 * should skip that row, not abort the batch.
 */
async function persistItems(items: ScoredItem[]): Promise<string[]> {
  const ids: string[] = [];
  for (const item of items) {
    try {
      const row = await prisma.newsItem.create({
        data: {
          trade: item.trade,
          metro: item.metro,
          headline: item.headline,
          summary: item.summary,
          sourceUrl: item.sourceUrl,
          sourceName: item.sourceName,
          sourceTier: item.sourceTier,
          category: item.category,
          importance: item.importance,
          publishedAt: item.publishedAt,
        },
      });
      ids.push(row.id);
    } catch {
      // Unique-constraint collision — already have it, move on.
    }
  }
  return ids;
}

/**
 * Ask Claude to rewrite summaries in consulting terms and sanity-check the
 * heuristic importance score. Best-effort: if the call fails, the heuristic
 * result stands and the scan still completes.
 */
async function enrichWithClaude(items: ScoredItem[]): Promise<ScoredItem[]> {
  if (items.length === 0) return items;

  // Only spend tokens on items that could plausibly matter.
  const candidates = items.filter((i) => i.importance >= 2).slice(0, 40);
  if (candidates.length === 0) return items;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const payload = candidates.map((item, i) => ({
      i,
      headline: item.headline,
      summary: item.summary.slice(0, 400),
      trade: item.trade,
      metro: item.metro,
      source: item.sourceName,
    }));

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4000,
      system:
        "You triage industry news for an IT consulting firm that sells custom software to " +
        "mechanical, electrical, plumbing, HVAC, architecture, environmental and civil engineering " +
        "firms in Austin, Northern Virginia, and Miami. For each item return a one-sentence " +
        "summary written for that consultant — what changed and who it affects — and an " +
        "importance from 1 to 3, where 3 means it creates a concrete reason to contact a firm " +
        "in one of those markets this month. Respond with JSON only: " +
        '{"items":[{"i":0,"summary":"...","importance":2}]}',
      messages: [
        {
          role: "user",
          content: JSON.stringify(payload),
        },
      ],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const parsed = extractJson(text) as {
      items?: Array<{ i: number; summary?: string; importance?: number }>;
    } | null;
    if (!parsed?.items) return items;

    const byIndex = new Map(parsed.items.map((r) => [r.i, r]));
    return items.map((item) => {
      const idx = candidates.indexOf(item);
      const patch = idx >= 0 ? byIndex.get(idx) : undefined;
      if (!patch) return item;
      return {
        ...item,
        summary: patch.summary?.trim() || item.summary,
        importance:
          typeof patch.importance === "number"
            ? Math.min(3, Math.max(1, Math.round(patch.importance)))
            : item.importance,
      };
    });
  } catch {
    // Enrichment is an upgrade, not a requirement.
    return items;
  }
}

/** Claude sometimes wraps JSON in prose or a code fence. */
export function extractJson(text: string): unknown | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}
