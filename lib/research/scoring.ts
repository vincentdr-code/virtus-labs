import type { RawItem } from "./fetchers";
import { SOURCE_TIERS, type SourceTier } from "./taxonomy";

/**
 * Importance scoring decides two things: ordering in the feed, and whether an
 * item is worth an email on its own. It runs before any Claude call so the
 * scan still produces a ranked feed when no API key is configured.
 *
 * 1 = background   2 = worth reading   3 = flag it, this changes something
 */

/** Phrases that indicate a real change rather than commentary about one. */
const HIGH_SIGNAL = [
  "final rule",
  "effective date",
  "takes effect",
  "adopted",
  "mandate",
  "deadline",
  "phase-out",
  "phaseout",
  "banned",
  "moratorium",
  "recertification",
  "code update",
  "code adoption",
  "acquires",
  "acquisition",
  "merger",
  "shortage",
  "backlog",
  "moratorium",
];

const MEDIUM_SIGNAL = [
  "proposed rule",
  "comment period",
  "draft",
  "study finds",
  "report",
  "forecast",
  "survey",
  "pilot",
  "grant",
  "funding",
];

/** Commentary and marketing — real coverage, but not a change to act on. */
const LOW_SIGNAL = [
  "opinion",
  "sponsored",
  "webinar",
  "podcast",
  "how to",
  "top 10",
  "best practices",
  "award",
  "names new",
  "appoints",
];

export function scoreImportance(item: RawItem): number {
  const text = `${item.headline} ${item.summary}`.toLowerCase();

  // Start from the authority of the source itself.
  const tierWeight =
    SOURCE_TIERS[item.sourceTier as SourceTier]?.weight ?? 1;
  let score = tierWeight;

  if (HIGH_SIGNAL.some((p) => text.includes(p))) score += 2;
  else if (MEDIUM_SIGNAL.some((p) => text.includes(p))) score += 1;

  if (LOW_SIGNAL.some((p) => text.includes(p))) score -= 2;

  // An item tied to one of the three target metros beats a national one.
  if (item.metro !== "national") score += 1;

  // Stale items lose their claim on attention even if authoritative.
  const ageDays = (Date.now() - item.publishedAt.getTime()) / 86_400_000;
  if (ageDays > 30) score -= 1;
  if (ageDays > 120) score -= 1;

  return clampImportance(score);
}

/** Map a raw score onto the 1-3 storage scale. */
export function clampImportance(score: number): number {
  if (score >= 5) return 3;
  if (score >= 3) return 2;
  return 1;
}

/**
 * Remove items already seen. `sourceUrl` is the dedupe key and is unique in
 * the DB, but a single scan can also surface the same URL from two feeds, so
 * within-batch duplicates are collapsed here too.
 */
export function dedupe(items: RawItem[], knownUrls: Set<string>): RawItem[] {
  const seen = new Set<string>();
  const out: RawItem[] = [];
  for (const item of items) {
    const key = normalizeUrl(item.sourceUrl);
    if (!key || seen.has(key) || knownUrls.has(key)) continue;
    seen.add(key);
    out.push({ ...item, sourceUrl: key });
  }
  return out;
}

/**
 * Strip tracking parameters and trailing slashes so the same article arriving
 * from two feeds collapses to one row.
 */
export function normalizeUrl(raw: string): string {
  if (!raw) return "";
  try {
    const url = new URL(raw);
    const strip = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "fbclid",
      "gclid",
      "mc_cid",
      "mc_eid",
    ];
    for (const p of strip) url.searchParams.delete(p);
    url.hash = "";
    let out = url.toString();
    if (out.endsWith("/")) out = out.slice(0, -1);
    return out;
  } catch {
    return raw.trim();
  }
}

/** Newest and most important first — the order the feed and email both use. */
export function rankItems<
  T extends { importance: number; publishedAt: Date },
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (b.importance !== a.importance) return b.importance - a.importance;
    return b.publishedAt.getTime() - a.publishedAt.getTime();
  });
}
