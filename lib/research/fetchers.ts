import Parser from "rss-parser";
import type { ResearchSource } from "./sources";
import { METROS, TRADES, NATIONAL_METRO } from "./taxonomy";

/**
 * A normalized item, before it is scored and written to the DB. Every adapter
 * below reduces its source's payload shape to this.
 */
export interface RawItem {
  headline: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  sourceTier: string;
  category: string;
  trade: string;
  metro: string;
  publishedAt: Date;
}

export interface FetchResult {
  sourceId: string;
  ok: boolean;
  items: RawItem[];
  error?: string;
  durationMs: number;
}

const USER_AGENT =
  "VirtusLabsResearch/1.0 (+https://virtus-labs.duckdns.org; internal market research)";

const DEFAULT_TIMEOUT_MS = 20_000;

/**
 * Some publishers reject non-browser agents outright. We identify honestly
 * first, and only fall back to a browser agent when a host refuses — this is
 * a low-volume weekly read of public feeds, not scraping.
 */
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36";

/** Never let one slow feed hold the whole weekly scan open. */
async function fetchWithTimeout(
  url: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const attempt = (agent: string) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, {
      headers: {
        "User-Agent": agent,
        Accept:
          "application/rss+xml, application/atom+xml, application/xml, application/json;q=0.9, */*;q=0.8",
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));
  };

  const first = await attempt(USER_AGENT);
  if (first.status === 403 || first.status === 401) {
    return attempt(BROWSER_USER_AGENT);
  }
  return first;
}

// ---------------------------------------------------------------------------
// Classification helpers
// ---------------------------------------------------------------------------

/**
 * Decide which metro a free-text item belongs to. Returns "national" when no
 * metro is clearly named — a national item is still useful, it just isn't
 * filed under one market.
 */
export function inferMetro(text: string): string {
  const haystack = text.toLowerCase();
  for (const metro of METROS) {
    for (const kw of metro.keywords) {
      if (haystack.includes(kw.toLowerCase())) return metro.slug;
    }
  }
  return NATIONAL_METRO;
}

/**
 * Decide which trade an item belongs to when the source covers several.
 * Scores each trade by keyword hits and takes the best; falls back to the
 * source's first declared trade so nothing is silently dropped.
 */
export function inferTrade(text: string, fallback: string): string {
  const haystack = text.toLowerCase();
  let best = { slug: fallback, score: 0 };
  for (const trade of TRADES) {
    let score = 0;
    for (const kw of trade.keywords) {
      if (haystack.includes(kw.toLowerCase())) score += 2;
    }
    // The trade's own name is a weaker signal than its jargon.
    if (haystack.includes(trade.name.toLowerCase())) score += 1;
    if (score > best.score) best = { slug: trade.slug, score };
  }
  return best.slug;
}

/** Collapse whitespace and strip tags out of feed descriptions. */
export function cleanText(input: string | undefined | null, max = 600): string {
  if (!input) return "";
  const text = input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/**
 * Pick the trade for a source that declares several, or "all".
 * `resolveTrade` is separated out so it can be unit-tested directly.
 */
export function resolveTrade(source: ResearchSource, text: string): string {
  if (source.trades === "all") return inferTrade(text, TRADES[0].slug);
  if (source.trades.length === 1) return source.trades[0];
  // Multi-trade source: infer, but only accept a trade the source actually covers.
  const inferred = inferTrade(text, source.trades[0]);
  return (source.trades as readonly string[]).includes(inferred)
    ? inferred
    : source.trades[0];
}

/** A source pinned to a metro wins; otherwise infer from the text. */
export function resolveMetro(source: ResearchSource, text: string): string {
  if (source.metro !== NATIONAL_METRO) return source.metro;
  return inferMetro(text);
}

// ---------------------------------------------------------------------------
// Adapters
// ---------------------------------------------------------------------------

const rssParser = new Parser({
  timeout: DEFAULT_TIMEOUT_MS,
  headers: { "User-Agent": USER_AGENT },
});

/**
 * Real-world feeds are frequently not well-formed — stray raw ampersands and
 * unescaped control characters are common enough that a strict parse throws on
 * otherwise usable content. Retry once on a cleaned copy before giving up.
 */
async function parseFeedLeniently(xml: string) {
  try {
    return await rssParser.parseString(xml);
  } catch (firstError) {
    const repaired = xml
      // Control characters that are illegal in XML.
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
      // Bare "&" that is not already the start of an entity.
      .replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#\d+|#x[0-9a-fA-F]+);)/g, "&amp;")
      .trim();
    try {
      return await rssParser.parseString(repaired);
    } catch {
      // Report the original failure — it describes the real problem.
      throw firstError;
    }
  }
}

export async function fetchRss(source: ResearchSource): Promise<RawItem[]> {
  const res = await fetchWithTimeout(source.url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  const feed = await parseFeedLeniently(xml);

  return (feed.items ?? []).slice(0, 25).map((item) => {
    const text = `${item.title ?? ""} ${item.contentSnippet ?? item.content ?? ""}`;
    return {
      headline: cleanText(item.title, 240) || "Untitled",
      summary: cleanText(item.contentSnippet ?? item.content ?? ""),
      sourceUrl: item.link ?? "",
      sourceName: source.name,
      sourceTier: source.tier,
      category: source.category,
      trade: resolveTrade(source, text),
      metro: resolveMetro(source, text),
      publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
    };
  });
}

/**
 * Federal Register API — free, no key. Returns structured rulemaking documents,
 * which is why this tier outranks trade press: it is the primary record.
 */
export async function fetchFederalRegister(
  source: ResearchSource,
): Promise<RawItem[]> {
  const url = new URL(source.url);
  url.searchParams.set("per_page", "20");
  url.searchParams.set("order", "newest");
  if (source.query) url.searchParams.set("conditions[term]", source.query);
  // Only look back a year — older rules are history, not news.
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  url.searchParams.set(
    "conditions[publication_date][gte]",
    cutoff.toISOString().slice(0, 10),
  );
  for (const field of [
    "title",
    "abstract",
    "html_url",
    "publication_date",
    "agencies",
    "type",
  ]) {
    url.searchParams.append("fields[]", field);
  }

  const res = await fetchWithTimeout(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as {
    results?: Array<{
      title?: string;
      abstract?: string;
      html_url?: string;
      publication_date?: string;
      type?: string;
      agencies?: Array<{ name?: string }>;
    }>;
  };

  return (json.results ?? []).map((doc) => {
    const agency = doc.agencies?.[0]?.name ?? "Federal Register";
    const text = `${doc.title ?? ""} ${doc.abstract ?? ""}`;
    return {
      headline: cleanText(doc.title, 240) || "Untitled rule",
      summary: cleanText(doc.abstract) || `${doc.type ?? "Document"} — ${agency}`,
      sourceUrl: doc.html_url ?? "",
      sourceName: `Federal Register — ${agency}`,
      sourceTier: source.tier,
      category: source.category,
      trade: resolveTrade(source, text),
      metro: resolveMetro(source, text),
      publishedAt: doc.publication_date
        ? new Date(doc.publication_date)
        : new Date(),
    };
  });
}

/**
 * OpenAlex — free scholarly index, no key. This is what makes "research
 * journals" viable without subscriptions: it indexes the papers themselves,
 * and links to the open-access copy when one exists.
 */
export async function fetchOpenAlex(
  source: ResearchSource,
): Promise<RawItem[]> {
  const url = new URL(source.url);
  if (source.query) url.searchParams.set("search", source.query);
  url.searchParams.set("per-page", "15");
  url.searchParams.set("sort", "publication_date:desc");
  // Recent work only, and filter out items with no usable landing page.
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 6);
  url.searchParams.set(
    "filter",
    `from_publication_date:${cutoff.toISOString().slice(0, 10)}`,
  );
  // OpenAlex asks for a contact address to get the faster shared pool.
  url.searchParams.set("mailto", process.env.DIGEST_TO_EMAIL ?? "");

  const res = await fetchWithTimeout(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as {
    results?: Array<{
      title?: string;
      display_name?: string;
      publication_date?: string;
      doi?: string;
      id?: string;
      best_oa_location?: { landing_page_url?: string } | null;
      primary_location?: {
        landing_page_url?: string;
        source?: { display_name?: string } | null;
      } | null;
      abstract_inverted_index?: Record<string, number[]> | null;
    }>;
  };

  return (json.results ?? [])
    .map((work) => {
      const title = work.title ?? work.display_name ?? "";
      const journal =
        work.primary_location?.source?.display_name ?? "Open access";
      const link =
        work.best_oa_location?.landing_page_url ??
        work.primary_location?.landing_page_url ??
        work.doi ??
        work.id ??
        "";
      const abstract = reconstructAbstract(work.abstract_inverted_index);
      const text = `${title} ${abstract}`;
      return {
        headline: cleanText(title, 240) || "Untitled paper",
        summary: cleanText(abstract) || `Published in ${journal}.`,
        sourceUrl: link,
        sourceName: `${journal} (via OpenAlex)`,
        sourceTier: source.tier,
        category: source.category,
        trade: resolveTrade(source, text),
        metro: resolveMetro(source, text),
        publishedAt: work.publication_date
          ? new Date(work.publication_date)
          : new Date(),
      };
    })
    .filter((item) => item.sourceUrl);
}

/**
 * OpenAlex stores abstracts as an inverted index (word -> positions) rather
 * than plain text, so it has to be rebuilt before it is readable.
 */
export function reconstructAbstract(
  index: Record<string, number[]> | null | undefined,
): string {
  if (!index) return "";
  const slots: string[] = [];
  for (const [word, positions] of Object.entries(index)) {
    for (const pos of positions) slots[pos] = word;
  }
  return slots.filter(Boolean).join(" ");
}

/** arXiv Atom API — free, no key. Preprints, so treated as research-tier. */
export async function fetchArxiv(source: ResearchSource): Promise<RawItem[]> {
  const url = new URL(source.url);
  url.searchParams.set("search_query", `all:${source.query ?? ""}`);
  url.searchParams.set("max_results", "12");
  url.searchParams.set("sortBy", "submittedDate");
  url.searchParams.set("sortOrder", "descending");

  const res = await fetchWithTimeout(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  const feed = await rssParser.parseString(xml);

  return (feed.items ?? []).map((entry) => {
    const text = `${entry.title ?? ""} ${entry.contentSnippet ?? ""}`;
    return {
      headline: cleanText(entry.title, 240) || "Untitled preprint",
      summary: cleanText(entry.contentSnippet ?? entry.content ?? ""),
      sourceUrl: entry.link ?? "",
      sourceName: "arXiv preprint",
      sourceTier: source.tier,
      category: source.category,
      trade: resolveTrade(source, text),
      metro: resolveMetro(source, text),
      publishedAt: entry.isoDate ? new Date(entry.isoDate) : new Date(),
    };
  });
}

/**
 * Socrata municipal open data. Permits are the leading indicator — they say
 * which trades are about to be busy, ahead of any trade-press coverage.
 */
export async function fetchSocrata(
  source: ResearchSource,
): Promise<RawItem[]> {
  // Socrata rejects the whole request with a 400 if $where or $order names a
  // column the dataset does not have, and column names vary between portals.
  // Ask for a plain page and do the sorting and filtering here instead, so a
  // schema difference costs us ordering rather than the entire source.
  const url = new URL(source.url);
  // Commercial permits are a small slice of this dataset, so the page has to
  // be large enough that filtering does not leave it empty.
  url.searchParams.set("$limit", "800");

  const res = await fetchWithTimeout(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = (await res.json()) as Array<SocrataPermitRow>;

  // Socrata omits null fields per row rather than emitting them, so a column
  // can be present on some rows and absent on others. Every read here has a
  // fallback for that reason.
  const dateOf = (row: SocrataPermitRow) =>
    row.issue_date ?? row.issued_date ?? row.applieddate ?? "";
  const valueOf = (row: SocrataPermitRow) =>
    Number(row.total_job_valuation ?? row.total_valuation ?? 0);

  const rows = raw
    // Residential permits — irrigation, re-roofs, single-family work — are the
    // bulk of this dataset and are not the market being tracked.
    .filter((row) => {
      const cls = `${row.permit_class_mapped ?? ""} ${row.permit_class ?? ""}`;
      return /commercial/i.test(cls);
    })
    .sort((a, b) => dateOf(b).localeCompare(dateOf(a)))
    .slice(0, 40);

  return rows
    .map((row) => {
      const desc = row.description ?? row.permit_type_desc ?? "Permit issued";
      const workClass = row.work_class ?? "";
      const value = valueOf(row);
      const address = [row.original_address1, row.original_city]
        .filter(Boolean)
        .join(", ");
      const permitNum = row.permit_number ?? "";
      const text = `${desc} ${row.permit_type_desc ?? ""} ${workClass}`;
      return {
        headline: cleanText(
          [row.permit_type_desc, workClass && `(${workClass})`, "—", desc]
            .filter(Boolean)
            .join(" "),
          240,
        ),
        summary: cleanText(
          [
            address && `Site: ${address}.`,
            value > 0 && `Declared valuation $${value.toLocaleString()}.`,
            permitNum && `Permit ${permitNum}.`,
            row.status_current && `Status: ${row.status_current}.`,
          ]
            .filter(Boolean)
            .join(" "),
        ),
        // The dataset carries a real permalink per row; prefer it over a
        // hand-built query URL that may not resolve.
        sourceUrl:
          row.link?.url ??
          (permitNum
            ? `${url.origin}${url.pathname.replace(".json", "")}?permit_number=${encodeURIComponent(permitNum)}`
            : ""),
        sourceName: source.name,
        sourceTier: source.tier,
        category: source.category,
        trade: resolveTrade(source, text),
        metro: source.metro,
        publishedAt: dateOf(row) ? new Date(dateOf(row)) : new Date(),
      };
    })
    .filter((item) => item.sourceUrl);
}

/** Shape of the Austin issued-permits dataset, as returned by Socrata. */
interface SocrataPermitRow {
  permit_number?: string;
  permit_type_desc?: string;
  permit_class_mapped?: string;
  permit_class?: string;
  work_class?: string;
  description?: string;
  original_address1?: string;
  original_city?: string;
  status_current?: string;
  issue_date?: string;
  issued_date?: string;
  applieddate?: string;
  total_job_valuation?: string;
  total_valuation?: string;
  link?: { url?: string };
}

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------

/**
 * Fetch one source. Never throws — a dead feed produces `ok: false` so the
 * scan can carry on and the failure shows up in the run log.
 */
export async function fetchSource(
  source: ResearchSource,
): Promise<FetchResult> {
  const started = Date.now();
  try {
    let items: RawItem[];
    switch (source.kind) {
      case "rss":
        items = await fetchRss(source);
        break;
      case "federalregister":
        items = await fetchFederalRegister(source);
        break;
      case "openalex":
        items = await fetchOpenAlex(source);
        break;
      case "arxiv":
        items = await fetchArxiv(source);
        break;
      case "socrata":
        items = await fetchSocrata(source);
        break;
      default:
        throw new Error(`Unknown source kind: ${source.kind}`);
    }
    // Drop anything with no link — the URL is the dedupe key.
    items = items.filter((i) => i.sourceUrl && i.headline);
    return {
      sourceId: source.id,
      ok: true,
      items,
      durationMs: Date.now() - started,
    };
  } catch (err) {
    return {
      sourceId: source.id,
      ok: false,
      items: [],
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - started,
    };
  }
}
