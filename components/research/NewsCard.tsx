import { ExternalLink } from "lucide-react";
import {
  CATEGORIES,
  getMetro,
  getTrade,
  SOURCE_TIERS,
} from "@/lib/research/taxonomy";
import type { SourceTier } from "@/lib/research/taxonomy";
import { formatDate } from "@/lib/utils";

export interface NewsCardItem {
  id: string;
  trade: string;
  metro: string;
  headline: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  sourceTier: string;
  category: string;
  importance: number;
  publishedAt: Date;
}

/**
 * Importance is encoded in the left stripe as well as the label, so the items
 * that need attention read at a glance without relying on the text.
 */
const STRIPE: Record<number, string> = {
  3: "before:bg-gold",
  2: "before:bg-emerald",
  1: "before:bg-c-border",
};

export function NewsCard({ item }: { item: NewsCardItem }) {
  const trade = getTrade(item.trade)?.name ?? item.trade;
  // Items with no named metro still get a market label — "National" is a real
  // answer, and a blank slot reads as missing data rather than cross-market.
  const metro = getMetro(item.metro)?.name ?? "National";
  const tier = SOURCE_TIERS[item.sourceTier as SourceTier]?.label;
  // Store slugs are terse ("ma"); show the label the taxonomy defines.
  const category =
    CATEGORIES.find((c) => c.slug === item.category)?.label ?? item.category;

  return (
    <article
      className={`relative overflow-hidden rounded-lg border border-c-border bg-bg-secondary p-5 pl-6 transition-colors hover:bg-bg-tertiary before:absolute before:inset-y-0 before:left-0 before:w-1 ${
        STRIPE[item.importance] ?? STRIPE[1]
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.14em]">
        <span className="font-semibold text-emerald-bright">{trade}</span>
        <span className="text-text-secondary">{metro}</span>
        <span className="text-text-tertiary">{category}</span>
        {item.importance >= 3 && (
          <span className="rounded bg-gold px-1.5 py-0.5 font-bold text-bg-primary">
            Worth flagging
          </span>
        )}
      </div>

      <a
        href={item.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-start gap-1.5 font-semibold leading-snug text-text-primary hover:text-gold-bright"
      >
        {item.headline}
        <ExternalLink
          size={13}
          className="mt-1 shrink-0 text-text-tertiary group-hover:text-gold-bright"
        />
      </a>

      {item.summary && (
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          {item.summary}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-text-tertiary">
        <span>{item.sourceName}</span>
        {tier && (
          <>
            <span aria-hidden>·</span>
            <span>{tier}</span>
          </>
        )}
        <span aria-hidden>·</span>
        <span className="tabular-nums">{formatDate(item.publishedAt)}</span>
      </div>
    </article>
  );
}
