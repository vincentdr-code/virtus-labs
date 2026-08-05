/**
 * The two axes the research library is cut by: trade and metro.
 * Every NewsItem carries one of each. Slugs here are the storage keys —
 * changing one means migrating existing rows.
 */

export const TRADES = [
  {
    slug: "mechanical",
    name: "Mechanical",
    blurb: "Process piping, boilers, refrigeration, sheet metal",
    // Terms fed to search/filtering. Kept specific enough to avoid
    // pulling in unrelated "mechanical engineering" academic noise.
    keywords: [
      "mechanical contractor",
      "process piping",
      "sheet metal",
      "boiler",
      "chiller plant",
      "SMACNA",
      "MCAA",
    ],
  },
  {
    slug: "electrical",
    name: "Electrical",
    blurb: "Power distribution, controls, low-voltage, NEC compliance",
    keywords: [
      "electrical contractor",
      "National Electrical Code",
      "NEC 2023",
      "switchgear",
      "grid interconnection",
      "NECA",
      "IBEW",
    ],
  },
  {
    slug: "plumbing",
    name: "Plumbing",
    blurb: "Supply, drainage, medical gas, backflow, code-split states",
    keywords: [
      "plumbing contractor",
      "uniform plumbing code",
      "international plumbing code",
      "backflow prevention",
      "medical gas piping",
      "PHCC",
    ],
  },
  {
    slug: "hvac",
    name: "HVAC",
    blurb: "Air conditioning, refrigerant transition, load calculation",
    keywords: [
      "HVAC contractor",
      "refrigerant transition",
      "R-454B",
      "AIM Act",
      "Manual J",
      "ACCA",
      "AHRI",
    ],
  },
  {
    slug: "architecture",
    name: "Architecture",
    blurb: "Design practice, BIM adoption, licensure, code review",
    keywords: [
      "architecture firm",
      "BIM adoption",
      "Revit",
      "NCARB",
      "AIA",
      "building code adoption",
      "design-build",
    ],
  },
  {
    slug: "environmental",
    name: "Environmental Engineering",
    blurb: "Site assessment, wetlands, stormwater, remediation",
    keywords: [
      "environmental consulting",
      "Phase I ESA",
      "wetlands delineation",
      "MS4 stormwater",
      "brownfield remediation",
      "NEPA review",
    ],
  },
  {
    slug: "civil",
    name: "Civil Engineering",
    blurb: "Site civil, transportation, structural, land development",
    keywords: [
      "civil engineering firm",
      "land development",
      "site civil",
      "ASCE",
      "infrastructure report card",
      "structural engineering",
      "survey LiDAR",
    ],
  },
] as const;

export const METROS = [
  {
    slug: "austin",
    name: "Austin",
    state: "TX",
    stateName: "Texas",
    blurb: "Tech-driven build-out; fab and data center demand",
    // Used to decide whether a national item is locally relevant.
    keywords: [
      "Austin",
      "Travis County",
      "Williamson County",
      "Central Texas",
      "Round Rock",
      "Taylor Texas",
      "Georgetown Texas",
    ],
    stateAgency: "TCEQ",
    permitPortal: "City of Austin Development Services",
  },
  {
    slug: "nova",
    name: "Northern Virginia",
    state: "VA",
    stateName: "Virginia",
    blurb: "Data Center Alley; grid capacity is the constraint",
    keywords: [
      "Northern Virginia",
      "Loudoun County",
      "Fairfax County",
      "Prince William County",
      "Ashburn",
      "Data Center Alley",
      "Dominion Energy",
    ],
    stateAgency: "Virginia DEQ",
    permitPortal: "Fairfax / Loudoun / Prince William County",
  },
  {
    slug: "miami",
    name: "Miami",
    state: "FL",
    stateName: "Florida",
    blurb: "Recertification wave; HVHZ wind load; sea-level rise",
    keywords: [
      "Miami",
      "Miami-Dade",
      "Broward County",
      "South Florida",
      "Fort Lauderdale",
      "Coral Gables",
      "Surfside",
    ],
    stateAgency: "Florida DEP",
    permitPortal: "Miami-Dade / Broward permitting",
  },
] as const;

/**
 * "national" is a valid storage value for metro but is not a user-facing
 * filter — it holds items (a federal rule, a national journal paper) that
 * matter across all three markets.
 */
export const NATIONAL_METRO = "national" as const;

export type TradeSlug = (typeof TRADES)[number]["slug"];
export type MetroSlug = (typeof METROS)[number]["slug"] | typeof NATIONAL_METRO;

export const TRADE_SLUGS = TRADES.map((t) => t.slug) as readonly TradeSlug[];
export const METRO_SLUGS = METROS.map((m) => m.slug) as readonly string[];

export function getTrade(slug: string) {
  return TRADES.find((t) => t.slug === slug);
}

export function getMetro(slug: string) {
  return METROS.find((m) => m.slug === slug);
}

export function isTradeSlug(slug: string): slug is TradeSlug {
  return TRADE_SLUGS.includes(slug as TradeSlug);
}

export function isMetroSlug(slug: string): boolean {
  return METRO_SLUGS.includes(slug) || slug === NATIONAL_METRO;
}

/** Categories a news item can be filed under. Order is display order. */
export const CATEGORIES = [
  { slug: "regulatory", label: "Regulatory", hint: "Code, rules, agency action" },
  { slug: "research", label: "Research", hint: "Journals, standards bodies, labs" },
  { slug: "project", label: "Projects", hint: "Permits filed, developments announced" },
  { slug: "market", label: "Market", hint: "Sizing, demand, pricing" },
  { slug: "labor", label: "Labor", hint: "Workforce, apprenticeship, union" },
  { slug: "tech", label: "Technology", hint: "Tooling and adoption" },
  { slug: "ma", label: "M&A", hint: "PE roll-ups, consolidation" },
] as const;

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);

/**
 * Source tiers, ordered by how much weight a hit carries. A peer-reviewed
 * journal or a federal rule outranks a trade-press headline on the same topic.
 */
export const SOURCE_TIERS = {
  REGULATORY: { label: "Regulatory", weight: 3 },
  JOURNAL: { label: "Research journal", weight: 3 },
  GOV_DATA: { label: "Government data", weight: 2 },
  ASSOCIATION: { label: "Association", weight: 2 },
  LOCAL_BUSINESS: { label: "Local business press", weight: 2 },
  TRADE_PRESS: { label: "Trade press", weight: 1 },
} as const;

export type SourceTier = keyof typeof SOURCE_TIERS;
