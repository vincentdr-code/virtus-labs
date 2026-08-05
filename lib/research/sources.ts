import type { SourceTier, TradeSlug } from "./taxonomy";

/**
 * Free source registry. Every entry here must be reachable without a paid
 * subscription and without an API key — anything needing a key is opt-in via
 * env and degrades to "skipped" rather than failing the scan.
 *
 * `kind` selects the adapter in fetchers.ts:
 *   rss            — any RSS/Atom feed
 *   federalregister— Federal Register API (free, no key) for federal rulemaking
 *   openalex       — OpenAlex scholarly index (free, no key) for journal papers
 *   arxiv          — arXiv Atom API (free, no key) for preprints
 *   socrata        — municipal open-data portals (free; key optional)
 *
 * `trades: "all"` means the adapter decides the trade per item from keywords.
 */
export interface ResearchSource {
  id: string;
  name: string;
  kind: "rss" | "federalregister" | "openalex" | "arxiv" | "socrata";
  url: string;
  tier: SourceTier;
  category: string;
  trades: TradeSlug[] | "all";
  metro: string;
  /** Extra query terms for API-style sources. */
  query?: string;
  /** Set false to keep an entry documented but out of the scan rotation. */
  enabled?: boolean;
}

// ---------------------------------------------------------------------------
// Tier 1 — Regulatory. Federal rulemaking is the highest-signal free source
// available: it is authoritative, structured, and has a real API.
// ---------------------------------------------------------------------------

const REGULATORY: ResearchSource[] = [
  {
    id: "fedreg-hvac-refrigerant",
    name: "Federal Register — refrigerant & AIM Act",
    kind: "federalregister",
    url: "https://www.federalregister.gov/api/v1/documents.json",
    query: "hydrofluorocarbon refrigerant",
    tier: "REGULATORY",
    category: "regulatory",
    trades: ["hvac", "mechanical"],
    metro: "national",
  },
  {
    id: "fedreg-energy-code",
    name: "Federal Register — building energy codes",
    kind: "federalregister",
    url: "https://www.federalregister.gov/api/v1/documents.json",
    query: "energy conservation standards",
    tier: "REGULATORY",
    category: "regulatory",
    trades: ["hvac", "mechanical", "electrical", "architecture"],
    metro: "national",
  },
  {
    id: "fedreg-environmental",
    name: "Federal Register — NEPA, wetlands, stormwater",
    kind: "federalregister",
    url: "https://www.federalregister.gov/api/v1/documents.json",
    query: "stormwater wetlands",
    tier: "REGULATORY",
    category: "regulatory",
    trades: ["environmental", "civil"],
    metro: "national",
  },
  {
    id: "fedreg-infrastructure",
    name: "Federal Register — infrastructure & construction",
    kind: "federalregister",
    url: "https://www.federalregister.gov/api/v1/documents.json",
    query: "construction industry infrastructure",
    tier: "REGULATORY",
    category: "regulatory",
    trades: ["civil", "architecture"],
    metro: "national",
  },
  {
    id: "fedreg-electrical-grid",
    name: "Federal Register — grid & interconnection",
    kind: "federalregister",
    url: "https://www.federalregister.gov/api/v1/documents.json",
    query: "electric transmission reliability",
    tier: "REGULATORY",
    category: "regulatory",
    trades: ["electrical"],
    metro: "national",
  },
  {
    id: "epa-newsroom",
    name: "EPA Newsroom",
    kind: "rss",
    url: "https://www.epa.gov/newsreleases/search/rss",
    tier: "REGULATORY",
    category: "regulatory",
    trades: ["environmental"],
    metro: "national",
  },
  {
    id: "osha-news",
    name: "OSHA National News",
    kind: "rss",
    url: "https://www.osha.gov/news/newsreleases.xml",
    tier: "REGULATORY",
    category: "labor",
    trades: "all",
    metro: "national",
  },
];

// ---------------------------------------------------------------------------
// Tier 1 — Research journals. OpenAlex indexes essentially every scholarly
// work and is free with no key, which makes it the practical way to watch
// peer-reviewed output across all seven trades.
// ---------------------------------------------------------------------------

const JOURNALS: ResearchSource[] = [
  {
    id: "openalex-hvac",
    name: "OpenAlex — HVAC & building systems research",
    kind: "openalex",
    url: "https://api.openalex.org/works",
    query: "HVAC building energy performance",
    tier: "JOURNAL",
    category: "research",
    trades: ["hvac", "mechanical"],
    metro: "national",
  },
  {
    id: "openalex-construction-mgmt",
    name: "OpenAlex — construction engineering & management",
    kind: "openalex",
    url: "https://api.openalex.org/works",
    query: "construction engineering management productivity",
    tier: "JOURNAL",
    category: "research",
    trades: ["civil", "mechanical", "architecture"],
    metro: "national",
  },
  {
    id: "openalex-bim",
    name: "OpenAlex — BIM & digital delivery",
    kind: "openalex",
    url: "https://api.openalex.org/works",
    query: "building information modeling adoption",
    tier: "JOURNAL",
    category: "research",
    trades: ["architecture", "civil"],
    metro: "national",
  },
  {
    id: "openalex-stormwater",
    name: "OpenAlex — stormwater & site hydrology",
    kind: "openalex",
    url: "https://api.openalex.org/works",
    query: "urban stormwater management green infrastructure",
    tier: "JOURNAL",
    category: "research",
    trades: ["environmental", "civil"],
    metro: "national",
  },
  {
    id: "openalex-resilience",
    name: "OpenAlex — coastal resilience & sea-level rise",
    kind: "openalex",
    url: "https://api.openalex.org/works",
    query: "coastal flooding resilience infrastructure adaptation",
    tier: "JOURNAL",
    category: "research",
    trades: ["civil", "environmental", "architecture"],
    metro: "miami",
  },
  {
    id: "openalex-grid",
    name: "OpenAlex — data center power & grid load",
    kind: "openalex",
    url: "https://api.openalex.org/works",
    query: "data center electricity demand grid capacity",
    tier: "JOURNAL",
    category: "research",
    trades: ["electrical", "mechanical"],
    metro: "national",
  },
  {
    id: "openalex-water",
    name: "OpenAlex — potable water & plumbing systems",
    kind: "openalex",
    url: "https://api.openalex.org/works",
    query: "building water system premise plumbing quality",
    tier: "JOURNAL",
    category: "research",
    trades: ["plumbing", "environmental"],
    metro: "national",
  },
  {
    id: "arxiv-structures",
    name: "arXiv — structural & materials preprints",
    kind: "arxiv",
    url: "http://export.arxiv.org/api/query",
    query: "structural health monitoring OR construction automation",
    tier: "JOURNAL",
    category: "research",
    trades: ["civil", "architecture"],
    metro: "national",
  },
];

// ---------------------------------------------------------------------------
// Tier 2 — Municipal open data. Permits filed are the leading indicator of
// which trades are about to be in demand in a given metro.
// ---------------------------------------------------------------------------

const GOV_DATA: ResearchSource[] = [
  {
    id: "austin-permits",
    name: "City of Austin — issued construction permits",
    kind: "socrata",
    url: "https://data.austintexas.gov/resource/3syk-w9eu.json",
    tier: "GOV_DATA",
    category: "project",
    trades: "all",
    metro: "austin",
  },
];

// ---------------------------------------------------------------------------
// Tier 2/3 — Trade press and industry news. Lower authority per item, but the
// fastest to surface a shift, and the only tier that reliably covers the
// contractor-business angle rather than the engineering angle.
// ---------------------------------------------------------------------------

const TRADE_PRESS: ResearchSource[] = [
  {
    id: "construction-dive",
    name: "Construction Dive",
    kind: "rss",
    url: "https://www.constructiondive.com/feeds/news/",
    tier: "TRADE_PRESS",
    category: "market",
    trades: "all",
    metro: "national",
  },
  {
    id: "enr",
    name: "Engineering News-Record",
    kind: "rss",
    url: "https://www.enr.com/rss/all-news",
    tier: "TRADE_PRESS",
    category: "market",
    trades: "all",
    metro: "national",
  },
  {
    id: "achr-news",
    name: "ACHR News (HVACR)",
    kind: "rss",
    url: "https://www.achrnews.com/rss/all-news",
    tier: "TRADE_PRESS",
    category: "market",
    trades: ["hvac", "mechanical"],
    metro: "national",
  },
  {
    id: "ec-mag",
    name: "Electrical Contractor Magazine",
    kind: "rss",
    url: "https://www.ecmag.com/rss.xml",
    tier: "TRADE_PRESS",
    category: "market",
    trades: ["electrical"],
    metro: "national",
  },
  {
    id: "pm-engineer",
    name: "Plumbing & Mechanical",
    kind: "rss",
    url: "https://www.pmmag.com/rss/all-news",
    tier: "TRADE_PRESS",
    category: "market",
    trades: ["plumbing", "mechanical"],
    metro: "national",
  },
  {
    id: "archdaily",
    name: "ArchDaily",
    kind: "rss",
    url: "https://www.archdaily.com/rss/",
    tier: "TRADE_PRESS",
    category: "tech",
    trades: ["architecture"],
    metro: "national",
  },
  {
    id: "bd-c",
    name: "Building Design + Construction",
    kind: "rss",
    url: "https://www.bdcnetwork.com/rss.xml",
    tier: "TRADE_PRESS",
    category: "market",
    trades: ["architecture", "civil", "mechanical"],
    metro: "national",
  },
  {
    id: "smart-cities-dive",
    name: "Smart Cities Dive",
    kind: "rss",
    url: "https://www.smartcitiesdive.com/feeds/news/",
    tier: "TRADE_PRESS",
    category: "tech",
    trades: ["civil", "environmental"],
    metro: "national",
  },
  {
    id: "utility-dive",
    name: "Utility Dive",
    kind: "rss",
    url: "https://www.utilitydive.com/feeds/news/",
    tier: "TRADE_PRESS",
    category: "market",
    trades: ["electrical"],
    metro: "national",
  },
  {
    id: "facilitiesnet",
    name: "FacilitiesNet",
    kind: "rss",
    url: "https://www.facilitiesnet.com/rss/news.xml",
    tier: "TRADE_PRESS",
    category: "tech",
    trades: ["hvac", "mechanical", "electrical"],
    metro: "national",
  },
];

export const SOURCES: ResearchSource[] = [
  ...REGULATORY,
  ...JOURNALS,
  ...GOV_DATA,
  ...TRADE_PRESS,
];

export const ENABLED_SOURCES = SOURCES.filter((s) => s.enabled !== false);

export function getSource(id: string) {
  return SOURCES.find((s) => s.id === id);
}

/** Grouped for the "where this comes from" panel in the UI. */
export function sourcesByTier() {
  const groups = new Map<SourceTier, ResearchSource[]>();
  for (const s of ENABLED_SOURCES) {
    const list = groups.get(s.tier) ?? [];
    list.push(s);
    groups.set(s.tier, list);
  }
  return groups;
}
