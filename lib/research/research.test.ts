import { describe, it, expect } from "vitest";
import {
  cleanText,
  inferMetro,
  inferTrade,
  reconstructAbstract,
  resolveMetro,
  resolveTrade,
  type RawItem,
} from "./fetchers";
import {
  clampImportance,
  dedupe,
  normalizeUrl,
  rankItems,
  scoreImportance,
} from "./scoring";
import { extractJson } from "./ingest";
import {
  groupByMetro,
  renderDigestText,
  renderDigestHtml,
  MAX_PER_METRO,
  MAX_NATIONAL,
  type DigestItem,
} from "./digest";
import { ENABLED_SOURCES, SOURCES } from "./sources";
import { METROS, TRADES, isTradeSlug, isMetroSlug } from "./taxonomy";
import type { ResearchSource } from "./sources";

function makeItem(overrides: Partial<RawItem> = {}): RawItem {
  return {
    headline: "Test headline",
    summary: "Test summary",
    sourceUrl: "https://example.com/a",
    sourceName: "Test source",
    sourceTier: "TRADE_PRESS",
    category: "market",
    trade: "hvac",
    metro: "national",
    publishedAt: new Date(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------

describe("taxonomy", () => {
  it("has seven trades and three metros", () => {
    expect(TRADES).toHaveLength(7);
    expect(METROS).toHaveLength(3);
  });

  it("validates slugs", () => {
    expect(isTradeSlug("hvac")).toBe(true);
    expect(isTradeSlug("welding")).toBe(false);
    expect(isMetroSlug("miami")).toBe(true);
    expect(isMetroSlug("national")).toBe(true);
    expect(isMetroSlug("denver")).toBe(false);
  });

  it("uses unique slugs", () => {
    const tradeSlugs = new Set(TRADES.map((t) => t.slug));
    expect(tradeSlugs.size).toBe(TRADES.length);
  });
});

describe("source registry", () => {
  it("has unique ids", () => {
    const ids = SOURCES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only declares trades that exist", () => {
    const valid = new Set(TRADES.map((t) => t.slug));
    for (const source of SOURCES) {
      if (source.trades === "all") continue;
      for (const t of source.trades) {
        expect(valid.has(t), `${source.id} declares unknown trade ${t}`).toBe(true);
      }
    }
  });

  it("only declares metros that exist", () => {
    for (const source of SOURCES) {
      expect(isMetroSlug(source.metro), `${source.id} has bad metro`).toBe(true);
    }
  });

  it("covers every trade with at least one source", () => {
    for (const trade of TRADES) {
      const covered = ENABLED_SOURCES.some(
        (s) => s.trades === "all" || (s.trades as readonly string[]).includes(trade.slug),
      );
      expect(covered, `no source covers ${trade.slug}`).toBe(true);
    }
  });

  it("includes free research-journal and regulatory tiers", () => {
    expect(ENABLED_SOURCES.some((s) => s.tier === "JOURNAL")).toBe(true);
    expect(ENABLED_SOURCES.some((s) => s.tier === "REGULATORY")).toBe(true);
  });
});

// ---------------------------------------------------------------------------

describe("cleanText", () => {
  it("strips tags and collapses whitespace", () => {
    expect(cleanText("<p>Hello   <b>world</b></p>")).toBe("Hello world");
  });

  it("decodes common entities", () => {
    expect(cleanText("R&amp;D &quot;quoted&quot;")).toBe('R&D "quoted"');
  });

  it("truncates with an ellipsis", () => {
    const out = cleanText("a".repeat(100), 20);
    expect(out).toHaveLength(20);
    expect(out.endsWith("…")).toBe(true);
  });

  it("handles null and undefined", () => {
    expect(cleanText(null)).toBe("");
    expect(cleanText(undefined)).toBe("");
  });
});

describe("inferMetro", () => {
  it("finds each target metro by keyword", () => {
    expect(inferMetro("New permits filed in Loudoun County")).toBe("nova");
    expect(inferMetro("Miami-Dade recertification backlog")).toBe("miami");
    expect(inferMetro("Travis County growth")).toBe("austin");
  });

  it("is case insensitive", () => {
    expect(inferMetro("ASHBURN data center")).toBe("nova");
  });

  it("falls back to national when no metro is named", () => {
    expect(inferMetro("EPA issues new federal rule")).toBe("national");
  });
});

describe("inferTrade", () => {
  it("picks the trade with the strongest keyword signal", () => {
    expect(inferTrade("New NEC 2023 switchgear requirements", "hvac")).toBe(
      "electrical",
    );
    expect(inferTrade("R-454B refrigerant transition under the AIM Act", "civil")).toBe(
      "hvac",
    );
  });

  it("falls back when nothing matches", () => {
    expect(inferTrade("unrelated content about pottery", "plumbing")).toBe(
      "plumbing",
    );
  });
});

describe("resolveTrade / resolveMetro", () => {
  const base: ResearchSource = {
    id: "t",
    name: "T",
    kind: "rss",
    url: "https://example.com",
    tier: "TRADE_PRESS",
    category: "market",
    trades: ["hvac"],
    metro: "national",
  };

  it("uses the single declared trade directly", () => {
    expect(resolveTrade(base, "anything at all")).toBe("hvac");
  });

  it("never returns a trade the source does not cover", () => {
    const multi: ResearchSource = {
      ...base,
      trades: ["plumbing", "civil"],
    };
    // Text points at electrical, which this source does not cover.
    const result = resolveTrade(multi, "NEC switchgear IBEW");
    expect(["plumbing", "civil"]).toContain(result);
  });

  it("infers freely when the source covers all trades", () => {
    const all = { ...base, trades: "all" as const };
    expect(resolveTrade(all, "wetlands delineation Phase I ESA")).toBe(
      "environmental",
    );
  });

  it("keeps a pinned metro instead of inferring", () => {
    const pinned = { ...base, metro: "austin" };
    expect(resolveMetro(pinned, "Miami-Dade news")).toBe("austin");
  });

  it("infers metro for national sources", () => {
    expect(resolveMetro(base, "Fairfax County approves")).toBe("nova");
  });
});

describe("reconstructAbstract", () => {
  it("rebuilds text from an inverted index", () => {
    expect(
      reconstructAbstract({ Building: [0], energy: [1], performance: [2] }),
    ).toBe("Building energy performance");
  });

  it("handles words appearing more than once", () => {
    expect(reconstructAbstract({ the: [0, 2], cat: [1], hat: [3] })).toBe(
      "the cat the hat",
    );
  });

  it("returns empty for null", () => {
    expect(reconstructAbstract(null)).toBe("");
    expect(reconstructAbstract(undefined)).toBe("");
  });
});

// ---------------------------------------------------------------------------

describe("normalizeUrl", () => {
  it("strips tracking parameters", () => {
    expect(
      normalizeUrl("https://example.com/a?utm_source=rss&utm_medium=feed&id=7"),
    ).toBe("https://example.com/a?id=7");
  });

  it("strips the fragment and trailing slash", () => {
    expect(normalizeUrl("https://example.com/a/#section")).toBe(
      "https://example.com/a",
    );
  });

  it("passes through malformed input rather than throwing", () => {
    expect(normalizeUrl("not a url")).toBe("not a url");
    expect(normalizeUrl("")).toBe("");
  });
});

describe("dedupe", () => {
  it("drops items already stored", () => {
    const known = new Set(["https://example.com/a"]);
    const out = dedupe([makeItem({ sourceUrl: "https://example.com/a" })], known);
    expect(out).toHaveLength(0);
  });

  it("collapses duplicates within one batch", () => {
    const out = dedupe(
      [
        makeItem({ sourceUrl: "https://example.com/a" }),
        makeItem({ sourceUrl: "https://example.com/a?utm_source=x" }),
      ],
      new Set(),
    );
    expect(out).toHaveLength(1);
  });

  it("treats the same article from two feeds as one", () => {
    const known = new Set([normalizeUrl("https://example.com/a")]);
    const out = dedupe(
      [makeItem({ sourceUrl: "https://example.com/a?utm_campaign=weekly" })],
      known,
    );
    expect(out).toHaveLength(0);
  });

  it("drops items with no url", () => {
    expect(dedupe([makeItem({ sourceUrl: "" })], new Set())).toHaveLength(0);
  });

  it("keeps genuinely distinct items", () => {
    const out = dedupe(
      [
        makeItem({ sourceUrl: "https://example.com/a" }),
        makeItem({ sourceUrl: "https://example.com/b" }),
      ],
      new Set(),
    );
    expect(out).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------

describe("scoreImportance", () => {
  it("scores a regulatory final rule in a target metro at the top", () => {
    const score = scoreImportance(
      makeItem({
        headline: "EPA issues final rule on refrigerant phase-out",
        sourceTier: "REGULATORY",
        metro: "miami",
      }),
    );
    expect(score).toBe(3);
  });

  it("scores marketing filler at the bottom", () => {
    const score = scoreImportance(
      makeItem({
        headline: "Sponsored webinar: top 10 best practices",
        sourceTier: "TRADE_PRESS",
      }),
    );
    expect(score).toBe(1);
  });

  it("ranks a local item above the same item nationally", () => {
    const local = scoreImportance(
      makeItem({ headline: "Code update adopted", metro: "austin" }),
    );
    const national = scoreImportance(
      makeItem({ headline: "Code update adopted", metro: "national" }),
    );
    expect(local).toBeGreaterThanOrEqual(national);
  });

  it("discounts stale items", () => {
    const old = new Date(Date.now() - 200 * 86_400_000);
    const fresh = scoreImportance(
      makeItem({ headline: "Merger announced", sourceTier: "JOURNAL" }),
    );
    const stale = scoreImportance(
      makeItem({
        headline: "Merger announced",
        sourceTier: "JOURNAL",
        publishedAt: old,
      }),
    );
    expect(stale).toBeLessThan(fresh);
  });

  it("always returns 1, 2, or 3", () => {
    for (const tier of ["REGULATORY", "JOURNAL", "TRADE_PRESS"]) {
      for (const headline of ["final rule deadline", "sponsored webinar", "x"]) {
        const s = scoreImportance(makeItem({ headline, sourceTier: tier }));
        expect(s).toBeGreaterThanOrEqual(1);
        expect(s).toBeLessThanOrEqual(3);
      }
    }
  });
});

describe("clampImportance", () => {
  it("maps raw scores onto the 1-3 scale", () => {
    expect(clampImportance(-5)).toBe(1);
    expect(clampImportance(3)).toBe(2);
    expect(clampImportance(99)).toBe(3);
  });
});

describe("rankItems", () => {
  it("puts importance first, then recency", () => {
    const older = new Date("2026-01-01");
    const newer = new Date("2026-06-01");
    const ranked = rankItems([
      { importance: 1, publishedAt: newer, id: "low-new" },
      { importance: 3, publishedAt: older, id: "high-old" },
      { importance: 3, publishedAt: newer, id: "high-new" },
    ]);
    expect(ranked.map((r) => r.id)).toEqual(["high-new", "high-old", "low-new"]);
  });

  it("does not mutate its input", () => {
    const input = [
      { importance: 1, publishedAt: new Date(), id: "a" },
      { importance: 3, publishedAt: new Date(), id: "b" },
    ];
    rankItems(input);
    expect(input[0].id).toBe("a");
  });
});

// ---------------------------------------------------------------------------

describe("extractJson", () => {
  it("parses bare JSON", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("parses JSON inside a code fence", () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("parses JSON wrapped in prose", () => {
    expect(extractJson('Sure! {"a":1} hope that helps')).toEqual({ a: 1 });
  });

  it("returns null for unparseable text", () => {
    expect(extractJson("no json here")).toBeNull();
    expect(extractJson("{ broken")).toBeNull();
  });
});

// ---------------------------------------------------------------------------

describe("digest", () => {
  const items = [
    {
      id: "1",
      trade: "hvac",
      metro: "miami",
      headline: "Recertification deadline set",
      summary: "Condo boards must file by year end.",
      sourceUrl: "https://example.com/1",
      sourceName: "Florida DBPR",
      sourceTier: "REGULATORY",
      category: "regulatory",
      importance: 3,
      publishedAt: new Date("2026-08-01"),
    },
    {
      id: "2",
      trade: "electrical",
      metro: "nova",
      headline: "Interconnection queue grows",
      summary: "Grid capacity remains the constraint.",
      sourceUrl: "https://example.com/2",
      sourceName: "Utility Dive",
      sourceTier: "TRADE_PRESS",
      category: "market",
      importance: 2,
      publishedAt: new Date("2026-08-02"),
    },
    {
      id: "3",
      trade: "civil",
      metro: "national",
      headline: "Federal infrastructure update",
      summary: "National program news.",
      sourceUrl: "https://example.com/3",
      sourceName: "Federal Register",
      sourceTier: "REGULATORY",
      category: "regulatory",
      importance: 1,
      publishedAt: new Date("2026-08-03"),
    },
  ];

  it("groups by metro with national last", () => {
    const groups = groupByMetro(items);
    expect(groups.map((g) => g.slug)).toEqual(["nova", "miami", "national"]);
  });

  it("omits metros with no items", () => {
    const groups = groupByMetro([items[0]]);
    expect(groups.map((g) => g.slug)).toEqual(["miami"]);
  });

  it("renders every headline into the text digest", () => {
    const text = renderDigestText(items);
    for (const item of items) expect(text).toContain(item.headline);
  });

  it("marks importance-3 items in the text digest", () => {
    expect(renderDigestText(items)).toContain("[WORTH FLAGGING]");
  });

  it("renders a valid-looking html digest", () => {
    const html = renderDigestHtml(items);
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("TAILORSENT");
    expect(html).toContain("Recertification deadline set");
    expect(html).toContain("https://example.com/1");
  });

  it("shows category labels rather than raw storage slugs", () => {
    const html = renderDigestHtml([
      { ...items[0], category: "ma" },
    ]);
    expect(html).toContain("M&amp;A");
    // The bare slug must not appear as the visible chip text.
    expect(html).not.toMatch(/&middot; ma /);
  });

  it("escapes html in headlines", () => {
    const html = renderDigestHtml([
      { ...items[0], headline: '<script>alert("x")</script>' },
    ]);
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
  });

  it("handles an empty week without crashing", () => {
    expect(renderDigestText([])).toContain("No new items");
    expect(renderDigestHtml([])).toContain("No new items");
  });
});

describe("digest caps", () => {
  function bulk(metro: string, n: number, importance = 1): DigestItem[] {
    return Array.from({ length: n }, (_, i) => ({
      id: `${metro}-${i}`,
      trade: "hvac",
      metro,
      headline: `Item ${i}`,
      summary: "s",
      sourceUrl: `https://example.com/${metro}/${i}`,
      sourceName: "Src",
      sourceTier: "TRADE_PRESS",
      category: "market",
      importance,
      publishedAt: new Date(2026, 0, 1 + i),
    }));
  }

  it("caps a metro section and reports the overflow", () => {
    const groups = groupByMetro(bulk("miami", 40));
    const miami = groups.find((g) => g.slug === "miami")!;
    expect(miami.items).toHaveLength(MAX_PER_METRO);
    expect(miami.truncated).toBe(40 - MAX_PER_METRO);
  });

  it("caps the national section separately", () => {
    const groups = groupByMetro(bulk("national", 30));
    const national = groups.find((g) => g.slug === "national")!;
    expect(national.items).toHaveLength(MAX_NATIONAL);
    expect(national.truncated).toBe(30 - MAX_NATIONAL);
  });

  it("keeps the most important items when it truncates", () => {
    const mixed = [...bulk("miami", 20, 1), ...bulk("miami", 3, 3)].map(
      (item, i) => ({ ...item, sourceUrl: `https://example.com/x/${i}` }),
    );
    const miami = groupByMetro(mixed).find((g) => g.slug === "miami")!;
    // All three importance-3 items must survive the cut.
    expect(miami.items.filter((i) => i.importance === 3)).toHaveLength(3);
  });

  it("reports the overflow in both renderings", () => {
    const items = bulk("miami", 40);
    expect(renderDigestHtml(items)).toContain("more in the library");
    expect(renderDigestText(items)).toContain("more in the library");
  });

  it("does not truncate when a section is under the cap", () => {
    const groups = groupByMetro(bulk("austin", 5));
    expect(groups[0].truncated).toBe(0);
    expect(renderDigestHtml(bulk("austin", 5))).not.toContain("more in the library");
  });
});

describe("digest branding", () => {
  const flagged: DigestItem = {
    id: "f",
    trade: "hvac",
    metro: "miami",
    headline: "Deadline set",
    summary: "s",
    sourceUrl: "https://example.com/f",
    sourceName: "Src",
    sourceTier: "REGULATORY",
    category: "regulatory",
    importance: 3,
    publishedAt: new Date("2026-08-01"),
  };

  it("carries the TailorSent wordmark, not the old brand", () => {
    const html = renderDigestHtml([flagged]);
    expect(html).toContain("TAILORSENT");
    expect(html).not.toMatch(/virtus/i);
    expect(renderDigestText([flagged])).not.toMatch(/virtus/i);
  });

  it("flags urgent items in red, not the brand gold", () => {
    const html = renderDigestHtml([flagged]);
    // The badge must not reuse the accent that also marks brand chrome.
    expect(html).toMatch(/background:#E04255;[^"]*">\s*WORTH FLAGGING/);
  });

  it("uses the navy ground rather than the retired green palette", () => {
    const html = renderDigestHtml([flagged]);
    expect(html).toContain("#08152B");
    expect(html).not.toContain("#0A1613");
  });
});
