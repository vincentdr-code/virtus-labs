"use server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isMetroSlug, isTradeSlug } from "@/lib/research/taxonomy";

export interface NewsFilter {
  trade?: string;
  metro?: string;
  category?: string;
  limit?: number;
}

/**
 * Feed query. Unrecognized filter values are ignored rather than returning an
 * empty list, so a stale bookmarked URL still shows something useful.
 */
export async function getNewsItems(filter: NewsFilter = {}) {
  const where: Record<string, unknown> = {};
  if (filter.trade && isTradeSlug(filter.trade)) where.trade = filter.trade;
  if (filter.metro && isMetroSlug(filter.metro)) where.metro = filter.metro;
  if (filter.category) where.category = filter.category;

  return prisma.newsItem.findMany({
    where,
    orderBy: [{ importance: "desc" }, { publishedAt: "desc" }],
    take: filter.limit ?? 60,
  });
}

/** Recent items for one trade in one metro — used on the deep-dive pages. */
export async function getNewsForVertical(trade: string, limit = 6) {
  return prisma.newsItem.findMany({
    where: { trade },
    orderBy: [{ importance: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });
}

export async function getUnreadCount() {
  return prisma.newsItem.count({ where: { readAt: null } });
}

export async function getLatestScan() {
  return prisma.scanRun.findFirst({ orderBy: { startedAt: "desc" } });
}

export async function markAllRead() {
  await prisma.newsItem.updateMany({
    where: { readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/research");
}

export async function toggleFlag(id: string) {
  const item = await prisma.newsItem.findUnique({ where: { id } });
  if (!item) return null;
  const updated = await prisma.newsItem.update({
    where: { id },
    data: { flagged: !item.flagged },
  });
  revalidatePath("/research");
  return updated;
}

/** Counts per trade and per metro, for the filter pill badges. */
export async function getFeedCounts() {
  const [byTrade, byMetro] = await Promise.all([
    prisma.newsItem.groupBy({ by: ["trade"], _count: { _all: true } }),
    prisma.newsItem.groupBy({ by: ["metro"], _count: { _all: true } }),
  ]);
  return {
    trades: Object.fromEntries(byTrade.map((r) => [r.trade, r._count._all])),
    metros: Object.fromEntries(byMetro.map((r) => [r.metro, r._count._all])),
  };
}
