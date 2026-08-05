#!/usr/bin/env tsx
/**
 * Find the real RSS path for a publisher by probing common feed conventions.
 *
 * Feed URLs are not discoverable from outside a network that can reach the
 * host, so this exists to answer the question on the deployment box rather
 * than guessing. Run it, then paste working URLs into lib/research/sources.ts.
 *
 *   npm run discover:feeds            # probe every publisher below
 *   npm run discover:feeds achr       # probe matching hosts only
 */
import "dotenv/config";
import Parser from "rss-parser";

const parser = new Parser({ timeout: 15_000 });

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36";

/** Paths tried against every host, in rough order of how common they are. */
const COMMON_PATHS = [
  "/rss",
  "/feed",
  "/rss.xml",
  "/feed.xml",
  "/atom.xml",
  "/index.xml",
  "/feeds/all.rss.xml",
  "/rss/articles",
  "/rss/all",
  "/rss/all-news",
  "/feeds/news",
  "/feeds/news/",
  "/news/rss",
  "/news.rss",
  "/?feed=rss2",
];

/** Publishers whose feed we still need, plus any site-specific guesses. */
const PUBLISHERS: Array<{ id: string; origin: string; extra?: string[] }> = [
  {
    id: "enr",
    origin: "https://www.enr.com",
    extra: ["/rss/all", "/topics/feed", "/articles.rss"],
  },
  {
    id: "achr-news",
    origin: "https://www.achrnews.com",
    extra: ["/rss/topic/2640", "/articles.rss", "/rss/topic"],
  },
  {
    id: "ec-mag",
    origin: "https://www.ecmag.com",
    extra: ["/rss/articles", "/magazine/rss"],
  },
  {
    id: "pm-engineer",
    origin: "https://www.pmmag.com",
    extra: ["/rss/topic", "/articles.rss"],
  },
  {
    id: "bd-c",
    origin: "https://www.bdcnetwork.com",
    extra: ["/rss/articles", "/taxonomy/term/1/feed"],
  },
  {
    id: "epa-newsroom",
    origin: "https://www.epa.gov",
    extra: [
      "/newsreleases/search/rss/field_press_office/headquarters",
      "/newsreleases/rss.xml",
      "/newsreleases/search/rss/",
    ],
  },
  {
    id: "facilitiesnet",
    origin: "https://www.facilitiesnet.com",
    extra: ["/rss/fnPrime.xml", "/rss/all.xml"],
  },
];

async function probe(url: string): Promise<{ ok: boolean; note: string }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    const res = await fetch(url, {
      headers: { "User-Agent": BROWSER_UA, Accept: "*/*" },
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));

    if (!res.ok) return { ok: false, note: `HTTP ${res.status}` };

    const body = await res.text();
    // A 200 that returns a web page is not a feed.
    if (!/<(rss|feed|rdf:RDF)[\s>]/i.test(body)) {
      return { ok: false, note: "200 but not a feed (probably HTML)" };
    }
    const parsed = await parser.parseString(body);
    const count = parsed.items?.length ?? 0;
    if (count === 0) return { ok: false, note: "parsed but empty" };
    return {
      ok: true,
      note: `${count} items — "${(parsed.items[0].title ?? "").slice(0, 60)}"`,
    };
  } catch (err) {
    return {
      ok: false,
      note: err instanceof Error ? err.message.slice(0, 60) : String(err),
    };
  }
}

async function main() {
  const filter = process.argv[2];
  const targets = filter
    ? PUBLISHERS.filter((p) => p.id.includes(filter))
    : PUBLISHERS;

  const found: Array<{ id: string; url: string; note: string }> = [];

  for (const pub of targets) {
    console.log(`\n=== ${pub.id} (${pub.origin}) ===`);
    const paths = [...(pub.extra ?? []), ...COMMON_PATHS];
    let hit = false;

    for (const path of paths) {
      const url = `${pub.origin}${path}`;
      const result = await probe(url);
      if (result.ok) {
        console.log(`  FOUND ${url}`);
        console.log(`        ${result.note}`);
        found.push({ id: pub.id, url, note: result.note });
        hit = true;
        break; // First working path per publisher is enough.
      }
    }

    if (!hit) console.log(`  none of ${paths.length} candidate paths worked`);
  }

  console.log(`\n\n${"=".repeat(60)}`);
  if (found.length) {
    console.log("Paste these into lib/research/sources.ts:\n");
    for (const f of found) console.log(`  ${f.id.padEnd(16)} ${f.url}`);
  } else {
    console.log("No feeds found. Disable these sources with enabled: false.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
