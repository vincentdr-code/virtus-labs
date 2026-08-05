#!/usr/bin/env tsx
/**
 * Insert representative NewsItems so the feed and its filters can be exercised
 * without waiting on a live scan. Development and testing only — the rows are
 * clearly marked and `npm run research:scan` will add real items alongside.
 */
import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: url.replace(/^file:/, "") });
const prisma = new PrismaClient({ adapter });

const DEMO = [
  {
    trade: "hvac",
    metro: "miami",
    headline: "Refrigerant transition deadline reaches coastal service fleets",
    summary:
      "Contractors servicing coastal condo portfolios need installed-base visibility by refrigerant type before the next replacement cycle.",
    sourceUrl: "https://example.invalid/demo/hvac-miami-1",
    sourceName: "Demo — ACHR News",
    sourceTier: "TRADE_PRESS",
    category: "regulatory",
    importance: 3,
  },
  {
    trade: "electrical",
    metro: "nova",
    headline: "Interconnection queue delays push data center energization dates",
    summary:
      "Grid capacity, not construction capacity, is setting the schedule on large Loudoun County loads.",
    sourceUrl: "https://example.invalid/demo/elec-nova-1",
    sourceName: "Demo — Utility Dive",
    sourceTier: "TRADE_PRESS",
    category: "market",
    importance: 3,
  },
  {
    trade: "civil",
    metro: "austin",
    headline: "Travis County site plan review timelines lengthen",
    summary:
      "Land development firms working across three counties report no consolidated view of what is blocking what.",
    sourceUrl: "https://example.invalid/demo/civil-austin-1",
    sourceName: "Demo — Austin Business Journal",
    sourceTier: "LOCAL_BUSINESS",
    category: "project",
    importance: 2,
  },
  {
    trade: "environmental",
    metro: "nova",
    headline: "Chesapeake Bay nutrient requirements tighten for new sites",
    summary:
      "Wetlands and stormwater work tied to data center siting sits on the project critical path.",
    sourceUrl: "https://example.invalid/demo/env-nova-1",
    sourceName: "Demo — Virginia DEQ",
    sourceTier: "REGULATORY",
    category: "regulatory",
    importance: 2,
  },
  {
    trade: "architecture",
    metro: "miami",
    headline: "Recertification assessment volume strains documentation workflows",
    summary:
      "Statutory deadlines are firm and the deliverable is document-heavy, usually assembled by hand.",
    sourceUrl: "https://example.invalid/demo/arch-miami-1",
    sourceName: "Demo — Florida DBPR",
    sourceTier: "REGULATORY",
    category: "regulatory",
    importance: 2,
  },
  {
    trade: "plumbing",
    metro: "austin",
    headline: "Water reuse provisions expand under drought conditions",
    summary:
      "Fixture and irrigation specification changes affect commercial multifamily rough-in scope.",
    sourceUrl: "https://example.invalid/demo/plumb-austin-1",
    sourceName: "Demo — TCEQ",
    sourceTier: "REGULATORY",
    category: "regulatory",
    importance: 2,
  },
  {
    trade: "mechanical",
    metro: "national",
    headline: "Private equity consolidation continues across mid-size contractors",
    summary:
      "Platform acquirers expect reporting that formerly family-run shops cannot yet produce.",
    sourceUrl: "https://example.invalid/demo/mech-natl-1",
    sourceName: "Demo — Construction Dive",
    sourceTier: "TRADE_PRESS",
    category: "ma",
    importance: 2,
  },
  {
    trade: "civil",
    metro: "national",
    headline: "Study links LiDAR survey adoption to shorter land development cycles",
    summary:
      "Peer-reviewed work quantifying the gap between drone-equipped firms and paper-redline holdouts.",
    sourceUrl: "https://example.invalid/demo/civil-natl-1",
    sourceName: "Demo — Journal of Construction Engineering (via OpenAlex)",
    sourceTier: "JOURNAL",
    category: "research",
    importance: 1,
  },
];

async function main() {
  let created = 0;
  for (const [i, item] of DEMO.entries()) {
    try {
      await prisma.newsItem.create({
        data: {
          ...item,
          // Stagger dates so ordering is observable.
          publishedAt: new Date(Date.now() - i * 86_400_000),
        },
      });
      created++;
    } catch {
      // Already present.
    }
  }
  console.log(`Demo news: ${created} inserted, ${DEMO.length - created} already present.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
